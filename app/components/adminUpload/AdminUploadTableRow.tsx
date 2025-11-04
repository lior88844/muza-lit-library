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
      className='border-b border-border-light hover:bg-muted transition-all duration-200 ease-in-out'
    >
      <td className='py-2 px-2 align-middle border-b border-border-light text-center text-sm text-muted-foreground leading-4'>
        {index + 1}
      </td>
      <td className='py-2 px-2 align-middle border-b border-border-light text-center'>
        <div
          className={cn(
            'flex justify-center items-center relative h-5',
            isSelected &&
              '[&_.checkmark]:opacity-100 [&_.checkmark]:scale-100 [&_.checkbox-visual]:bg-transparent [&_.checkbox-visual]:border-transparent',
            (item.errorCode === 1001 || !isUploadReady) &&
              'opacity-50 cursor-not-allowed [&_input]:cursor-not-allowed'
          )}
        >
          <input
            type='checkbox'
            checked={isSelected}
            onChange={() => onItemSelect(item.id)}
            className='w-4 h-4 opacity-0 absolute cursor-pointer z-1'
            disabled={!isUploadReady}
          />
          <div className='w-4 h-4 border-[1.33px] border-primary rounded-sm bg-background flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out relative checkbox-visual'>
            <MuzaIcon
              iconName='CheckmarkSquare'
              className='w-4 h-4 opacity-0 scale-[0.8] transition-all duration-200 ease-in-out checkmark'
            />
          </div>
        </div>
      </td>
      <td className='py-2 px-2 align-middle border-b border-border-light text-base text-muted-foreground leading-5'>
        <div className='flex flex-col gap-1'>
          <span className='font-medium text-base text-text-primary'>
            {artistName} {artistName && albumName ? ' - ' : ''} {albumName}
          </span>
          <div className='flex gap-3 text-sm text-text-secondary'>
            <span className='text-xs text-text-tertiary'>
              {item.files.flat().length} files
              {item.files.length > 1 && ` (${item.files.length} discs)`}
            </span>
          </div>
        </div>
      </td>
      <td className='py-2 px-2 pl-2 pr-4 align-middle border-b border-border-light'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'flex items-center justify-center w-[18px] h-[18px] bg-secondary rounded-full shrink-0 transition-colors duration-300 ease-in-out',
              item.loadingState?.status === 'loaded' && 'bg-[#15803d]',
              isLoading && isSelected && 'bg-border-light'
            )}
          >
            {isLoading ? (
              <FaSpinner className='w-4 h-4 text-text-secondary animate-spin' />
            ) : (
              <MuzaIcon
                iconName={
                  item.loadingState?.status === 'loaded' && item.uploadRes ? 'Check' : 'Clock8'
                }
                className={cn(
                  'w-4 h-4 text-text-dark transition-colors duration-300 ease-in-out',
                  item.loadingState?.status === 'loaded' && 'text-[#f9fafb]'
                )}
              />
            )}
          </div>
          <div className='flex-1 flex flex-col gap-1 min-w-0'>
            <span className='text-base font-bold text-background-dark leading-5'>
              {item.discoverRes?.artistName || ''} {item.discoverRes?.albumName ? ' - ' : ''}{' '}
              {item.discoverRes?.albumName}
            </span>
            <div className='flex items-center justify-start gap-2 flex-wrap'>
              <div className='w-5 h-5 text-text-secondary'>
                <MuzaIcon iconName='folder' className='w-full h-full' />
              </div>
              <span className='text-sm text-text-secondary'>{formatFileSize(item.size)}</span>
              <span className='text-sm text-text-secondary'>- {statusText}</span>
            </div>
          </div>
        </div>
      </td>
      <td className='py-2 px-2 align-middle border-b border-border-light'>
        <DataSourceCell
          item={item}
          onManualIdChange={onManualIdChange}
          onManualDiscogsIdChange={onManualDiscogsIdChange}
          onDiscoverAlbum={onDiscoverAlbum}
        />
      </td>
      <td className='py-2 px-2 align-middle border-b border-border-light'>
        <CoverCell item={item} onCoverUrlChange={onCoverUrlChange} />
      </td>
      <td className='py-2 px-2 align-middle border-b border-border-light text-right min-w-max'>
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
  <div className='flex items-center justify-center gap-1 py-[2px] px-2 pb-1 rounded-sm bg-[#15803d] font-sans text-sm font-normal leading-none text-[#f9fafb] whitespace-nowrap'>
    <MuzaIcon iconName='Check' className='w-3 h-3 text-[#f9fafb]' />
    No Errors
  </div>
)

// Uploaded Badge Component
const UploadedBadge = () => (
  <div className='flex items-center justify-center gap-1 py-[2px] px-2 pb-1 rounded-sm bg-[#7c3aed] font-sans text-sm font-normal leading-none text-[#f9fafb] whitespace-nowrap'>
    <MuzaIcon iconName='Check' className='w-3 h-3 text-[#f9fafb]' />
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
          <p className='text-sm font-medium text-[#f9fafb] mb-1'>{errorInfo.title}</p>
          <p className='text-[13px] font-normal leading-[1.4] text-[#d1d5db]'>
            {errorInfo.description}
          </p>
        </Fragment>
      ))}
    >
      Error: {errorInfos[0].code} {errorInfos.length > 1 ? `+${errorInfos.length - 1}` : ''}
    </AppTooltip>
  )
}
