import './artist-details.scss'

import type { Artist } from 'server/db/artist.entity'

import { Image } from '~/components/ui/image/image'

type ArtistHeaderProps = {
  artist: Artist
}

export function ArtistDetails({ artist }: ArtistHeaderProps) {
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
          <p className='artist-details-content-content'>{artist.bio}</p>
        </span>

        <button>Follow</button>
      </div>

      <div className='artist-details-stats'></div>
    </section>
  )
}
