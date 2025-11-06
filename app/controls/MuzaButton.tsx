import React from 'react'

import MuzaIcon from '~/icons/MuzaIcon'

import styles from './MuzaButton.module.css'

interface MuzaButtonProps {
  content?: string
  iconName?: string
  onClick?: () => void
  disabled?: boolean
  size?: 'small' | 'default' | 'medium'
  className?: string
  'data-name'?: string
}

/**
 * @deprecated use ui/Button.tsx instead
 */
const MuzaButton: React.FC<MuzaButtonProps> = ({
  content,
  iconName,
  onClick,
  disabled = false,
  size = 'default',
  className = '',
  'data-name': dataName,
  ...props
}) => {
  const sizeClass = size !== 'default' ? styles[`muza-button--${size}`] : ''
  const buttonClasses = `${styles['muza-button']} ${sizeClass} ${className}`.trim()

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      data-name={dataName}
      {...props}
    >
      {iconName && <MuzaIcon iconName={iconName} />}
      {content && <span>{content}</span>}
    </button>
  )
}

export default MuzaButton
