import type { ICellRendererParams } from 'ag-grid-community'
import { FaSpinner } from 'react-icons/fa'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

import type { UploadItem } from './types/UploadItem'

export const StatusCellRenderer = (params: ICellRendererParams<UploadItem>) => {
  const item = params.data!
  const totalFiles = item.files.flat().length

  // Calculate upload progress across ALL files
  let uploadProgress = 0
  let completedFiles = 0

  if (item.uploadProgress && item.uploadProgress.size > 0) {
    // Get all files and their progress
    const allFiles = item.files.flat()
    let totalProgressSum = 0

    allFiles.forEach(file => {
      const fileProgress = item.uploadProgress?.get(file.name)
      if (fileProgress) {
        totalProgressSum += fileProgress.progress
        if (fileProgress.status === 'completed') {
          completedFiles++
        }
      }
      // Files not in the Map are 0% (not started yet)
    })

    // Calculate overall percentage across all files
    uploadProgress = Math.round(totalProgressSum / totalFiles)
  }

  // Determine status text based on phase
  let statusText = 'Ready'
  switch (item.phase) {
    case 'discovering':
      statusText = 'Discovering...'
      break
    case 'waiting':
      statusText = 'Waiting in queue...'
      break
    case 'preparing':
      statusText = 'Preparing album...'
      break
    case 'uploading':
      statusText = `Uploading ${uploadProgress}%`
      break
    case 'completed':
      statusText = 'Uploaded'
      break
    case 'error':
      statusText = 'Error'
      break
    case 'idle':
      if (!item.discoverRes?.discogsId && !item.discoverRes?.mbId) {
        statusText = 'No ID found'
      } else if (item.discoverRes && item.discoverRes.matchedBy === 'ai') {
        statusText = 'Ready - AI matched'
      }
      break
  }

  const isLoading =
    item.phase === 'discovering' ||
    item.phase === 'waiting' ||
    item.phase === 'preparing' ||
    item.phase === 'uploading'
  const isWaiting = item.phase === 'waiting'

  return (
    <div className='flex w-full items-center gap-3 py-2'>
      <div
        className={cn(
          'flex size-[18px] shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-in-out',
          item.phase === 'completed' && 'bg-[#15803d]',
          isLoading && 'bg-border-light'
        )}
      >
        {isLoading && !isWaiting ? (
          <FaSpinner className='text-text-secondary h-4 w-4 animate-spin' />
        ) : isWaiting ? (
          <MuzaIcon
            iconName='Clock8'
            className='text-text-dark transition-colors duration-300 ease-in-out'
          />
        ) : (
          <MuzaIcon
            iconName={item.phase === 'completed' ? 'Check' : 'Clock8'}
            className={cn(
              'text-text-dark transition-colors duration-300 ease-in-out',
              item.phase === 'completed' && 'text-[#f9fafb]'
            )}
          />
        )}
      </div>
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <div className='flex w-full items-center justify-between gap-1'>
          <span className='text-text-secondary text-sm'>{statusText}</span>
          {item.phase === 'uploading' ? (
            <span>
              <span className='font-medium'>{completedFiles}</span> / {totalFiles}
            </span>
          ) : (
            <span>--/--</span>
          )}
        </div>

        {/* Progress bar for uploading phase */}
        {item.phase === 'uploading' && (
          <div className='flex items-center gap-2'>
            <div className='bg-border-light h-1.5 w-full overflow-hidden rounded-full'>
              <div
                className='h-full bg-[#000DA2] transition-all duration-300 ease-out'
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
