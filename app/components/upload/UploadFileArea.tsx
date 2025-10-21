import './UploadFileArea.scss'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import MuzaIcon from '~/icons/MuzaIcon'

interface UploadFileAreaProps {
  onCoverUpload: (file: File) => void
  onFileUpload: (files: File[]) => void
  uploadedFiles?: File[] // Add prop to receive files from parent
}

const UploadFileArea: React.FC<UploadFileAreaProps> = ({
  onCoverUpload,
  onFileUpload,
  uploadedFiles = [], // Default to empty array
}) => {
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  // Remove local uploadedFiles state - use prop instead

  // Cover image dropzone
  const onCoverDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const previewUrl = URL.createObjectURL(file)
        setCoverPreview(previewUrl)
        onCoverUpload(file)
      }
    },
    [onCoverUpload]
  )

  const {
    getRootProps: getCoverRootProps,
    getInputProps: getCoverInputProps,
    isDragActive: isCoverDragActive,
  } = useDropzone({
    onDrop: onCoverDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  // Audio files dropzone
  const onFilesDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Filter out duplicate files (same name and size)
      const newFiles = acceptedFiles.filter(
        newFile => !uploadedFiles.some(existingFile => existingFile.name === newFile.name && existingFile.size === newFile.size)
      )

      // Add new files to existing files
      const combinedFiles = [...uploadedFiles, ...newFiles]
      onFileUpload(combinedFiles)
    },
    [onFileUpload, uploadedFiles]
  )

  const {
    getRootProps: getFilesRootProps,
    getInputProps: getFilesInputProps,
    isDragActive: isFilesDragActive,
  } = useDropzone({
    onDrop: onFilesDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB per file
  })

  const removeCover = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview)
    }
    setCoverPreview(null)
  }

  const removeFile = (index: number) => {
    // Let parent handle file removal
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    onFileUpload(newFiles)
  }

  return (
    <div className='upload-file-area'>
      {/* Cover Image Upload */}
      <div
        {...getCoverRootProps()}
        className={`cover-upload ${isCoverDragActive ? 'drag-active' : ''} ${coverPreview ? 'has-preview' : ''}`}
      >
        <input {...getCoverInputProps()} />

        {coverPreview ? (
          <div className='cover-preview'>
            <img src={coverPreview} alt='Cover preview' className='cover-image' />
            <button
              type='button'
              onClick={e => {
                e.stopPropagation()
                removeCover()
              }}
              className='remove-cover-btn'
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <div className='cover-upload-button'>
              <MuzaIcon className='plus-icon-large' iconName='plus' />
            </div>
            <span className='cover-upload-text'>{isCoverDragActive ? 'Drop cover image here' : 'Add cover image'}</span>
          </>
        )}
      </div>

      {/* File Upload Area */}
      <div {...getFilesRootProps()} className={`file-upload-zone ${isFilesDragActive ? 'drag-active' : ''}`}>
        <input {...getFilesInputProps()} />

        <div className='upload-icon'>
          <MuzaIcon className='upload-icon' iconName='upload' />
        </div>
        <div className='upload-text'>
          <p className='upload-primary'>{isFilesDragActive ? 'Drop audio files here' : 'Drag files here to upload'}</p>
          <p className='upload-secondary'>or browse for files</p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className='uploaded-files-list'>
            <h4>Uploaded Files ({uploadedFiles.length})</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} className='uploaded-file-item'>
                <span className='file-name'>{file.name}</span>
                <span className='file-size'>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className='remove-file-btn'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadFileArea
