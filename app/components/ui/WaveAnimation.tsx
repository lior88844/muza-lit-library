import React from 'react'

import styles from './WaveAnimation.module.css'

interface WaveAnimationProps {
  className?: string
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({ className = '' }) => {
  return (
    <div className={`${styles['wave-container']} ${className}`}>
      <div className={styles.bar} />
      <div className={styles.bar} />
      <div className={styles.bar} />
    </div>
  )
}

export default WaveAnimation
