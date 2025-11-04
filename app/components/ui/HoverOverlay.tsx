import React from 'react'

import MuzaIcon from '~/icons/MuzaIcon'

import styles from './HoverOverlay.module.css'

interface HoverAction {
  icon: string
  onClick: (e: React.MouseEvent) => void
  title?: string
  customComponent?: React.ReactNode
}

interface HoverOverlayProps {
  isPlaying?: boolean
  onPlayPause?: (e: React.MouseEvent) => void
  actions?: HoverAction[]
  showPlayButton?: boolean
}

const HoverOverlay: React.FC<HoverOverlayProps> = ({
  isPlaying = false,
  onPlayPause,
  actions = [],
  showPlayButton = true,
}) => {
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlayPause?.(e)
  }

  return (
    <div className={styles.hoverOverlay}>
      {/* Play/Pause button in center */}
      {showPlayButton && onPlayPause && (
        <button className={styles.hoverPlayPauseBtn} onClick={handlePlayPause}>
          <MuzaIcon iconName={isPlaying ? 'pause' : 'play-hover'} />
        </button>
      )}

      {/* Action buttons in bottom-left */}
      {actions.length > 0 && (
        <div className={styles.hoverOverlayActions}>
          {actions.map((action, index) => (
            <div key={index}>
              {action.customComponent ? (
                action.customComponent
              ) : (
                <button
                  className={styles.hoverOverlayBtn}
                  onClick={action.onClick}
                  title={action.title}
                >
                  <MuzaIcon iconName={action.icon} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HoverOverlay
