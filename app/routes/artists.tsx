import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import ArtistDetails from '~/components/artistDisplays/ArtistDetails'
import { useTranslation } from '~/lib/i18n/translations'
import { useMedia } from '~/store/media/mediaContext'

export default function Artists() {
  const { t } = useTranslation()
  const library = useMedia()
  const artists = library.artists
  return (
    <main>
      <h1>{t('page.artists')}</h1>
      <hr />
      <div className='artist-list'>
        {artists.map((artist: any) => (
          <ArtistDetails key={artist.id} details={artist} />
        ))}
      </div>
    </main>
  )
}
