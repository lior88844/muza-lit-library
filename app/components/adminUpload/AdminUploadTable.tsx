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
            'w-9 h-9 flex items-center justify-center text-base font-normal rounded-md cursor-pointer transition-all duration-200 ease-in-out border-none bg-transparent text-muted-foreground hover:bg-secondary',
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
          className='flex items-center gap-2 bg-none border-none cursor-pointer text-base font-normal text-muted-foreground transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:text-background-dark'
        >
          <MuzaIcon iconName='ChevronLeft' />
          Previous
        </button>

        <div className='flex items-center gap-1'>
          {pages}
          <div
            className={cn(
              'w-9 h-9 flex items-center justify-center text-muted-foreground',
              endPage >= totalPages && 'opacity-0 pointer-events-none'
            )}
          >
            <MuzaIcon iconName='ellipsis' className='w-4 h-4' />
          </div>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className='flex items-center gap-2 bg-none border-none cursor-pointer text-base font-normal text-muted-foreground transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:text-background-dark'
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
    <div className='w-full mt-0 flex flex-col flex-1 min-h-0'>
      <div className='w-full overflow-x-auto border border-border-light rounded-md bg-background flex-1 flex flex-col min-h-0'>
        <table className='w-full border-collapse font-sans min-w-[800px]'>
          <thead className='bg-background'>
            <tr className='border-b border-border-light'>
              <th className='py-2 px-2 font-medium text-base text-muted-foreground leading-5 border-b border-border-light w-[50px]'>
                {/* Empty header for row numbers */}
              </th>
              <th className='py-2 px-2 font-medium text-base text-muted-foreground leading-5 border-b border-border-light w-[50px] text-center align-middle'>
                <div
                  className={cn(
                    'flex justify-center items-center relative h-5',
                    isAllSelected &&
                      '[&_.checkmark]:opacity-100 [&_.checkmark]:scale-100 [&_.checkbox-visual]:bg-transparent [&_.checkbox-visual]:border-transparent'
                  )}
                >
                  <input
                    type='checkbox'
                    checked={isAllSelected}
                    onChange={handleSelectAllChange}
                    className='w-4 h-4 opacity-0 absolute cursor-pointer z-1'
                  />
                  <div className='w-4 h-4 border-[1.33px] border-primary rounded-sm bg-background flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out relative checkbox-visual'>
                    <MuzaIcon
                      iconName='CheckmarkSquare'
                      className='w-4 h-4 opacity-0 scale-[0.8] transition-all duration-200 ease-in-out checkmark'
                    />
                  </div>
                </div>
              </th>
              <th className='py-2 px-2 font-medium text-base text-muted-foreground leading-5 border-b border-border-light w-[180px] max-w-[180px]'>
                Folder
              </th>
              <th className='py-2 px-2 font-medium text-base text-muted-foreground leading-5 border-b border-border-light auto min-w-[300px]'>
                Upload
              </th>
              <th className='py-2 px-2 font-medium text-base text-muted-foreground leading-5 border-b border-border-light w-[250px] max-w-[250px]'>
                Data Source
              </th>
              <th className='py-2 px-2 font-medium text-base text-muted-foreground leading-5 border-b border-border-light text-center w-[150px] max-w-[150px]'>
                Cover
              </th>
              <th className='py-2 px-2 font-medium text-base text-muted-foreground leading-5 border-b border-border-light min-w-max text-left'>
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

      <div className='flex items-center justify-between gap-4 py-4 px-6 border-t border-border-light bg-background'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span>Show</span>
          <select
            id='items-per-page'
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
            className='h-9 px-3 py-0 text-sm font-normal border border-border-light rounded-md bg-background text-muted-foreground outline-none transition-colors duration-200 cursor-pointer hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20'
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
            className='w-fit h-fit bg-secondary text-text-dark border-none rounded-full py-2 px-4 font-medium text-base cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-2 hover:bg-(--muza-button-hover-background) disabled:opacity-50 disabled:cursor-not-allowed [&_span]:text-base [&_span]:font-medium [&_span]:text-text-dark [&_i]:flex [&_i]:items-center [&_i]:justify-center [&_svg]:text-text-dark [&_svg]:w-4 [&_svg]:h-4'
          />
          <MuzaButton
            content={isUploading ? 'Uploading...' : 'Process & Upload'}
            iconName={isUploading ? 'Clock8' : 'upload'}
            onClick={onProcessUpload}
            disabled={selectedItemIds.size === 0 || isUploading}
            className='w-fit h-fit bg-primary text-muted border-none rounded-full py-2 px-4 font-medium text-base cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-2 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] hover:bg-(--colors_primary_dark) disabled:opacity-50 disabled:cursor-not-allowed [&_span]:text-base [&_span]:font-medium [&_span]:text-muted [&_i]:flex [&_i]:items-center [&_i]:justify-center [&_svg]:text-muted [&_svg]:w-4 [&_svg]:h-4'
          />
        </div>
      </div>
    </div>
  )
}

export default AdminUploadTable
