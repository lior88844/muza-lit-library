import React, { useCallback, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'

import MuzaButton from '~/controls/MuzaButton'
import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

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
    return <div className='flex justify-center items-center py-2 px-2'>-</div>
  }

  // Show loading spinner while looking up
  if (item.isLookingUp || !item.discoverRes) {
    return (
      <div className='flex justify-center items-center py-2 px-2'>
        <FaSpinner className='w-4 h-4 text-primary animate-spin' />
      </div>
    )
  }

  // Show "ID found" badge if album was found
  const effectiveDiscogsId = item.manualDiscogsId || item.discoverRes?.discogsId
  const hasMbId = !!item.discoverRes?.mbId
  const hasValidId = !!item.manualAlbumId && item.manualAlbumId.trim().length >= 36
  if (!hasMbId) {
    return (
      <div className='flex justify-center items-center'>
        <div
          className={cn(
            'w-full flex items-center justify-center gap-2',
            !hasValidId &&
              !item.isLookingUp &&
              '[&_input]:border-[#dc2626] [&_input]:shadow-[0_0_0_1px_#dc2626]'
          )}
        >
          <input
            placeholder='MusicBrainz ID or URL'
            value={inputValue}
            onChange={handleInputChange}
            min='1'
            className='w-full h-9 py-2 px-3 border border-border-light rounded-full bg-background text-base leading-5 text-background-dark outline-none transition-colors duration-200 ease-in-out font-sans placeholder:text-[#6b7280] placeholder:text-base placeholder:leading-5 placeholder:tracking-[0.25px] focus:border-primary focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)] invalid:border-[#ef4444] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 [[type=number]]:appearance-none'
          />
          <MuzaButton
            disabled={!hasValidId}
            content='Scan'
            onClick={() => onDiscoverAlbum(item)}
            className='ml-2'
          />
        </div>
      </div>
    )
  }
  return (
    <div className='flex items-center gap-2'>
      <a
        href={`https://musicbrainz.org/release/${item.discoverRes.mbId}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        <div className='flex items-center gap-1 bg-[#15803d] text-[#f9fafb] py-[2px] px-2 rounded-sm text-sm font-normal leading-none whitespace-nowrap'>
          <MuzaIcon iconName='Check' className='w-3 h-3' />
          MB ID found
        </div>
      </a>
      {effectiveDiscogsId ? (
        <a
          href={`https://www.discogs.com/release/${effectiveDiscogsId}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='flex items-center gap-1 bg-[#15803d] text-[#f9fafb] py-[2px] px-2 rounded-sm text-sm font-normal leading-none whitespace-nowrap'>
            <MuzaIcon iconName='Check' className='w-3 h-3' />
            Discogs ID {item.manualDiscogsId ? 'entered' : 'found'}
          </div>
        </a>
      ) : (
        <div className='flex justify-center items-center'>
          <input
            placeholder='Discogs ID or URL (optional)'
            value={discogsInputValue}
            onChange={handleDiscogsInputChange}
            className='w-full h-9 py-2 px-3 border border-border-light rounded-full bg-background text-base leading-5 text-background-dark outline-none transition-colors duration-200 ease-in-out font-sans placeholder:text-[#6b7280] placeholder:text-base placeholder:leading-5 placeholder:tracking-[0.25px] focus:border-primary focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)] invalid:border-[#ef4444] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 [[type=number]]:appearance-none'
          />
        </div>
      )}
    </div>
  )
}

export default DataSourceCell
