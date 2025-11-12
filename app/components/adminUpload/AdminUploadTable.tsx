import type {
  ColDef,
  GridOptions,
  SelectionChangedEvent,
  ValueGetterParams,
} from 'ag-grid-community'
import { Fragment, useCallback, useMemo } from 'react'

import { AppTooltip } from '~/components/ui/AppTooltip'
import { Button } from '~/components/ui/button'
import { DataGrid } from '~/components/ui/data-grid/DataGrid'
import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

import CoverCell from './CoverCell'
import DataSourceCell from './DataSourceCell'
import { isItemUploadReady } from './services/adminUploadService'
import { StatusCellRenderer } from './StatusCellRenderer'
import { UPLOAD_ERROR_CODES, UploadErrorCodeEnum } from './types/ErrorCode'
import type { UploadItem } from './types/UploadItem'

interface AdminUploadTableProps {
  items: UploadItem[]
  selectedItemIds: Set<string>
  onSelectionChange: (selectedItemIds: string[]) => void
  onProcessUpload: () => void
  onManualIdChange: (itemId: string, albumId: string | undefined) => void
  onManualDiscogsIdChange: (itemId: string, discogsId: string | undefined) => void
  onCoverUrlChange: (itemId: string, url: string | undefined) => void
  onDiscoverAlbum: (item: UploadItem) => void
}

const AdminUploadTable: React.FC<AdminUploadTableProps> = ({
  items,
  selectedItemIds,
  onSelectionChange,
  onProcessUpload,
  onManualIdChange,
  onManualDiscogsIdChange,
  onCoverUrlChange,
  onDiscoverAlbum,
}) => {
  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Column definitions for AG Grid
  const selectionColumnDef = useMemo(
    () => ({
      minWidth: 250,
      flex: 1,
      resizable: true,
      cellRenderer: (params: { data: UploadItem }) => {
        const item = params.data
        const totalFiles = item.files.flat().length
        const artistName = item.metadata?.artist || item.name
        const albumName = item.metadata?.album
        return (
          <div className='flex flex-col'>
            <span className='max-w-[300px] text-base leading-5 text-wrap'>
              {artistName || ''} {albumName ? ' - ' : ''} {albumName}
            </span>
            <div className='flex flex-col gap-1'>
              <div className='flex flex-wrap items-center justify-start gap-2'>
                <MuzaIcon iconName='folder' />
                <span className='text-text-tertiary text-xs'>
                  {totalFiles} files
                  {item.files.length > 1 && ` (${item.files.length} discs)`}
                </span>{' '}
                -<span className='text-text-secondary text-sm'>{formatFileSize(item.size)}</span>
              </div>
            </div>
          </div>
        )
      },
    }),
    []
  )
  const columnDefs = useMemo<ColDef<UploadItem>[]>(
    () => [
      {
        colId: 'folder',
        headerName: 'Status',
        width: 220,
        minWidth: 180,
        flex: 3,
        cellRenderer: StatusCellRenderer,
      },
      {
        field: 'manualAlbumId',
        headerName: 'Data Source',
        minWidth: 250,
        flex: 2,
        sortable: true,
        valueGetter: (params: ValueGetterParams<UploadItem>) => {
          const item = params.data!
          return !!item.manualAlbumId || !!item.discoverRes?.discogsId || !!item.discoverRes?.mbId
        },
        cellRenderer: (params: { data: UploadItem }) => {
          return (
            <DataSourceCell
              item={params.data}
              onManualIdChange={onManualIdChange}
              onManualDiscogsIdChange={onManualDiscogsIdChange}
              onDiscoverAlbum={onDiscoverAlbum}
            />
          )
        },
      },
      {
        field: 'manualCoverImgUrl',
        headerName: 'Cover',
        maxWidth: 180,
        sortable: true,
        valueGetter: (params: ValueGetterParams<UploadItem>) => {
          const item = params.data!
          return !!item.manualCoverImgUrl || !!item.discoverRes?.coverUrl
        },
        cellRenderer: (params: { data: UploadItem }) => {
          return <CoverCell item={params.data} onCoverUrlChange={onCoverUrlChange} />
        },
      },
      {
        field: 'phase',
        headerName: 'Status',
        width: 180,
        minWidth: 150,
        sortable: true,
        valueGetter: (params: ValueGetterParams<UploadItem>) => {
          const item = params.data!
          const errors =
            item.prepareRes?.errors ||
            item.uploadErrors ||
            (item.errorCode ? [item.errorCode!] : [])
          return errors.length > 0 || item.prepareRes?.success === false || item.phase === 'error'
        },
        cellRenderer: (params: { data: UploadItem }) => {
          const item = params.data
          const errors = [
            ...(item.prepareRes?.errors || []),
            ...(item.errorCode ? [item.errorCode] : []),
          ]

          if (errors.length > 0 || item.phase === 'error') {
            return <ErrorBadge errorCodes={errors} item={item} uploadErrors={item.uploadErrors} />
          } else if (item.phase === 'completed') {
            return <UploadedBadge />
          } else {
            return <SuccessBadge />
          }
        },
      },
    ],
    [onManualIdChange, onManualDiscogsIdChange, onCoverUrlChange, onDiscoverAlbum]
  )

  // Handle selection change
  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<UploadItem>) => {
      if (event.source !== 'rowDataChanged') {
        const selectedRows = event.selectedNodes?.map(node => node.data!.id) || []
        onSelectionChange(selectedRows)
      }
    },
    [onSelectionChange]
  )

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = items.length
    const discoveredItems = items.filter(
      item => item.discoverRes?.mbId && item.discoverRes?.discogsId
    ).length
    const uploadedItems = items.filter(item => item.phase === 'completed').length
    return { totalItems, discoveredItems, uploadedItems }
  }, [items])

  // Custom action buttons in the toolbar
  const actionButtons = useMemo(
    () => (
      <div className='flex w-full items-center justify-between gap-4'>
        <div className='flex grow items-center gap-6'>
          <span className='text-text-secondary text-sm'>
            Discovered: <span className='font-medium'>{stats.discoveredItems}</span>/
            <span className='font-medium'>{stats.totalItems}</span>
          </span>
          <span className='text-text-secondary text-sm'>
            Uploaded: <span className='font-medium'>{stats.uploadedItems}</span>/
            <span className='font-medium'>{stats.totalItems}</span>
          </span>
        </div>
        <Button
          variant='default'
          onClick={onProcessUpload}
          disabled={selectedItemIds.size === 0}
          className='flex items-center gap-2'
        >
          <MuzaIcon iconName='upload' className='h-4 w-4' />
          Process & Upload
        </Button>
      </div>
    ),
    [selectedItemIds.size, onProcessUpload, stats]
  )

  const gridOptions = useMemo(
    (): GridOptions<UploadItem> => ({
      rowSelection: {
        isRowSelectable: params => {
          return isItemUploadReady(params.data!)
        },
        mode: 'multiRow',
      },
    }),
    []
  )
  if (items.length === 0) {
    return null
  }

  return (
    <div className='mt-0 flex min-h-0 w-full flex-1 flex-col'>
      <DataGrid<UploadItem>
        rowData={items}
        className='h-[calc(100vh-var(--admin-header-height)-170px)]'
        columnDefs={columnDefs}
        rowSelection='multiple'
        onSelectionChanged={handleSelectionChanged}
        selectionColumnDef={selectionColumnDef}
        hideSearch={true}
        getRowId={params => params.data!.id}
        hideExport={true}
        hideColumnOrganizer={true}
        entityName='adminUpload'
        rowHeight={80}
        actions={actionButtons}
        gridOptions={gridOptions}
        defaultColDef={{
          sortable: false,
          filter: false,
          resizable: true,
        }}
        suppressRowDrag
      />
    </div>
  )
}

