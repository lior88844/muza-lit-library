import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

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
        newFile =>
          !uploadedFiles.some(
            existingFile => existingFile.name === newFile.name && existingFile.size === newFile.size
          )
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
    <div className='flex flex-col items-center gap-[194px] lg:gap-10'>
      {/* Cover Image Upload */}
      <div
        {...getCoverRootProps()}
        className={cn(
          'w-48 h-48 bg-[var(--colors_muted_light_50_)] border border-border-light rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-in-out relative',
          isCoverDragActive && 'border-primary bg-secondary scale-[1.02]',
          coverPreview && 'p-0'
        )}
      >
        <input {...getCoverInputProps()} />

        {coverPreview ? (
          <div className='w-full h-full relative rounded-sm overflow-hidden'>
            <img
              src={coverPreview}
              alt='Cover preview'
              className='w-full h-full object-cover rounded-sm'
            />
            <button
              type='button'
              onClick={e => {
                e.stopPropagation()
                removeCover()
              }}
              className='absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white border-none cursor-pointer flex items-center justify-center text-base leading-none transition-colors duration-200 hover:bg-black/90'
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <div className='bg-background-dark w-14 h-14 rounded-full flex items-center justify-center mb-4'>
              <MuzaIcon className='h-6 w-6 text-white' iconName='plus' />
            </div>
            <span className='text-sm text-background-dark text-center'>
              {isCoverDragActive ? 'Drop cover image here' : 'Add cover image'}
            </span>
          </>
        )}
      </div>

      {/* File Upload Area */}
      <div
        {...getFilesRootProps()}
        className={cn(
          'flex flex-col items-center gap-4 cursor-pointer p-8 transition-all duration-200 ease-in-out min-w-[300px] lg:min-w-[250px] lg:p-6',
          isFilesDragActive && 'border-primary bg-secondary scale-[1.02]'
        )}
      >
        <input {...getFilesInputProps()} />

        <div className='w-6 h-6 text-background-dark'>
          <MuzaIcon className='w-6 h-6 text-background-dark' iconName='upload' />
        </div>
        <div className='text-center'>
          <p className='text-base text-background-dark m-0 mb-1'>
            {isFilesDragActive ? 'Drop audio files here' : 'Drag files here to upload'}
          </p>
          <p className='text-sm text-primary m-0 underline'>or browse for files</p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className='w-full mt-4 pt-4 border-t border-border-light'>
            <h4 className='text-sm text-background-dark m-0 mb-3 font-semibold'>
              Uploaded Files ({uploadedFiles.length})
            </h4>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className='flex items-center justify-between py-2 px-3 bg-[var(--colors_muted_light_50_)] rounded-sm mb-2 gap-3'
              >
                <span className='flex-1 text-sm text-background-dark whitespace-nowrap overflow-hidden text-ellipsis'>
                  {file.name}
                </span>
                <span className='text-xs text-primary whitespace-nowrap'>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className='w-5 h-5 rounded-full bg-border-light text-background-dark border-none cursor-pointer flex items-center justify-center text-sm leading-none transition-colors duration-200 hover:bg-[#ff4444] hover:text-white'
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
