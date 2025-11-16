import React, { type MouseEventHandler, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { AlbumResponse } from 'server/api/album/types/AlbumResponse'
import type { ArtistMiniResponse } from 'server/api/artist/types/ArtistResponse'
import type { PlaylistResponse } from 'server/api/playlist/types/MiniPlaylistResponse'
import type { Entity } from 'server/api/stack/types'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MuzaIcon from '~/icons/MuzaIcon'
import { useDraggable } from '~/lib/hooks/useDraggable'
import { cn } from '~/lib/utils'
import { usePlayerStore } from '~/store/playerStore'

import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import { PlaylistImgPreview } from '../albumDisplays/PlaylistImgPreview'

interface EntityPreviewProps {
  entity: Entity
  entityType: EntityTypeEnum
  onClick?: MouseEventHandler<Element>
  isPlaying?: boolean
  showPreview?: boolean
  showHoverActions?: boolean
  draggable?: boolean
  playlistMode?: boolean
  onRemoveEntity?: (entity: Entity) => void
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const EntityPreview: React.FC<EntityPreviewProps> = ({
  entity,
  entityType,
  onClick,
  isPlaying = false,
  showPreview = false,
  showHoverActions = true,
  draggable = false,
  playlistMode = false,
  onRemoveEntity,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const { currentTrack, playPause, playQueue } = usePlayerStore()
  const isInLibrary = getIsInLibrary(entityType, entity.id)

  const { dragHandlers, preventClickWhileDragging } = useDraggable({
    type: entityType,
    data: entity,
    enabled: draggable,
  })

  const addToLibrary = async () => {
    await toggleAddLibrary(entityType, entity.id)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      preventClickWhileDragging(e, onClick)
    } else {
      // Default navigation behavior
      switch (entityType) {
        case EntityTypeEnum.Track: {
          const track = entity as TrackResponse
          if (currentTrack?.id === track.id) {
            playPause()
          } else {
            playQueue({ items: [track], startIndex: 0 })
          }
          break
        }
        case EntityTypeEnum.Album:
          navigate(`/albums/${entity.id}`)
          break
        case EntityTypeEnum.Artist:
          navigate(`/artists/${entity.id}`)
          break
        case EntityTypeEnum.Playlist:
          navigate(`/playlists/${entity.id}`)
          break
      }
    }
  }

  const getImageSrc = (): string => {
    switch (entityType) {
      case EntityTypeEnum.Track:
        return (entity as TrackResponse).imageSrc!
      case EntityTypeEnum.Album:
        return (entity as AlbumResponse).coverArt!
      case EntityTypeEnum.Artist:
        return (entity as ArtistMiniResponse).imageUrl!
      case EntityTypeEnum.Playlist:
        return (entity as PlaylistResponse).imageSrc!
      default:
        return '/art/imag_1.jpg'
    }
  }

  const getTitle = (): string => {
    switch (entityType) {
      case EntityTypeEnum.Track:
        return (entity as TrackResponse).title
      case EntityTypeEnum.Album:
        return (entity as AlbumResponse).title
      case EntityTypeEnum.Artist:
        return (entity as ArtistMiniResponse).name
      case EntityTypeEnum.Playlist:
        return (entity as PlaylistResponse).title
      default:
        return ''
    }
  }

  const renderDetails = () => {
    switch (entityType) {
      case EntityTypeEnum.Track: {
        const track = entity as TrackResponse
        return (
          <>
            {showPreview && (
              <div className='rounded border border-(--muza-light-border-color) bg-white/50 px-3 py-0.5 text-sm backdrop-blur-sm'>
                Preview
              </div>
            )}
            <div className='flex items-center gap-2 whitespace-nowrap'>
              <Link className='hover:underline' to={`/artists/${track.artistId}`}>
                {track.artist}
              </Link>
              <span className='text-(--colors_muted_foreground_light,#6b7280)'>•</span>
              <Link className='hover:underline' to={`/albums/${track.albumId}`}>
                {track.album}
              </Link>
            </div>
          </>
        )
      }
      case EntityTypeEnum.Album: {
        const album = entity as AlbumResponse
        return (
          <Link className='hover:underline' to={`/artists/${album.artist.id}`}>
            {album.artist.name!}
          </Link>
        )
      }
      case EntityTypeEnum.Artist: {
        const artist = entity as ArtistMiniResponse
        return <span>{artist.albumsCount} Albums</span>
      }
      case EntityTypeEnum.Playlist: {
        const playlist = entity as PlaylistResponse
        return (
          <>
            <span>{playlist.author || 'Unknown'}</span>
            <span className='text-(--colors_muted_foreground_light,#6b7280)'>•</span>
            <span>{playlist.trackCount} Tracks</span>
          </>
        )
      }
      default:
        return null
    }
  }

  const renderRightSection = () => {
    if (playlistMode) {
      return (
        <>
          {isHovered && (
            <button
              className='flex h-9 w-9 items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-black/5'
              title='Remove'
              onClick={e => {
                e.stopPropagation()
                onRemoveEntity?.(entity)
              }}
            >
              <MuzaIcon iconName='trash' />
            </button>
          )}
        </>
      )
    }

    return (
      <>
        {showHoverActions && isHovered && (
          <button
            className='flex h-9 w-9 items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-black/5'
            title='More options'
            onClick={e => {
              e.stopPropagation()
              // Handle more options
            }}
          >
            <MuzaIcon iconName='ellipsis' />
          </button>
        )}

        <button
          className='flex h-9 w-9 items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-black/5'
          title='Add to library'
          onClick={e => {
            e.stopPropagation()
            addToLibrary()
          }}
        >
          <MuzaIcon iconName={isInLibrary ? 'heart' : 'plus'} />
        </button>

        {entityType === EntityTypeEnum.Track && (
          <span className='w-9 text-right text-sm font-normal text-(--colors_background_dark,#111827)'>
            {(entity as TrackResponse).time
              ? formatDuration((entity as TrackResponse).time!)
              : '00:00'}
          </span>
        )}
      </>
    )
  }

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center rounded-(--muza-border-radius-md) bg-(--colors_background_light) px-0 py-2 pl-3 transition-colors hover:bg-(--muza-hover-background)',
        isPlaying && 'bg-(--muza-hover-background)',
        draggable && 'cursor-grab select-none active:cursor-grabbing'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragHandlers}
    >
      <div className='flex flex-1 items-center justify-between'>
        {/* Cover Image */}
        <div
          className='relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-(--muza-border-radius-sm,4px) shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]'
          onClick={e => preventClickWhileDragging(e, handleClick)}
        >
          {entityType === EntityTypeEnum.Playlist ? (
            <PlaylistImgPreview playlist={entity as PlaylistResponse} />
          ) : (
            <img
              src={getImageSrc()}
              alt={`${getTitle()} cover`}
              className='h-full w-full bg-(--muza-image-background-color-bg) object-cover'
            />
          )}
          {isHovered && !playlistMode && entityType === EntityTypeEnum.Track && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100'>
              <button
                className='flex h-7 w-7 items-center justify-center border-none bg-transparent text-white'
                onClick={e => {
                  e.stopPropagation()
                  handleClick(e as unknown as React.MouseEvent<HTMLDivElement>)
                }}
              >
                <MuzaIcon iconName={isPlaying ? 'pause' : 'play'} />
              </button>
            </div>
          )}
        </div>

        {/* Entity Info */}
        <div className='ml-3 flex min-w-0 flex-1 flex-col gap-2'>
          <div className='flex items-end gap-2'>
            <h3 className='truncate text-base leading-5 font-medium text-(--colors_background_dark,#111827)'>
              {getTitle()}
            </h3>
          </div>

          <div className='flex items-center gap-2 text-base leading-none font-normal text-(--colors_muted_foreground_light,#6b7280)'>
            {renderDetails()}
          </div>
        </div>

        {/* Right Section with Gradient */}
        <div className='relative flex shrink-0 items-center gap-3 bg-linear-to-l from-transparent via-(--muza-hover-background) to-(--base-background)'>
          {renderRightSection()}
          {entityType === EntityTypeEnum.Track && !isHovered && (
            <span className='w-9 text-right text-sm font-normal text-(--colors_background_dark,#111827)'>
              {(entity as TrackResponse).time
                ? formatDuration((entity as TrackResponse).time!)
                : '00:00'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default EntityPreview