// Success Badge Component
const SuccessBadge = () => (
  <div className='flex items-center justify-center gap-1 rounded-sm bg-[#15803d] px-2 py-[2px] pb-1 font-sans text-sm leading-none font-normal whitespace-nowrap text-[#f9fafb]'>
    <MuzaIcon iconName='Check' className='h-3 w-3 text-[#f9fafb]' />
    No Errors
  </div>
)

// Uploaded Badge Component
const UploadedBadge = () => (
  <div className='flex items-center justify-center gap-1 rounded-sm bg-[#7c3aed] px-2 py-[2px] pb-1 font-sans text-sm leading-none font-normal whitespace-nowrap text-[#f9fafb]'>
    <MuzaIcon iconName='Check' className='h-3 w-3 text-[#f9fafb]' />
    Uploaded
  </div>
)

// Error Badge Component with Tooltip
const ErrorBadge: React.FC<{
  errorCodes: UploadErrorCodeEnum[]
  item: UploadItem
  uploadErrors?: string[]
}> = ({ errorCodes, item, uploadErrors }) => {
  const errorInfos = errorCodes.map(errorCode => UPLOAD_ERROR_CODES[errorCode]).filter(Boolean)

  // Add upload errors from S3
  if (uploadErrors && uploadErrors.length > 0) {
    uploadErrors.forEach(error => {
      errorInfos.push({
        code: UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR,
        title: 'S3 Upload Error',
        description: error,
      })
    })
  }

  // Add prepare error
  if (!errorInfos.length && item.prepareRes?.success === false) {
    errorInfos.push({
      code: UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR,
      title: 'Album Preparation Error',
      description: item.prepareRes?.message || 'Failed to prepare album for upload.',
    })
  }

  if (errorInfos.length === 0) {
    return null
  }

  const errorCode = errorInfos[0].code
  const isOrangeError = errorCode === 1002 || errorCode === 1003 || errorCode === 1004

  return (
    <AppTooltip
      triggerProps={{
        className: cn(
          'inline-flex items-center justify-center py-[2px] px-2 pb-1 rounded-sm font-sans text-sm font-normal leading-none text-[#f9fafb] cursor-pointer transition-opacity duration-200 ease-in-out whitespace-nowrap hover:opacity-90 border-0',
          isOrangeError ? 'bg-[#ea580c]' : 'bg-[#dc2626]'
        ),
      }}
      content={errorInfos.map((errorInfo, idx) => (
        <Fragment key={idx}>
          <p className='mb-1 text-sm font-medium text-[#f9fafb]'>{errorInfo.title}</p>
          <p className='text-[13px] leading-[1.4] font-normal text-[#d1d5db]'>
            {errorInfo.description}
          </p>
        </Fragment>
      ))}
    >
      Error: {errorInfos[0].code} {errorInfos.length > 1 ? `+${errorInfos.length - 1}` : ''}
    </AppTooltip>
  )
}

export default AdminUploadTable
