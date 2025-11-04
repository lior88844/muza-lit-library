import React from 'react'

import { Button } from '../ui/button'
import { Typography } from '../ui/typography'

interface AdminUploadHeaderProps {
  onCancel: () => void
}

const AdminUploadHeader: React.FC<AdminUploadHeaderProps> = ({ onCancel }) => {
  return (
    <div className='bg-background border-b border-border-light py-3 px-8'>
      <div className='flex items-center justify-between mx-auto'>
        <Typography variant='h3'>Muza Utils – File Upload</Typography>
        <Button
          title='Back to admin'
          onClick={onCancel}
          className='bg-secondary text-text-dark rounded-full py-2 px-4 border-none font-medium text-base leading-5 cursor-pointer transition-colors duration-200 ease-in-out w-fit h-fit hover:bg-(--muza-button-hover-background) disabled:opacity-50 disabled:cursor-not-allowed [&_span]:text-base [&_span]:font-medium [&_span]:text-background-dark [&_span]:leading-5'
          size='sm'
        >
          Back to admin
        </Button>
      </div>
    </div>
  )
}

export default AdminUploadHeader
