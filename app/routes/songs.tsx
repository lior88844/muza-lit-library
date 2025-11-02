import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'
import './songs.scss'

import { useEffect, useMemo, useState } from 'react'

import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
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
    <main className='songs-page'>
      <div className='page-header'>
        <h1>{t('page.songs')}</h1>
      </div>

      <div className='songs-list-container'>
        <div className='songs-list'>
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
    </main>
  )
}
