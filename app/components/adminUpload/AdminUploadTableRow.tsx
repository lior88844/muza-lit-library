import { Fragment } from 'react/jsx-runtime'
import { FaSpinner } from 'react-icons/fa'

import { isItemUploadReady } from '~/components/adminUpload/services/adminUploadService'
import MuzaIcon from '~/icons/MuzaIcon'

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
    <tr key={item.id} className='admin-upload-table__row'>
      <td className='admin-upload-table__cell admin-upload-table__cell--number'>{index + 1}</td>
      <td className='admin-upload-table__cell admin-upload-table__cell--checkbox'>
        <div
          className={`admin-upload-table__checkbox-wrapper ${isSelected ? 'admin-upload-table__checkbox-wrapper--checked' : ''} ${item.errorCode === 1001 || !isUploadReady ? 'admin-upload-table__checkbox-wrapper--disabled' : ''}`}
        >
          <input
            type='checkbox'
            checked={isSelected}
            onChange={() => onItemSelect(item.id)}
            className='admin-upload-table__checkbox'
            disabled={!isUploadReady}
          />
          <div className='admin-upload-table__checkbox-visual'>
            <MuzaIcon iconName='CheckmarkSquare' className='admin-upload-table__checkmark' />
          </div>
        </div>
      </td>
      <td className='admin-upload-table__cell admin-upload-table__cell--folder'>
        <div className='admin-upload-table__item-info'>
          <span className='admin-upload-table__item-name'>
            {' '}
            {artistName} {artistName && albumName ? ' - ' : ''} {albumName}
          </span>
          <div className='admin-upload-table__item-meta'>
            <span className='admin-upload-table__file-count'>
              {item.files.flat().length} files
              {item.files.length > 1 && ` (${item.files.length} discs)`}
            </span>
          </div>
        </div>
      </td>
      <td className='admin-upload-table__cell admin-upload-table__cell--upload'>
        <div className='admin-upload-table__upload-item'>
          <div
            className={`admin-upload-table__upload-status ${
              item.loadingState?.status === 'loaded'
                ? 'admin-upload-table__upload-status--loaded'
                : ''
            } ${isLoading && isSelected ? 'admin-upload-table__upload-status--uploading' : ''}`}
          >
            {isLoading ? (
              <FaSpinner className='admin-upload-table__upload-spinner' />
            ) : (
              <MuzaIcon
                iconName={
                  item.loadingState?.status === 'loaded' && item.uploadRes ? 'Check' : 'Clock8'
                }
                className='admin-upload-table__status-icon'
              />
            )}
          </div>
          <div className='admin-upload-table__upload-content'>
            {item.discoverRes?.artistName || ''} {item.discoverRes?.albumName ? ' - ' : ''}{' '}
            {item.discoverRes?.albumName}
            <div className='admin-upload-table__upload-info'>
              <div className='admin-upload-table__upload-icon'>
                <MuzaIcon iconName='folder' className='admin-upload-table__type-icon' />
              </div>
              <span className='admin-upload-table__size-text'>{formatFileSize(item.size)}</span>
              <span className='admin-upload-table__status-text'>- {statusText}</span>

              {/* Show upload progress only during actual upload */}
              {/* {item.loadingState?.status === 'loading' && isUploading && (
                <>
                  <span className='admin-upload-table__status-text'>Uploading...</span>
                  <span className='admin-upload-table__percentage'>
                    {item.loadingState?.progress ?? 0}%
                  </span>
                  <div className='admin-upload-table__file-progress'>
                    <span className='admin-upload-table__progress-count'>
                      {item.loadingState?.loadedFiles ?? 0} / {item.files.flat().length}
                    </span>
                  </div>
                </>
              )} */}
            </div>
            {/* Show progress bar only during actual upload */}
            {/* {item.loadingState?.status === 'loading' && isUploading && (
              <div className='admin-upload-table__progress-bar'>
                <div
                  className='admin-upload-table__progress-fill'
                  style={{
                    width: `${item.loadingState?.progress ?? 0}%`,
                  }}
                />
              </div>
            )} */}
          </div>
        </div>
      </td>
      <td className='admin-upload-table__cell admin-upload-table__cell--data-source'>
        <DataSourceCell
          item={item}
          onManualIdChange={onManualIdChange}
          onManualDiscogsIdChange={onManualDiscogsIdChange}
          onDiscoverAlbum={onDiscoverAlbum}
        />
      </td>
      <td className='admin-upload-table__cell admin-upload-table__cell--cover'>
        <CoverCell item={item} onCoverUrlChange={onCoverUrlChange} />
      </td>
      <td className='admin-upload-table__cell admin-upload-table__cell--errors'>
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
  <div className='admin-upload-table__success-badge'>
    <MuzaIcon iconName='Check' className='admin-upload-table__success-icon' />
    No Errors
  </div>
)

// Uploaded Badge Component
const UploadedBadge = () => (
  <div className='admin-upload-table__uploaded-badge'>
    <MuzaIcon iconName='Check' className='admin-upload-table__uploaded-icon' />
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
  return (
    <AppTooltip
      triggerProps={{
        className: `admin-upload-table__error-badge admin-upload-table__error-badge--${errorInfos[0].code}`,
      }}
      content={errorInfos.map((errorInfo, idx) => (
        <Fragment key={idx}>
          <p className='tooltip__title'>{errorInfo.title}</p>
          <p className='tooltip__description'>{errorInfo.description}</p>
        </Fragment>
      ))}
    >
      Error: {errorInfos[0].code} {errorInfos.length > 1 ? `+${errorInfos.length - 1}` : ''}
    </AppTooltip>
  )
}
