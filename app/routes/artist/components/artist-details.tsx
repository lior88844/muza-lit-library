import { useTranslation } from 'react-i18next'
import type { ArtistResponse } from 'server/api/artist/types/ArtistResponse'

import { Button } from '~/components/ui/button'
import { Image } from '~/components/ui/image'
import { Typography } from '~/components/ui/typography'
import { ArtistBio } from '~/routes/artist/components/artist-bio'

import { StatisticItem } from './statistic-item'

type ArtistHeaderProps = {
  artist: ArtistResponse
}

export function ArtistDetails({ artist }: ArtistHeaderProps) {
  const { t } = useTranslation()

  return (
    <section aria-label='Artist header'>
      <div className='absolute top-0 left-0 -z-1 h-100 w-full before:absolute before:inset-0 before:z-0 before:bg-linear-to-b before:from-transparent before:to-black/50'>
        <Image
          src={artist.image}
          className='h-full w-full object-cover object-top'
          alt='artist image'
          fetchPriority='high'
        />
      </div>

      <div className='mt-28 flex flex-col items-start gap-4'>
        <Typography
          variant='h2'
          className='text-text-inverse max-w-[30ch] truncate text-6xl'
          title={artist.name}
        >
          {artist.name}
        </Typography>

        <Button variant='secondary' className='w-36 justify-center'>
          {t('common.follow')}
        </Button>

        {artist.bio && <ArtistBio text={artist.bio} />}
      </div>

      <div className='absolute end-8 top-10 flex gap-3'>
        <StatisticItem value={artist.albumArtists.length} label={t('artistInfo.albumsUploaded')} />
        <StatisticItem value={0} label={t('artistInfo.monthlyListeners')} />
      </div>
    </section>
  )
}
