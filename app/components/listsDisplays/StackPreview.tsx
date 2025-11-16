import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AlbumResponse } from 'server/api/album/types/AlbumResponse'
import type { ArtistMiniResponse } from 'server/api/artist/types/ArtistResponse'
import type { PlaylistResponse } from 'server/api/playlist/types/MiniPlaylistResponse'
import type { StackWithEntities } from 'server/api/stack/types'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import { cn } from '~/lib/utils'
import * as drawerStore from '~/store/drawerStore'
import type { MusicPlaylist } from '~/store/models'
import { usePlayerStore } from '~/store/playerStore'

import AlbumPreview from '../albumDisplays/AlbumPreview'
import PlaylistCover from '../albumDisplays/PlaylistCover'
import { ArtistPreview } from '../artistDisplays/ArtistPreview'
import TrackPreview from '../songLineDisplays/TrackPreview'
import { Button } from '../ui/button'
import { Typography } from '../ui/typography'

interface Props {
  stack: StackWithEntities
  maxItems?: number
}

export function StackPreview(props: Props) {
  const { stack, maxItems = DEFAULT_MAX_ITEMS } = props
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation()
  const { currentTrack, playQueue, playPause } = usePlayerStore()
  const { isPlaylistDrawerOpen, isStackDrawerOpen } = drawerStore.useDrawerStore()

  const itemsToShow = isExpanded ? stack.items : stack.items.slice(0, maxItems)

  const renderContent = () => {
    switch (stack.entityType) {
      case EntityTypeEnum.Album:
        return itemsToShow.map(item => (
          <AlbumPreview
            key={item.id}
            details={item.entity as AlbumResponse}
            draggable={isPlaylistDrawerOpen || isStackDrawerOpen}
          />
        ))
      case EntityTypeEnum.Artist:
        return itemsToShow.map(item => (
          <ArtistPreview
            key={item.id}
            details={item.entity as ArtistMiniResponse}
            draggable={isStackDrawerOpen}
          />
        ))
      case EntityTypeEnum.Playlist:
        return itemsToShow.map(item => {
          const playlist = item.entity as PlaylistResponse
          return (
            <PlaylistCover
              key={item.id}
              draggable={isStackDrawerOpen}
              playlist={playlist as MusicPlaylist}
            />
          )
        })
      case EntityTypeEnum.Track:
        return itemsToShow.map((item, index) => {
          const track = item.entity as TrackResponse
          const allTracks = stack.items.map(i => i.entity as TrackResponse)
          return (
            <TrackPreview
              key={track.id}
              track={track}
              onClick={() => {
                if (currentTrack?.id === track.id) {
                  playPause()
                } else {
                  playQueue({
                    items: allTracks,
                    startIndex: index,
                    source: {
                      type: item.entityType,
                      id: stack.id,
                      title: stack.title,
                    },
                  })
                }
              }}
              draggable={isPlaylistDrawerOpen || isStackDrawerOpen}
            />
          )
        })
      default:
        return null
    }
  }

  const getContentClass = () => {
    switch (stack.entityType) {
      case EntityTypeEnum.Track:
        return 'grid gap-2 grid-cols-2 lg:grid-cols-3'
      case EntityTypeEnum.Artist:
      case EntityTypeEnum.Album:
      case EntityTypeEnum.Playlist:
      default:
        return cn(
          'grid gap-4',
          'grid-cols-2',

          'md:max-[892px]:grid-cols-3',

          'min-[892px]:max-lg:grid-cols-4',

          'lg:grid-cols-5',

          !isExpanded && [
            'max-md:[&>*:nth-child(n+3)]:!hidden',

            'md:max-[892px]:[&>*:nth-child(3)]:flex',
            'md:max-[892px]:[&>*:nth-child(n+4)]:!hidden',

            'min-[892px]:max-lg:[&>*:nth-child(3)]:flex',
            'min-[892px]:max-lg:[&>*:nth-child(4)]:flex',
            'min-[892px]:max-lg:[&>*:nth-child(5)]:!hidden',

            'lg:[&>*:nth-child(5)]:flex',
          ]
        )
    }
  }

  return (
    <div className='flex flex-col'>
      <div className='mb-4 flex items-center justify-between'>
        <Typography variant='h4'>{stack.title}</Typography>

        {stack.items.length > maxItems && (
          <Button variant='ghost' size='sm' onClick={() => setIsExpanded(prev => !prev)}>
            {isExpanded ? t('action.showLess') : t('action.showAll')}
          </Button>
        )}
      </div>

      <div className={getContentClass()}>{renderContent()}</div>
    </div>
  )
}

const DEFAULT_MAX_ITEMS = 5
