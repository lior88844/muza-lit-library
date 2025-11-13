import '../styles/variables.css'

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { getUserLibrary } from 'server/api/user-library/user-library.service'
import { EntityTypeEnum } from 'server/db/stack.entity'

import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import { Typography } from '~/components/ui/typography'
import { useDrawerStore } from '~/store/drawerStore'
import { usePlayerStore } from '~/store/playerStore'
import { userContext } from '~/store/router-context'

import type { Route } from './+types/songs'

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext)
  if (!user) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }
  const libraryTracks = await getUserLibrary<EntityTypeEnum.Track>(user.id, EntityTypeEnum.Track)
  return {
    libraryTracks,
  }
}
export default function Songs() {
  const { t } = useTranslation()
  const { playQueue, currentTrack: current } = usePlayerStore()
  const { isPlaylistDrawerOpen } = useDrawerStore()
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const { libraryTracks } = useLoaderData<typeof loader>()
  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleSongClick = (song: TrackResponse, index: number) => {
    playQueue({
      items: librarySongs,
      startIndex: index,
      source: { type: EntityTypeEnum.Track, title: 'Songs' },
    })
  }

  const librarySongs = useMemo(() => {
    return libraryTracks?.map(item => item.entity) || []
  }, [libraryTracks])

  if (loading) return <p>{t('general.loading')}</p>
  if (error) return <p>{t('general.errorWithMessage', { error })}</p>

  return (
    <div className={'flex flex-col gap-3'}>
      <Typography variant='h1' as='h2' className='px-8 py-4'>
        {t('page.songs')}
      </Typography>

      <div className={'px-8 pb-17.5'}>
        <div className={'flex flex-col gap-2'}>
          {librarySongs.map((song, index) => (
            <SongLineWithCover
              key={song.id}
              track={song}
              onClick={() => handleSongClick(song, index)}
              isPlaying={current?.id === song.id}
              draggable={isPlaylistDrawerOpen}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
