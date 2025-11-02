import './UploadHeader.scss'

import React from 'react'

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
    <div className='upload-header'>
      <h1
        className={`header-title ${isTestMode ? 'test-mode-active' : ''}`}
        onClick={handleTitleClick}
        title={isTestMode ? 'Test Mode: ON (click to disable)' : 'Click to enable Test Mode'}
      >
        {title}
        {isTestMode && <span className='test-mode-indicator'> • TEST</span>}
      </h1>
      <div className='header-controls'>
        <button className='cancel-button' onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default UploadHeader
