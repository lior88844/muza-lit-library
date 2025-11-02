import './SuggestionsListItem.scss'

import React from 'react'

import MuzaButton from '../../controls/MuzaButton'
import type { SongDetails } from '../../store/models'
import SongDetailsView from '../songLineDisplays/SongDetails'

export type SuggestionsListItemProps = {
  details: SongDetails
}

const SuggestionsListItem: React.FC<SuggestionsListItemProps> = ({ details }) => {
  return (
    <div className='suggestions-list-item'>
      <span className='left'>
        <SongDetailsView details={details} onClick={() => {}} />
      </span>
      <MuzaButton content='+' />
    </div>
  )
}

export default SuggestionsListItem
