// Import Uppy styles
import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'
// Import custom styles
import './UppyFileUploader.scss'

import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import React, { useEffect, useRef } from 'react'

interface UppyFileUploaderProps {
  onFileUpload: (files: File[]) => void
  allowFolders?: boolean
}

const UppyFileUploader: React.FC<UppyFileUploaderProps> = ({ onFileUpload, allowFolders = true }) => {
  const uppyRef = useRef<Uppy | null>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dashboardRef.current) return

    // Initialize Uppy
    const uppy = new Uppy({
      id: 'admin-upload',
      autoProceed: false,
      allowMultipleUploadBatches: true,
      restrictions: {
        maxNumberOfFiles: null,
        allowedFileTypes: ['.flac', 'audio/flac'],
      },
    })

    // Add Dashboard plugin
    uppy.use(Dashboard, {
      target: dashboardRef.current,
      inline: true,
      width: '100%',
      height: 400,
      showProgressDetails: true,
      hideUploadButton: false,
      hideRetryButton: false,
      hidePauseResumeButton: false,
      hideCancelButton: false,
      showRemoveButtonAfterComplete: true,
      note: 'Only FLAC files from folders will be processed',
      proudlyDisplayPoweredByUppy: false,
      locale: {
        strings: {
          dropPasteFiles: 'Drop folders here or %{browse}',
        },
      },
    })

    // Handle file additions
    uppy.on('files-added', files => {
      const fileArray = files.map(file => file.data as File)
      onFileUpload(fileArray)
    })

    // Handle upload completion (if needed later)
    uppy.on('complete', () => {
      // Upload complete - could add logging here if needed
    })

    uppyRef.current = uppy

    return () => {
      uppy.destroy()
    }
  }, [onFileUpload, allowFolders])

  return (
    <div className='uppy-file-uploader'>
      <div ref={dashboardRef} />
    </div>
  )
}

export default UppyFileUploader
