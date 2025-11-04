import React from 'react'

import styles from './ToggleButton.module.css'

interface ToggleButtonProps {
  checked: boolean
  label?: string
  disabled?: boolean
  onChange: (checked: boolean) => void
}

/**
 * @deprecated will make new Toggle component a la Shadcn UI
 */
const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  label = '',
  disabled = false,
  onChange,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  return (
    <div className={styles.toggleWrapper} onClick={handleToggle}>
      <label className={styles.toggle}>
        <input type='checkbox' checked={checked} disabled={disabled} onChange={handleToggle} />
        <span className={styles.slider}> </span>
      </label>
      {label && <span className={styles.label}> {label} </span>}
    </div>
  )
}

export default ToggleButton
