import { generatePlaylistCoverImages } from '~/lib/utils'
import type { MusicPlaylist } from '~/store/models'

import styles from './PlaylistCover.module.css'
interface Props {
  playlist: MusicPlaylist
}
export const PlaylistImgPreview = ({ playlist }: Props) => {
  const albumImages = generatePlaylistCoverImages(playlist)
  if (!albumImages) return null
  return (
    <div className={styles.playlistCoverCollage}>
      <div
        className={`${styles.playlistCoverImage} ${styles.playlistCoverImageTopLeft}`}
        style={{ backgroundImage: `url('${albumImages[0]}')` }}
      />
      <div
        className={`${styles.playlistCoverImage} ${styles.playlistCoverImageTopRight}`}
        style={{ backgroundImage: `url('${albumImages[1]}')` }}
      />
      <div
        className={`${styles.playlistCoverImage} ${styles.playlistCoverImageBottomLeft}`}
        style={{ backgroundImage: `url('${albumImages[2]}')` }}
      />
      <div
        className={`${styles.playlistCoverImage} ${styles.playlistCoverImageBottomRight}`}
        style={{ backgroundImage: `url('${albumImages[3]}')` }}
      />
    </div>
  )
}
