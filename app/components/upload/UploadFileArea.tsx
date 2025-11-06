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
          'border-border-light relative flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-sm border bg-[var(--colors_muted_light_50_)] transition-all duration-200 ease-in-out',
          isCoverDragActive && 'border-primary bg-secondary scale-[1.02]',
          coverPreview && 'p-0'
        )}
      >
        <input {...getCoverInputProps()} />

        {coverPreview ? (
          <div className='relative h-full w-full overflow-hidden rounded-sm'>
            <img
              src={coverPreview}
              alt='Cover preview'
              className='h-full w-full rounded-sm object-cover'
            />
            <button
              type='button'
              onClick={e => {
                e.stopPropagation()
                removeCover()
              }}
              className='absolute top-2 right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-black/70 text-base leading-none text-white transition-colors duration-200 hover:bg-black/90'
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <div className='bg-background-dark mb-4 flex h-14 w-14 items-center justify-center rounded-full'>
              <MuzaIcon className='h-6 w-6 text-white' iconName='plus' />
            </div>
            <span className='text-background-dark text-center text-sm'>
              {isCoverDragActive ? 'Drop cover image here' : 'Add cover image'}
            </span>
          </>
        )}
      </div>

      {/* File Upload Area */}
      <div
        {...getFilesRootProps()}
        className={cn(
          'flex min-w-[300px] cursor-pointer flex-col items-center gap-4 p-8 transition-all duration-200 ease-in-out lg:min-w-[250px] lg:p-6',
          isFilesDragActive && 'border-primary bg-secondary scale-[1.02]'
        )}
      >
        <input {...getFilesInputProps()} />

        <div className='text-background-dark h-6 w-6'>
          <MuzaIcon className='text-background-dark h-6 w-6' iconName='upload' />
        </div>
        <div className='text-center'>
          <p className='text-background-dark m-0 mb-1 text-base'>
            {isFilesDragActive ? 'Drop audio files here' : 'Drag files here to upload'}
          </p>
          <p className='text-primary m-0 text-sm underline'>or browse for files</p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className='border-border-light mt-4 w-full border-t pt-4'>
            <h4 className='text-background-dark m-0 mb-3 text-sm font-semibold'>
              Uploaded Files ({uploadedFiles.length})
            </h4>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className='mb-2 flex items-center justify-between gap-3 rounded-sm bg-[var(--colors_muted_light_50_)] px-3 py-2'
              >
                <span className='text-background-dark flex-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap'>
                  {file.name}
                </span>
                <span className='text-primary text-xs whitespace-nowrap'>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className='bg-border-light text-background-dark flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-none text-sm leading-none transition-colors duration-200 hover:bg-[#ff4444] hover:text-white'
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
