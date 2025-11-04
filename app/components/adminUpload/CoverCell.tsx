import React, { useCallback, useState } from 'react'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

import { UploadErrorCodeEnum } from './types/ErrorCode'
import type { UploadItem } from './types/UploadItem'

interface CoverCellProps {
  item: UploadItem
  onCoverUrlChange: (itemId: string, url: string | undefined) => void
}

const CoverCell: React.FC<CoverCellProps> = ({ item, onCoverUrlChange }) => {
  const [inputValue, setInputValue] = useState(item.manualCoverImgUrl || '')

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)

      // Pass the URL value to parent, or undefined if empty
      onCoverUrlChange(item.id, value.trim() || undefined)
    },
    [item.id, onCoverUrlChange]
  )

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputValue('')
    onCoverUrlChange(item.id, undefined)
  }
  const hasValidCover = !!item.manualCoverImgUrl || !!item.discoverRes?.coverUrl
  // Don't show anything for items with critical error 1001 (no FLAC files)
  if (item.errorCode === UploadErrorCodeEnum.ALL_FILES_INVALID) {
    return <div className='flex items-center justify-center min-h-[50px]'>-</div>
  }

  // Show loading state while looking up
  if (item.isLookingUp) {
    return <div className='flex items-center justify-center min-h-[50px]' />
  }

  // Show cover image if available from discovery
  if (item.discoverRes?.coverUrl) {
    return (
      <div className='flex items-center justify-center min-h-[50px]'>
        <div className='relative w-20 h-20'>
          <img
            src={item.discoverRes.coverUrl}
            alt={`${item.name} cover`}
            className='w-full h-full object-cover rounded-sm border border-border-light'
          />
          <button
            className='absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-secondary rounded-full cursor-pointer flex items-center justify-center p-0 transition-all duration-200 ease-in-out hover:bg-muted focus:outline-none focus:shadow-[0_0_0_2px_rgba(239,68,68,0.3)] active:scale-95 [&_i]:flex [&_i]:items-center [&_i]:justify-center'
            onClick={handleRemoveClick}
            aria-label='Remove cover image'
          >
            <MuzaIcon iconName='Close' className='w-2.5 h-2.5 text-white' />
          </button>
        </div>
      </div>
    )
  }

  // Show manually entered cover image URL
  if (item.manualCoverImgUrl) {
    return (
      <div className='flex items-center justify-center min-h-[50px]'>
        <div className='relative w-20 h-20'>
          <img
            src={item.manualCoverImgUrl}
            alt={`${item.name} cover`}
            className='w-full h-full object-cover rounded-sm border border-border-light'
            onError={e => {
              console.error('Failed to load cover image from URL:', item.manualCoverImgUrl)
              // Fallback to input field if image fails to load
              e.currentTarget.style.display = 'none'
            }}
          />
          <button
            className='absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-secondary rounded-full cursor-pointer flex items-center justify-center p-0 transition-all duration-200 ease-in-out hover:bg-muted focus:outline-none focus:shadow-[0_0_0_2px_rgba(239,68,68,0.3)] active:scale-95 [&_i]:flex [&_i]:items-center [&_i]:justify-center'
            onClick={handleRemoveClick}
            aria-label='Remove cover image'
          >
            <MuzaIcon iconName='Close' className='w-2.5 h-2.5 text-white' />
          </button>
        </div>
      </div>
    )
  }

  // Show input field for manual URL entry (similar to DataSourceCell)
  return (
    <div className='flex items-center justify-center min-h-[50px]'>
      <div
        className={cn(
          'w-full max-w-[180px]',
          !hasValidCover &&
            !item.isLookingUp &&
            '[&_input]:border-[#dc2626] [&_input]:shadow-[0_0_0_1px_#dc2626]'
        )}
      >
        <input
          type='text'
          placeholder='Img URL'
          value={inputValue}
          onChange={handleInputChange}
          className='w-full h-9 py-2 px-3 border border-border-light rounded-full bg-background text-base leading-5 text-background-dark outline-none transition-colors duration-200 ease-in-out font-sans placeholder:text-[#6b7280] placeholder:text-base placeholder:leading-5 placeholder:tracking-[0.25px] focus:border-primary focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)] invalid:border-[#ef4444]'
        />
      </div>
    </div>
  )
}

export default CoverCell
