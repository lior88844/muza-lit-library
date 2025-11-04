import React from 'react'

import type { SongDetails } from '../../store/models'
import styles from './MusicSuggestionsList.module.css'
import SuggestionsListItem from './SuggestionsListItem'

interface MusicSuggestionsListProps {
  songs: SongDetails[]
  title: string
}

const MusicSuggestionsList: React.FC<MusicSuggestionsListProps> = ({ songs, title }) => {
  return (
    <div className={styles['music-suggestions-content']}>
      <div className={styles['music-suggestions-header']}> {title} </div>
      <div className={styles['music-suggestions-playlist']}>
        <div className={styles['songs-list']}>
          {songs.map((song, index) => (
            <SuggestionsListItem key={index} details={song} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MusicSuggestionsList
