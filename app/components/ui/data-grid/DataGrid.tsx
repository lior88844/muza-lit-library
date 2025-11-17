import './ag-grid-theme.css'

import {
  AllCommunityModule,
  type CellClickedEvent,
  type ColDef,
  CsvExportModule,
  type GridReadyEvent,
  GridStateModule,
  type ICellRendererParams,
  ModuleRegistry,
  QuickFilterModule,
  type RowClickedEvent,
  type RowDragEndEvent,
  themeAlpine,
} from 'ag-grid-community'
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

import { Button } from '../button'
import ColumnOrganizer from './ColumnOrganizer'

ModuleRegistry.registerModules([
  AllCommunityModule,
  CsvExportModule,
  QuickFilterModule,
  GridStateModule,
])

// Use custom Muza theme via CSS class instead of themeAlpine
interface DataGridProps<T> extends Omit<AgGridReactProps, 'rowData'> {
  rowData: T[]
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  hideSearch?: boolean
  hideExport?: boolean
  searchPlaceholder?: string
  entityName?: string
  showRowNumbers?: boolean
  hideHeader?: boolean
  hideColumnOrganizer?: boolean
  columnDefs?: ColDef<T>[]
  actions?: React.ReactNode
  onRowOrderChange?: (order: T[]) => void
}
export const DataGrid = <T,>({
  rowData = [],
  columnDefs = [],
  onRowOrderChange,
  onCellClicked,
  onRowClicked,
  onGridReady,
  rowSelection,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = false,
  paginationPageSize = 10,
  className = '',
  defaultColDef = {},
  animateRows = true,
  domLayout = 'autoHeight',
  hideSearch = false,
  hideExport = false,
  searchPlaceholder = 'Search...',
  entityName = 'default',
  showRowNumbers,
  hideHeader = false,
  hideColumnOrganizer = false,
  gridOptions: gridOptionsProps = {},
  rowHeight = 48,
  actions,
  ...props
}: DataGridProps<T>) => {
  const gridRef = useRef<AgGridReact>(null)
  const [searchText, setSearchText] = useState('')
  const [columnOrder, setColumnOrder] = useState<string[]>([])

  // Initialize column order from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`${entityName}ColumnsState`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[]
        if (parsed && Array.isArray(parsed)) {
          const validFields = new Set(columnDefs.map(c => c.field as string))
          const filteredColumns = parsed.filter(col => validFields.has(col))
          setColumnOrder(filteredColumns)
        }
      } catch (error) {
        console.error(error)
      }
    } else {
      setColumnOrder(
        columnDefs
          .filter(col => col.colId !== 'actions' && col.hide !== true)
          .map(col => col.field as string)
      )
    }
  }, [columnDefs, entityName])

  const onSetColumnsState = useCallback(
    (columns: string[]) => {
      setColumnOrder(columns)
      localStorage.setItem(`${entityName}ColumnsState`, JSON.stringify(columns))
    },
    [entityName]
  )

  // Handle search text changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value)
  }, [])

  // Handle export
  const handleExport = useCallback(() => {
    if (gridRef.current) {
      const gridApi = gridRef.current.api
      gridApi.exportDataAsCsv({
        fileName: `${entityName}_export.csv`,
        allColumns: true,
      })
    }
  }, [entityName])

  // Default column definitions
  const defaultColDefs = useMemo(
    () => ({
      sortable: enableSorting,
      filter: enableFiltering,
      resizable: true,
      minWidth: 100,
      flex: 1,
      ...defaultColDef,
    }),
    [enableSorting, enableFiltering, defaultColDef]
  )

  // Prepare columns for ColumnOrganizer
  const columnOrganizerColumns = useMemo(() => {
    return columnDefs
      .filter(col => col.colId !== 'actions')
      .map(col => ({
        field: col.field || col.colId,
        headerName: col.headerName || col.field,
      }))
  }, [columnDefs])

  // Order and filter columns based on columnOrder
  const visibleColumnDefs = useMemo(() => {
    if (columnOrder.length === 0) {
      return columnDefs
    }

    // Only include columns in columnOrder, in that order, and not hidden
    const hiddenColumns = columnDefs
      .filter(c => !columnOrder.includes(c.field as string))
      .map(c => ({
        ...c,
        hide: true,
      }))

    const colMap = new Map(columnDefs.map(col => [col.field as string, col]))
    const actionsCol = columnDefs.find(col => col.colId === 'actions')
    const res: ColDef[] = columnOrder
      .filter(field => colMap.has(field))
      .map(field => ({
        ...colMap.get(field),
        hide: false,
      }))
      .filter(col => col.colId !== 'actions')

    // Add row number column if enabled
    if (showRowNumbers) {
      res.unshift({
        colId: 'rowNumber',
        headerName: '#',
        filter: false,
        sortable: false,
        minWidth: 60,
        maxWidth: 80,
        width: 60,
        hide: false,
        cellRenderer: (params: ICellRendererParams) => {
          return params.node.rowIndex! + 1
        },
        cellStyle: { textAlign: 'center', fontWeight: 'bold' },
      })
    }

    if (actionsCol) {
      res.push({
        ...actionsCol,
        hide: false,
      })
    }
    return [...res, ...hiddenColumns]
  }, [columnDefs, columnOrder, showRowNumbers])

  const onRowDragEnd = useCallback(
    ({ api, overIndex, node }: RowDragEndEvent) => {
      if (!onRowOrderChange) return
      // Get the current order
      const currentOrder: T[] = []
      api.forEachNode(node => {
        if (node.data) currentOrder.push(node.data as T)
      })
      // Find the dragged node
      const movingNode = node.data as T
      // Remove the moving node from its old position
      const oldIndex = currentOrder.findIndex(item => item === movingNode)
      if (oldIndex === -1) {
        onRowOrderChange(currentOrder)
        return
      }
      const newOrder = [...currentOrder]
      newOrder.splice(oldIndex, 1)
      newOrder.splice(overIndex, 0, movingNode)
      onRowOrderChange(newOrder)
    },
    [onRowOrderChange]
  )
  // Handle cell click
  const handleCellClicked = useCallback(
    (event: CellClickedEvent) => {
      if (onCellClicked) {
        onCellClicked(event)
      }
    },
    [onCellClicked]
  )

  // Handle row click
  const handleRowClicked = useCallback(
    (event: RowClickedEvent) => {
      if (onRowClicked) {
        onRowClicked(event)
      }
    },
    [onRowClicked]
  )

  // Handle grid ready
  const handleGridReady = useCallback(
    (event: GridReadyEvent) => {
      if (onGridReady) {
        onGridReady(event)
      }
    },
    [onGridReady]
  )
  const myTheme = useMemo(() => themeAlpine.withParams({ rowHeight }), [rowHeight])

  // Grid options
  const gridOptions = useMemo(
    () => ({
      rowData,
      columnDefs: visibleColumnDefs,
      defaultColDef: defaultColDefs,
      rowSelection,
      animateRows,
      domLayout,
      pagination: enablePagination,
      paginationPageSize,
      quickFilterText: searchText,
      ...gridOptionsProps,
    }),
    [
      rowData,
      visibleColumnDefs,
      defaultColDefs,
      rowSelection,
      animateRows,
      domLayout,
      enablePagination,
      paginationPageSize,
      searchText,
      gridOptionsProps,
    ]
  )

  return (
    <div className={cn('flex h-full w-full flex-col', className)}>
      {/* Toolbar with search, export, and column organizer */}
      {!hideHeader && (
        <div className='border-border-light bg-muted flex items-center gap-3 border-b p-3'>
          {!hideSearch && (
            <input
              type='text'
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={e => handleSearchChange(e.target.value)}
              className='border-border-light text-text-secondary flex-1 rounded-2xl border px-4 py-2 font-["Narkis"] text-sm'
            />
          )}
          {!hideExport && (
            <Button title='Export' size='sm' onClick={handleExport} className='btn-icon'>
              <MuzaIcon iconName='download' />
            </Button>
          )}
          {!hideColumnOrganizer && (
            <ColumnOrganizer
              columns={columnOrganizerColumns}
              columnFieldsToShow={columnOrder}
              onChange={onSetColumnsState}
            />
          )}
          {actions}
        </div>
      )}

      {/* Grid with custom Muza theme */}
      <div className='ag-theme-muza' style={{ height: 'calc(100% - 63px)', overflowY: 'auto' }}>
        <AgGridReact
          ref={gridRef}
          theme={myTheme}
          className='border-border-light rounded-lg border'
          {...gridOptions}
          domLayout='autoHeight'
          // loadingOverlayComponent={() => <Spinner animation='border' role='status' size='sm' />}
          onCellClicked={handleCellClicked}
          onRowClicked={handleRowClicked}
          onGridReady={handleGridReady}
          onRowDragEnd={onRowDragEnd}
          suppressRowDrag={!onRowOrderChange}
          {...props}
        />
      </div>
    </div>
  )
}

export default DataGrid
