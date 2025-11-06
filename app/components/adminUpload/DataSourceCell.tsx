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
    return <div className='flex items-center justify-center px-2 py-2'>-</div>
  }

  // Show loading spinner while looking up
  if (item.isLookingUp || !item.discoverRes) {
    return (
      <div className='flex items-center justify-center px-2 py-2'>
        <FaSpinner className='text-primary h-4 w-4 animate-spin' />
      </div>
    )
  }

  // Show "ID found" badge if album was found
  const effectiveDiscogsId = item.manualDiscogsId || item.discoverRes?.discogsId
  const hasMbId = !!item.discoverRes?.mbId
  const hasValidId = !!item.manualAlbumId && item.manualAlbumId.trim().length >= 36
  if (!hasMbId) {
    return (
      <div className='flex items-center justify-center'>
        <div
          className={cn(
            'flex w-full items-center justify-center gap-2',
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
            className='border-border-light bg-background text-background-dark focus:border-primary h-9 w-full rounded-full border px-3 py-2 font-sans text-base leading-5 transition-colors duration-200 ease-in-out outline-none placeholder:text-base placeholder:leading-5 placeholder:tracking-[0.25px] placeholder:text-[#6b7280] invalid:border-[#ef4444] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [[type=number]]:appearance-none'
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
        <div className='flex items-center gap-1 rounded-sm bg-[#15803d] px-2 py-[2px] text-sm leading-none font-normal whitespace-nowrap text-[#f9fafb]'>
          <MuzaIcon iconName='Check' className='h-3 w-3' />
          MB ID found
        </div>
      </a>
      {effectiveDiscogsId ? (
        <a
          href={`https://www.discogs.com/release/${effectiveDiscogsId}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='flex items-center gap-1 rounded-sm bg-[#15803d] px-2 py-[2px] text-sm leading-none font-normal whitespace-nowrap text-[#f9fafb]'>
            <MuzaIcon iconName='Check' className='h-3 w-3' />
            Discogs ID {item.manualDiscogsId ? 'entered' : 'found'}
          </div>
        </a>
      ) : (
        <div className='flex items-center justify-center'>
          <input
            placeholder='Discogs ID or URL (optional)'
            value={discogsInputValue}
            onChange={handleDiscogsInputChange}
            className='border-border-light bg-background text-background-dark focus:border-primary h-9 w-full rounded-full border px-3 py-2 font-sans text-base leading-5 transition-colors duration-200 ease-in-out outline-none placeholder:text-base placeholder:leading-5 placeholder:tracking-[0.25px] placeholder:text-[#6b7280] invalid:border-[#ef4444] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [[type=number]]:appearance-none'
          />
        </div>
      )}
    </div>
  )
}

export default DataSourceCell
