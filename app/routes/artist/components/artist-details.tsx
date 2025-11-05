import { useTranslation } from 'react-i18next'
import type { ArtistResponse } from 'server/api/artist/types/ArtistResponse'

import { Button } from '~/components/ui/button'
import { Image } from '~/components/ui/image'
import { Typography } from '~/components/ui/typography'

import { StatisticItem } from './statistic-item'

type ArtistHeaderProps = {
  artist: ArtistResponse
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
          <Typography variant='h2' className='mb-3'>
            {artist.name}
          </Typography>

          <p className='artist-details-content-bio' title={artist.bio ?? undefined}>
            {artist.bio}
          </p>
        </span>

        <Button>{t('common.follow')}</Button>
      </div>

      <div className='artist-details-stats'>
        <StatisticItem value={artist.albumArtists.length} label={t('artistInfo.albumsUploaded')} />
        <StatisticItem value={0} label={t('artistInfo.monthlyListeners')} />
        <StatisticItem value={0} label={t('common.following')} />
        <StatisticItem value={0} label={t('common.followers')} />
      </div>
    </section>
  )
}
