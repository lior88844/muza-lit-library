import { Fragment } from 'react/jsx-runtime'
import { FaSpinner } from 'react-icons/fa'

import { isItemUploadReady } from '~/components/adminUpload/services/adminUploadService'
import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

import { AppTooltip } from '../ui/AppTooltip'
import CoverCell from './CoverCell'
import DataSourceCell from './DataSourceCell'
import { UPLOAD_ERROR_CODES, UploadErrorCodeEnum } from './types/ErrorCode'
import type { UploadItem } from './types/UploadItem'

interface Props {
  index: number
  isSelected: boolean
  item: UploadItem
  onManualIdChange: (itemId: string, albumId: string | undefined) => void
  onManualDiscogsIdChange: (itemId: string, discogsId: string | undefined) => void
  onCoverUrlChange: (itemId: string, url: string | undefined) => void
  onItemSelect: (itemId: string) => void
  onDiscoverAlbum: (item: UploadItem) => void
}
export const AdminUploadTableRow: React.FC<Props> = ({
  index,
  isSelected,
  item,
  onManualIdChange,
  onManualDiscogsIdChange,
  onCoverUrlChange,
  onItemSelect,
  onDiscoverAlbum,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const isLoading = item.loadingState?.status === 'loading'
  const isUploadReady = isItemUploadReady(item)
  const artistName = item.metadata?.artist || item.name
  const albumName = item.metadata?.album
  const errors = item.uploadRes?.errors || (item.errorCode ? [item.errorCode!] : [])
  let statusText = 'Ready'
  if (isLoading && !item.discoverRes) {
    statusText = 'Discovering...'
  } else if (isLoading && item.discoverRes) {
    statusText = 'Uploading...'
  } else if (!isLoading && errors.length) {
    statusText = 'Error'
  } else if (!isLoading && item.uploadRes) {
    statusText = 'Done'
  } else if (!isLoading && (!item.discoverRes?.discogsId || !item.discoverRes?.mbId)) {
    statusText = 'No ID found'
  } else if (!isLoading && item.discoverRes && item.discoverRes.matchedBy === 'ai') {
    statusText = 'Ready - AI matched'
  }

  return (
    <tr
      key={item.id}
      className='border-border-light hover:bg-muted border-b transition-all duration-200 ease-in-out'
    >
      <td className='border-border-light text-muted-foreground border-b px-2 py-2 text-center align-middle text-sm leading-4'>
        {index + 1}
      </td>
      <td className='border-border-light border-b px-2 py-2 text-center align-middle'>
        <div
          className={cn(
            'relative flex h-5 items-center justify-center',
            isSelected &&
              '[&_.checkbox-visual]:border-transparent [&_.checkbox-visual]:bg-transparent [&_.checkmark]:scale-100 [&_.checkmark]:opacity-100',
            (item.errorCode === 1001 || !isUploadReady) &&
              'cursor-not-allowed opacity-50 [&_input]:cursor-not-allowed'
          )}
        >
          <input
            type='checkbox'
            checked={isSelected}
            onChange={() => onItemSelect(item.id)}
            className='absolute z-1 h-4 w-4 cursor-pointer opacity-0'
            disabled={!isUploadReady}
          />
          <div className='border-primary bg-background checkbox-visual relative flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm border-[1.33px] transition-all duration-200 ease-in-out'>
            <MuzaIcon
              iconName='CheckmarkSquare'
              className='checkmark h-4 w-4 scale-[0.8] opacity-0 transition-all duration-200 ease-in-out'
            />
          </div>
        </div>
      </td>
      <td className='border-border-light text-muted-foreground border-b px-2 py-2 align-middle text-base leading-5'>
        <div className='flex flex-col gap-1'>
          <span className='text-text-primary text-base font-medium'>
            {artistName} {artistName && albumName ? ' - ' : ''} {albumName}
          </span>
          <div className='text-text-secondary flex gap-3 text-sm'>
            <span className='text-text-tertiary text-xs'>
              {item.files.flat().length} files
              {item.files.length > 1 && ` (${item.files.length} discs)`}
            </span>
          </div>
        </div>
      </td>
      <td className='border-border-light border-b px-2 py-2 pr-4 pl-2 align-middle'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'bg-secondary flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-in-out',
              item.loadingState?.status === 'loaded' && 'bg-[#15803d]',
              isLoading && isSelected && 'bg-border-light'
            )}
          >
            {isLoading ? (
              <FaSpinner className='text-text-secondary h-4 w-4 animate-spin' />
            ) : (
              <MuzaIcon
                iconName={
                  item.loadingState?.status === 'loaded' && item.uploadRes ? 'Check' : 'Clock8'
                }
                className={cn(
                  'text-text-dark h-4 w-4 transition-colors duration-300 ease-in-out',
                  item.loadingState?.status === 'loaded' && 'text-[#f9fafb]'
                )}
              />
            )}
          </div>
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <span className='text-background-dark text-base leading-5 font-bold'>
              {item.discoverRes?.artistName || ''} {item.discoverRes?.albumName ? ' - ' : ''}{' '}
              {item.discoverRes?.albumName}
            </span>
            <div className='flex flex-wrap items-center justify-start gap-2'>
              <div className='text-text-secondary h-5 w-5'>
                <MuzaIcon iconName='folder' className='h-full w-full' />
              </div>
              <span className='text-text-secondary text-sm'>{formatFileSize(item.size)}</span>
              <span className='text-text-secondary text-sm'>- {statusText}</span>
            </div>
          </div>
        </div>
      </td>
      <td className='border-border-light border-b px-2 py-2 align-middle'>
        <DataSourceCell
          item={item}
          onManualIdChange={onManualIdChange}
          onManualDiscogsIdChange={onManualDiscogsIdChange}
          onDiscoverAlbum={onDiscoverAlbum}
        />
      </td>
      <td className='border-border-light border-b px-2 py-2 align-middle'>
        <CoverCell item={item} onCoverUrlChange={onCoverUrlChange} />
      </td>
      <td className='border-border-light min-w-max border-b px-2 py-2 text-right align-middle'>
        {errors.length > 0 || item.uploadRes?.success === false ? (
          <ErrorBadge errorCodes={errors} item={item} />
        ) : item.uploadRes ? (
          <UploadedBadge />
        ) : (
          <SuccessBadge />
        )}
      </td>
    </tr>
  )
}
// Success Badge Component
const SuccessBadge = () => (
  <div className='flex items-center justify-center gap-1 rounded-sm bg-[#15803d] px-2 py-[2px] pb-1 font-sans text-sm leading-none font-normal whitespace-nowrap text-[#f9fafb]'>
    <MuzaIcon iconName='Check' className='h-3 w-3 text-[#f9fafb]' />
    No Errors
  </div>
)

