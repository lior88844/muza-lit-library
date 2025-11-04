import React from 'react'

import MuzaButton from '../../controls/MuzaButton'
import type { SongDetails } from '../../store/models'
import SongDetailsView from '../songLineDisplays/SongDetails'
import styles from './SuggestionsListItem.module.css'

export type SuggestionsListItemProps = {
  details: SongDetails
}

const SuggestionsListItem: React.FC<SuggestionsListItemProps> = ({ details }) => {
  return (
    <div className={styles['suggestions-list-item']}>
      <span className={styles.left}>
        <SongDetailsView details={details} onClick={() => {}} />
      </span>
      <MuzaButton content='+' />
    </div>
  )
}

export default SuggestionsListItem
