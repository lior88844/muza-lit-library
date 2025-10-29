import './artist-details.scss'

import type { Artist } from 'server/db/artist.entity'

import { Image } from '~/components/ui/image'
import { useTranslation } from '~/lib/i18n/translations'

type ArtistHeaderProps = {
  artist: Artist
}

export function ArtistDetails({ artist }: ArtistHeaderProps) {
  const { t } = useTranslation()

  return (
    <section className='artist-details' aria-label='Artist header'>
      <Image
        src={artist.image}
        className='artist-details-image'
        alt='artist image'
        fetchPriority='high'
      />

      <div className='artist-details-content'>
        <span>
          <h2 className='artist-details-content-title'>{artist.name}</h2>

          <p className='artist-details-content-content' title={artist.bio ?? undefined}>
            {artist.bio}
          </p>
        </span>

        {/* TODO: Button.tsx */}
        <button className='temp-btn'>{t('common.follow')}</button>
      </div>

      <div className='artist-details-stats'>
        <span>ITM</span>
        <span>ITM</span>
        <span>ITM</span>
        <span>ITM</span>
      </div>
    </section>
  )
}
