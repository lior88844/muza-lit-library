import React from 'react'

import { cn } from '~/lib/utils'

import { Typography } from '../ui/typography'

interface UploadHeaderProps {
  title: string
  onCancel: () => void
  isTestMode?: boolean
  onTestModeToggle?: (enabled: boolean) => void
}

const UploadHeader: React.FC<UploadHeaderProps> = ({
  title,
  onCancel,
  isTestMode = false,
  onTestModeToggle,
}) => {
  const handleTitleClick = () => {
    if (onTestModeToggle) {
      onTestModeToggle(!isTestMode)
    }
  }

  return (
    <div className='border-border-light sticky top-0 z-[100] flex h-(--upload-header-height) items-center justify-between border-b bg-white px-10'>
      <Typography
        variant='h3'
        className={cn(
          'flex cursor-pointer items-center capitalize transition-all duration-200 ease-in-out select-none hover:opacity-70',
          isTestMode && 'text-[#667eea]'
        )}
        onClick={handleTitleClick}
        title={isTestMode ? 'Test Mode: ON (click to disable)' : 'Click to enable Test Mode'}
      >
        {title}
        {isTestMode && <span className='text-sm font-bold text-[#667eea] opacity-80'> • TEST</span>}
      </Typography>
      <div className='flex items-center gap-3'>
        <button
          className='bg-secondary text-background-dark cursor-pointer rounded-full border-none px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-[var(--muza-button-hover-background)]'
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default UploadHeader
