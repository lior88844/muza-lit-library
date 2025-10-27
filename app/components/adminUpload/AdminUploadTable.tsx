import './AdminUploadTable.scss'

import React, { useMemo } from 'react'

import { isItemUploadReady } from '~/components/adminUpload/services/adminUploadService'
import MuzaButton from '~/controls/MuzaButton'
import MuzaIcon from '~/icons/MuzaIcon'

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
          className={`admin-upload-table__page-button ${i === currentPage ? 'admin-upload-table__page-button--active' : ''}`}
        >
          {i}
        </button>
      )
    }

    return (
      <div className='admin-upload-table__pagination'>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className='admin-upload-table__nav-button'
        >
          <MuzaIcon iconName='ChevronLeft' />
          Previous
        </button>

        <div className='admin-upload-table__page-numbers'>
          {pages}
          <div
            className={`admin-upload-table__ellipsis ${endPage < totalPages ? '' : 'admin-upload-table__ellipsis--hidden'}`}
          >
            <MuzaIcon iconName='ellipsis' />
          </div>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className='admin-upload-table__nav-button'
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
    <div className='admin-upload-table'>
      <div className='admin-upload-table__container'>
        <table className='admin-upload-table__table'>
          <thead className='admin-upload-table__head'>
            <tr className='admin-upload-table__header-row'>
              <th className='admin-upload-table__header admin-upload-table__header--number'>
                {/* Empty header for row numbers */}
              </th>
              <th className='admin-upload-table__header admin-upload-table__header--checkbox'>
                <div
                  className={`admin-upload-table__checkbox-wrapper ${isAllSelected ? 'admin-upload-table__checkbox-wrapper--checked' : ''}`}
                >
                  <input
                    type='checkbox'
                    checked={isAllSelected}
                    onChange={handleSelectAllChange}
                    className='admin-upload-table__checkbox'
                  />
                  <div className='admin-upload-table__checkbox-visual'>
                    <MuzaIcon
                      iconName='CheckmarkSquare'
                      className='admin-upload-table__checkmark'
                    />
                  </div>
                </div>
              </th>
              <th className='admin-upload-table__header admin-upload-table__header--folder'>
                Folder
              </th>
              <th className='admin-upload-table__header admin-upload-table__header--upload'>
                Upload
              </th>
              <th className='admin-upload-table__header admin-upload-table__header--data-source'>
                Data Source
              </th>
              <th className='admin-upload-table__header admin-upload-table__header--cover'>
                Cover
              </th>
              <th className='admin-upload-table__header admin-upload-table__header--errors'>
                Errors
              </th>
            </tr>
          </thead>
          <tbody className='admin-upload-table__body'>
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

      <div className='admin-upload-table__footer'>
        <div className='admin-upload-table__info'>
          <span>Show</span>
          <select
            id='items-per-page'
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
            className='admin-upload-table__items-per-page'
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>of {totalItems} rows</span>
        </div>

        {totalPages > 1 && renderPagination()}

        <div className='admin-upload-table__actions'>
          <MuzaButton
            content='Cancel Selection'
            iconName='trash'
            onClick={onCancelSelection}
            disabled={selectedItemIds.size === 0}
            className='admin-upload-table__cancel-button'
          />
          <MuzaButton
            content={isUploading ? 'Uploading...' : 'Process & Upload'}
            iconName={isUploading ? 'Clock8' : 'upload'}
            onClick={onProcessUpload}
            disabled={selectedItemIds.size === 0 || isUploading}
            className='admin-upload-table__process-button'
          />
        </div>
      </div>
    </div>
  )
}

export default AdminUploadTable
