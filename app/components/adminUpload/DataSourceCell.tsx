import React, { useCallback, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'

import MuzaButton from '~/controls/MuzaButton'
import MuzaIcon from '~/icons/MuzaIcon'

import { UploadErrorCodeEnum } from './types/ErrorCode'
import type { UploadItem } from './types/UploadItem'

interface DataSourceCellProps {
  item: UploadItem
  onManualIdChange: (itemId: string, albumId: string) => void
  onManualDiscogsIdChange: (itemId: string, discogsId: string) => void
  onDiscoverAlbum: (item: UploadItem) => void
}

const DataSourceCell: React.FC<DataSourceCellProps> = ({
  item,
  onManualIdChange,
  onManualDiscogsIdChange,
  onDiscoverAlbum,
}) => {
  const [inputValue, setInputValue] = useState(item.manualAlbumId?.toString() || '')
  const [discogsInputValue, setDiscogsInputValue] = useState(item.manualDiscogsId?.toString() || '')

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)

      // Parse and validate the input
      onManualIdChange(item.id, value)
    },
    [item.id, onManualIdChange]
  )

  const handleDiscogsInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setDiscogsInputValue(value)

      // Update the manual Discogs ID
      onManualDiscogsIdChange(item.id, value)
    },
    [item.id, onManualDiscogsIdChange]
  )

  // Don't show anything for items with critical error 1001 (no FLAC files)
  if (item.errorCode === UploadErrorCodeEnum.ALL_FILES_INVALID) {
    return <div className='admin-upload-table__data-source-loading'>-</div>
  }

  // Show loading spinner while looking up
  if (item.isLookingUp || !item.discoverRes) {
    return (
      <div className='admin-upload-table__data-source-loading'>
        <FaSpinner className='admin-upload-table__loading-spinner' />
      </div>
    )
  }

  // Show "ID found" badge if album was found
  const effectiveDiscogsId = item.manualDiscogsId || item.discoverRes?.discogsId
  const hasMbId = !!item.discoverRes?.mbId
  const hasValidId = !!item.manualAlbumId && item.manualAlbumId.trim().length >= 36
  if (!hasMbId) {
    return (
      <div className='admin-upload-table__data-source-input'>
        <div
          className={`admin-upload-table__input-wrapper ${!hasValidId && !item.isLookingUp ? 'admin-upload-table__input-wrapper--error' : ''}`}
        >
          <input
            placeholder='MusicBrainz ID or URL'
            value={inputValue}
            onChange={handleInputChange}
            min='1'
            className='admin-upload-table__id-input'
          />
          <MuzaButton
            disabled={!hasValidId}
            content='Scan'
            onClick={() => onDiscoverAlbum(item)}
            className='admin-upload-table__scan-btn'
          />
        </div>
      </div>
    )
  }
  return (
    <div className='admin-upload-table__data-source-id-found'>
      <a
        href={`https://musicbrainz.org/release/${item.discoverRes.mbId}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        <div className='admin-upload-table__id-found-badge'>
          <MuzaIcon iconName='Check' className='admin-upload-table__check-icon' />
          MB ID found
        </div>
      </a>
      {effectiveDiscogsId ? (
        <a
          href={`https://www.discogs.com/release/${effectiveDiscogsId}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='admin-upload-table__id-found-badge'>
            <MuzaIcon iconName='Check' className='admin-upload-table__check-icon' />
            Discogs ID {item.manualDiscogsId ? 'entered' : 'found'}
          </div>
        </a>
      ) : (
        <div className='admin-upload-table__data-source-input'>
          <input
            placeholder='Discogs ID or URL (optional)'
            value={discogsInputValue}
            onChange={handleDiscogsInputChange}
            className='admin-upload-table__id-input'
          />
        </div>
      )}
    </div>
  )
}

export default DataSourceCell
