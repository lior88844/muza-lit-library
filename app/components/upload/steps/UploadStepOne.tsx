import React from 'react'

import type { Musician, UploadFormData } from '~/store/uploadStore'

import UploadFileArea from '../UploadFileArea'
import UploadForm from '../UploadForm'

interface UploadStepOneProps {
  formData: UploadFormData
  musicians: Musician[]
  audioFiles: File[] // Add audioFiles prop
  onFormDataChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onMusicianChange: (
    index: number,
    field: keyof Musician
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddMusician: () => void
  onRemoveMusician: (index: number) => void
  onCoverUpload: (file: File) => void
  onFileUpload: (files: File[]) => void
  onFindAlbumDetails?: () => void
}

const UploadStepOne: React.FC<UploadStepOneProps> = ({
  formData,
  musicians,
  audioFiles,
  onFormDataChange,
  onMusicianChange,
  onAddMusician,
  onRemoveMusician,
  onCoverUpload,
  onFileUpload,
  onFindAlbumDetails,
}) => {
  const handleFindAlbumDetails = () => {
    if (onFindAlbumDetails) {
      onFindAlbumDetails()
    } else {
      // Default behavior - could show a message or do nothing
      console.log('Find album details functionality not implemented yet')
    }
  }

  return (
    <div className='h-full'>
      <div className='flex h-full'>
        <div className='flex-1 border-r border-border-light overflow-y-auto h-full'>
          <UploadForm
            formData={formData}
            musicians={musicians}
            onFormDataChange={onFormDataChange}
            onMusicianChange={onMusicianChange}
            onAddMusician={onAddMusician}
            onRemoveMusician={onRemoveMusician}
            onFindAlbumDetails={handleFindAlbumDetails}
          />
        </div>

        <div className='flex-1 py-8 px-10 overflow-y-hidden'>
          <UploadFileArea
            onCoverUpload={onCoverUpload}
            onFileUpload={onFileUpload}
            uploadedFiles={audioFiles}
          />
        </div>
      </div>
    </div>
  )
}

export default UploadStepOne
