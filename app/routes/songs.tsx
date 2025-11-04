import '../styles/variables.css'

import { useEffect, useMemo, useState } from 'react'

import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import { Typography } from '~/components/ui/typography'
import { useTranslation } from '~/lib/i18n/translations'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { useMedia } from '~/store/media/mediaContext'
import type { SongDetails as SongDetailsType } from '~/store/models'

import { MediaTypeEnum } from '../../server/db/user-library.entity'

export default function Songs() {
  const { t } = useTranslation()
  const { setSelectedSong, selectedSong, setIsPlaying } = useCurrentPlayerStore()
  const { library, songs } = useMedia()
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleSongClick = (song: SongDetailsType) => {
    setSelectedSong(song)
    setIsPlaying(true)
  }

  const librarySongs = useMemo(() => {
    const songIds = library
      .filter(item => item.resourceType === MediaTypeEnum.Track)
      .map(i => i.resourceId)

    return songs.filter(song => songIds.includes(song.id))
  }, [library, songs])

  if (loading) return <p>{t('general.loading')}</p>
  if (error) return <p>{t('general.errorWithMessage').replace('{error}', error)}</p>

  return (
    <div className={'flex flex-col gap-3'}>
      <Typography variant='h1' as='h2' className='py-4 px-8'>
        {t('page.songs')}
      </Typography>

      <div className={'px-8 pb-17.5'}>
        <div className={'flex flex-col gap-2'}>
          {librarySongs.map(song => (
            <SongLineWithCover
              key={song.id}
              details={song}
              onClick={() => handleSongClick(song)}
              isPlaying={selectedSong?.id === song.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
