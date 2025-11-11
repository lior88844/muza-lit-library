import React, { useEffect, useState } from 'react'

import MuzaIcon from '~/icons/MuzaIcon'

import styles from './MuzaInputField.module.css'

export type ValidationRule =
  | { type: 'required'; message: string }
  | { type: 'minLength' | 'maxLength'; value: number; message: string }
  | { type: 'pattern'; value: RegExp; message: string }
  | { type: 'email'; message: string }
  | { type: 'custom'; validator: (value: string) => boolean; message: string }

export interface MuzaInputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  leadingIcon?: string
  trailingIcon?: string
  helperText?: string
  validationRules?: ValidationRule[]
  inputSize?: 'small' | 'medium' | 'large'
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * @deprecated Use the Input component instead
 */
const MuzaInputField: React.FC<MuzaInputFieldProps> = ({
  label,
  required,
  name,
  type = 'text',
  placeholder,
  disabled,
  inputSize = 'medium',
  leadingIcon,
  trailingIcon,
  helperText = '',
  validationRules = [],
  onChange,
  value: propValue,
  ...rest
}) => {
  const [value, setValue] = useState<string>(String(propValue ?? ''))
  const [validationMessage, setValidationMessage] = useState<string>('')
  const [inputState, setInputState] = useState<'default' | 'success' | 'error'>('default')

  useEffect(() => {
    setValue(String(propValue ?? ''))
  }, [propValue])

  const validateInput = (val: string): { isValid: boolean; message: string } => {
    for (const rule of validationRules) {
      switch (rule.type) {
        case 'required':
          if (!val.trim()) return { isValid: false, message: rule.message }
          break
        case 'minLength':
          if (val.length < rule.value) return { isValid: false, message: rule.message }
          break
        case 'maxLength':
          if (val.length > rule.value) return { isValid: false, message: rule.message }
          break
        case 'pattern':
          if (!rule.value.test(val)) return { isValid: false, message: rule.message }
          break
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
            return { isValid: false, message: rule.message }
          break
        case 'custom':
          if (!rule.validator(val)) return { isValid: false, message: rule.message }
          break
      }
    }
    return { isValid: true, message: '' }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setValue(newVal)

    const { isValid, message } = validateInput(newVal)
    setValidationMessage(message)
    setInputState(isValid ? (newVal ? 'success' : 'default') : 'error')

    if (onChange) {
      onChange(e)
    }
  }

  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label htmlFor={`input-${name}`}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputContainer}>
        {leadingIcon && (
          <span className={styles.leadingIcon}>
            <MuzaIcon iconName={leadingIcon} />
          </span>
        )}
        <input
          id={`input-${name}`}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={handleInputChange}
          className={`${styles[inputState]} ${styles[inputSize]} ${leadingIcon ? styles['has-leading-icon'] : ''} ${trailingIcon ? styles['has-trailing-icon'] : ''}`}
          {...rest}
        />
        {trailingIcon && (
          <span className={styles.trailingIcon}>
            <MuzaIcon iconName={trailingIcon} />
          </span>
        )}
      </div>
      {(validationMessage || helperText) && (
        <div className={`${styles.helperText} ${styles[inputState]}`}>
          {validationMessage || helperText}
        </div>
      )}
    </div>
  )
}

export default MuzaInputField
