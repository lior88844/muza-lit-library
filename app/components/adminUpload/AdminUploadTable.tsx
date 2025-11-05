import React, { useMemo } from 'react'

import { isItemUploadReady } from '~/components/adminUpload/services/adminUploadService'
import MuzaButton from '~/controls/MuzaButton'
import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

import { AdminUploadTableRow } from './AdminUploadTableRow'
import type { UploadItem } from './types/UploadItem'

interface AdminUploadTableProps {
  items: UploadItem[]
  selectedItemIds: Set<string>
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onItemSelect: (itemId: string) => void
  onSelectAll: (selected: boolean) => void
  onCancelSelection: () => void
  onProcessUpload: () => void
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  onManualIdChange: (itemId: string, albumId: string | undefined) => void
  onManualDiscogsIdChange: (itemId: string, discogsId: string | undefined) => void
  onCoverUrlChange: (itemId: string, url: string | undefined) => void
  onDiscoverAlbum: (item: UploadItem) => void
}

const AdminUploadTable: React.FC<AdminUploadTableProps> = ({
  items,
  selectedItemIds,
  currentPage,
  itemsPerPage,
  totalItems,
  onItemSelect,
  onSelectAll,
  onCancelSelection,
  onProcessUpload,
  onPageChange,
  onItemsPerPageChange,
  onManualIdChange,
  onManualDiscogsIdChange,
  onCoverUrlChange,
  onDiscoverAlbum,
}) => {
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const selectableItems = items.filter(item => isItemUploadReady(item))
  const isAllSelected =
    selectedItemIds.size === selectableItems.length && selectableItems.length > 0

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked)
  }

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 3

    // Calculate the range of pages to show
    let startPage = Math.max(1, currentPage - 1)
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Create page buttons
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={cn(
            'text-muted-foreground hover:bg-secondary flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-base font-normal transition-all duration-200 ease-in-out',
            i === currentPage && 'bg-primary text-background font-medium'
          )}
        >
          {i}
        </button>
      )
    }

    return (
      <div className='flex items-center gap-4'>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className='text-muted-foreground hover:text-background-dark flex cursor-pointer items-center gap-2 border-none bg-none text-base font-normal transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50'
        >
          <MuzaIcon iconName='ChevronLeft' />
          Previous
        </button>

        <div className='flex items-center gap-1'>
          {pages}
          <div
            className={cn(
              'text-muted-foreground flex h-9 w-9 items-center justify-center',
              endPage >= totalPages && 'pointer-events-none opacity-0'
            )}
          >
            <MuzaIcon iconName='ellipsis' className='h-4 w-4' />
          </div>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className='text-muted-foreground hover:text-background-dark flex cursor-pointer items-center gap-2 border-none bg-none text-base font-normal transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50'
        >
          Next
          <MuzaIcon iconName='ChevronRight' />
        </button>
      </div>
    )
  }

  const isUploading =
    Array.from(selectedItemIds).some(
      itemId => items.find(item => item.id === itemId)?.loadingState?.status === 'loading'
    ) || false
  if (items.length === 0) {
    return null
  }

  return (
    <div className='mt-0 flex min-h-0 w-full flex-1 flex-col'>
      <div className='border-border-light bg-background flex min-h-0 w-full flex-1 flex-col overflow-x-auto rounded-md border'>
        <table className='w-full min-w-[800px] border-collapse font-sans'>
          <thead className='bg-background'>
            <tr className='border-border-light border-b'>
              <th className='text-muted-foreground border-border-light w-[50px] border-b px-2 py-2 text-base leading-5 font-medium'>
                {/* Empty header for row numbers */}
              </th>
              <th className='text-muted-foreground border-border-light w-[50px] border-b px-2 py-2 text-center align-middle text-base leading-5 font-medium'>
                <div
                  className={cn(
                    'relative flex h-5 items-center justify-center',
                    isAllSelected &&
                      '[&_.checkbox-visual]:border-transparent [&_.checkbox-visual]:bg-transparent [&_.checkmark]:scale-100 [&_.checkmark]:opacity-100'
                  )}
                >
                  <input
                    type='checkbox'
                    checked={isAllSelected}
                    onChange={handleSelectAllChange}
                    className='absolute z-1 h-4 w-4 cursor-pointer opacity-0'
                  />
                  <div className='border-primary bg-background checkbox-visual relative flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm border-[1.33px] transition-all duration-200 ease-in-out'>
                    <MuzaIcon
                      iconName='CheckmarkSquare'
                      className='checkmark h-4 w-4 scale-[0.8] opacity-0 transition-all duration-200 ease-in-out'
                    />
                  </div>
                </div>
              </th>
              <th className='text-muted-foreground border-border-light w-[180px] max-w-[180px] border-b px-2 py-2 text-base leading-5 font-medium'>
                Folder
              </th>
              <th className='text-muted-foreground border-border-light auto min-w-[300px] border-b px-2 py-2 text-base leading-5 font-medium'>
                Upload
              </th>
              <th className='text-muted-foreground border-border-light w-[250px] max-w-[250px] border-b px-2 py-2 text-base leading-5 font-medium'>
                Data Source
              </th>
              <th className='text-muted-foreground border-border-light w-[150px] max-w-[150px] border-b px-2 py-2 text-center text-base leading-5 font-medium'>
                Cover
              </th>
              <th className='text-muted-foreground border-border-light min-w-max border-b px-2 py-2 text-left text-base leading-5 font-medium'>
                Errors
              </th>
            </tr>
          </thead>
          <tbody className='bg-background'>
            {paginatedItems.map((item, idx) => (
              <AdminUploadTableRow
                key={item.id}
                index={(currentPage - 1) * itemsPerPage + idx}
                isSelected={selectedItemIds.has(item.id)}
                item={item}
                onManualIdChange={onManualIdChange}
                onManualDiscogsIdChange={onManualDiscogsIdChange}
                onCoverUrlChange={onCoverUrlChange}
                onItemSelect={onItemSelect}
                onDiscoverAlbum={onDiscoverAlbum}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className='border-border-light bg-background flex items-center justify-between gap-4 border-t px-6 py-4'>
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <span>Show</span>
          <select
            id='items-per-page'
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
            className='border-border-light bg-background text-muted-foreground hover:border-primary focus:border-primary focus:ring-primary/20 h-9 cursor-pointer rounded-md border px-3 py-0 text-sm font-normal transition-colors duration-200 outline-none focus:ring-2'
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>of {totalItems} rows</span>
        </div>

        {totalPages > 1 && renderPagination()}

        <div className='flex items-center gap-4'>
          <MuzaButton
            content='Cancel Selection'
            iconName='trash'
            onClick={onCancelSelection}
            disabled={selectedItemIds.size === 0}
            className='bg-secondary text-text-dark [&_span]:text-text-dark [&_svg]:text-text-dark flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full border-none px-4 py-2 text-base font-medium transition-all duration-200 ease-in-out hover:bg-(--muza-button-hover-background) disabled:cursor-not-allowed disabled:opacity-50 [&_i]:flex [&_i]:items-center [&_i]:justify-center [&_span]:text-base [&_span]:font-medium [&_svg]:h-4 [&_svg]:w-4'
          />
          <MuzaButton
            content={isUploading ? 'Uploading...' : 'Process & Upload'}
            iconName={isUploading ? 'Clock8' : 'upload'}
            onClick={onProcessUpload}
            disabled={selectedItemIds.size === 0 || isUploading}
            className='bg-primary text-muted [&_span]:text-muted [&_svg]:text-muted flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full border-none px-4 py-2 text-base font-medium shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] transition-all duration-200 ease-in-out hover:bg-(--colors_primary_dark) disabled:cursor-not-allowed disabled:opacity-50 [&_i]:flex [&_i]:items-center [&_i]:justify-center [&_span]:text-base [&_span]:font-medium [&_svg]:h-4 [&_svg]:w-4'
          />
        </div>
      </div>
    </div>
  )
}

export default AdminUploadTable
