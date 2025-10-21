import './PlaylistItem.scss'

import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@radix-ui/react-context-menu'
import React from 'react'

import MuzaButton from '../../controls/MuzaButton'
import type { SongDetails } from '../../store/models'
import { formatSongNumber } from '../../store/utils'
import MuzaContainer from '../ui/MuzaContainer'
import SongDetailsView from './SongDetails'

interface PlaylistItemProps {
  details: SongDetails
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ details }) => {
  return (
    <div className='playlist-item'>
      <span className='left'>
        <span className='track-number'>{formatSongNumber(details.index || 1)}</span>
        <SongDetailsView details={details} onClick={() => {}} />
      </span>
      <ContextMenu>
        <ContextMenuTrigger>
          <MuzaButton content='•••' />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <MuzaContainer>context menu </MuzaContainer>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

export default PlaylistItem