// Uploaded Badge Component
const UploadedBadge = () => (
  <div className='flex items-center justify-center gap-1 rounded-sm bg-[#7c3aed] px-2 py-[2px] pb-1 font-sans text-sm leading-none font-normal whitespace-nowrap text-[#f9fafb]'>
    <MuzaIcon iconName='Check' className='h-3 w-3 text-[#f9fafb]' />
    Uploaded
  </div>
)
// Error Badge Component with Tooltip
const ErrorBadge: React.FC<{ errorCodes: UploadErrorCodeEnum[]; item: UploadItem }> = ({
  errorCodes,
  item,
}) => {
  const errorInfos = errorCodes.map(errorCode => UPLOAD_ERROR_CODES[errorCode]).filter(Boolean)
  if (!errorInfos.length && item.uploadRes?.success === false) {
    errorInfos.push({
      code: UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR,
      title: 'Upload Service Error',
      description: item.uploadRes?.message || 'The album was not uploaded successfully.',
    })
  }
  if (errorInfos.length === 0) {
    return null
  }

  const errorCode = errorInfos[0].code
  const isOrangeError = errorCode === 1002 || errorCode === 1003 || errorCode === 1004

  return (
    <AppTooltip
      triggerProps={{
        className: cn(
          'flex items-center justify-center py-[2px] px-2 pb-1 rounded-sm font-sans text-sm font-normal leading-none text-[#f9fafb] cursor-pointer transition-opacity duration-200 ease-in-out whitespace-nowrap hover:opacity-90',
          isOrangeError ? 'bg-[#ea580c]' : 'bg-[#dc2626]'
        ),
      }}
      content={errorInfos.map((errorInfo, idx) => (
        <Fragment key={idx}>
          <p className='mb-1 text-sm font-medium text-[#f9fafb]'>{errorInfo.title}</p>
          <p className='text-[13px] leading-[1.4] font-normal text-[#d1d5db]'>
            {errorInfo.description}
          </p>
        </Fragment>
      ))}
    >
      Error: {errorInfos[0].code} {errorInfos.length > 1 ? `+${errorInfos.length - 1}` : ''}
    </AppTooltip>
  )
}
