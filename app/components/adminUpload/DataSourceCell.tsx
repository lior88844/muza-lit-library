import React, { useCallback, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'

import MuzaIcon from '~/icons/MuzaIcon'

import { UploadErrorCodeEnum } from './types/ErrorCode'
import type { UploadItem } from './types/UploadItem'

interface DataSourceCellProps {
  item: UploadItem
  onManualIdChange: (itemId: string, albumId: number | undefined) => void
}

const DataSourceCell: React.FC<DataSourceCellProps> = ({ item, onManualIdChange }) => {
  const [inputValue, setInputValue] = useState(item.manualAlbumId?.toString() || '')

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)

      // Parse and validate the input
      const numericValue = value ? parseInt(value, 10) : undefined
      if (value === '' || (!isNaN(numericValue!) && numericValue! > 0)) {
        onManualIdChange(item.id, numericValue)
      }
    },
    [item.id, onManualIdChange]
  )

  // Don't show anything for items with critical error 1001 (no FLAC files)
  if (item.errorCode === UploadErrorCodeEnum.ALL_FILES_INVALID) {
    return <div className='admin-upload-table__data-source-loading'>-</div>
  }

  // Show loading spinner while looking up
  if (item.isLookingUp) {
    return (
      <div className='admin-upload-table__data-source-loading'>
        <FaSpinner className='admin-upload-table__loading-spinner' />
      </div>
    )
  }

  // Show "ID found" badge if album was found
  if (item.albumLookup?.mbId) {
    return (
      <div className='admin-upload-table__data-source-found'>
        <a
          href={`https://musicbrainz.org/release/${item.albumLookup.mbId}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='admin-upload-table__id-found-badge'>
            <MuzaIcon iconName='Check' className='admin-upload-table__check-icon' />
            ID found
          </div>
        </a>
      </div>
    )
  }

  // Show input field for manual ID entry
  return (
    <div className='admin-upload-table__data-source-input'>
      <div
        className={`admin-upload-table__input-wrapper ${!item.hasValidId && !item.isLookingUp ? 'admin-upload-table__input-wrapper--error' : ''}`}
      >
        <input
          type='number'
          placeholder='Type in ID'
          value={inputValue}
          onChange={handleInputChange}
          min='1'
          className='admin-upload-table__id-input'
        />
      </div>
    </div>
  )
}

export default DataSourceCell
