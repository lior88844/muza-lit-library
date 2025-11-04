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
    <div className='h-(--upload-header-height) px-10 border-b border-border-light flex items-center justify-between bg-white sticky top-0 z-[100]'>
      <Typography
        variant='h3'
        className={cn(
          'capitalize cursor-pointer transition-all duration-200 ease-in-out select-none flex items-center hover:opacity-70',
          isTestMode && 'text-[#667eea]'
        )}
        onClick={handleTitleClick}
        title={isTestMode ? 'Test Mode: ON (click to disable)' : 'Click to enable Test Mode'}
      >
        {title}
        {isTestMode && <span className='text-[#667eea] font-bold text-sm opacity-80'> • TEST</span>}
      </Typography>
      <div className='flex items-center gap-3'>
        <button
          className='bg-secondary border-none rounded-full py-2 px-3 text-sm font-medium text-background-dark cursor-pointer transition-colors duration-200 hover:bg-[var(--muza-button-hover-background)]'
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default UploadHeader
