import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import MuzaIcon from '~/icons/MuzaIcon'

interface SearchInputProps {
  /**
   * Callback fired when the search value changes
   */
  onSearchChange?: (searchText: string) => void
  /**
   * Whether to automatically navigate to search page on input
   * @default true
   */
  autoNavigate?: boolean
  /**
   * Debounce delay in milliseconds for navigation
   * @default 500
   */
  debounceMs?: number
  /**
   * Controlled value for the input
   */
  value?: string
  /**
   * Callback when value changes (for controlled mode)
   */
  onChange?: (value: string) => void
  /**
   * Placeholder text
   */
  placeholder?: string
  /**
   * Additional className for the container
   */
  className?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearchChange,
  autoNavigate = true,
  debounceMs = 500,
  value: controlledValue,
  onChange,
  placeholder,
  className = '',
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [internalValue, setInternalValue] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onSearchChange?.(newValue)
    onChange?.(newValue)

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Navigate to search page after user stops typing (debounce)
    if (autoNavigate) {
      if (newValue.trim().length > 0) {
        searchTimeoutRef.current = setTimeout(() => {
          navigate(`/search?q=${encodeURIComponent(newValue.trim())}`)
        }, debounceMs)
      } else if (newValue.trim().length === 0) {
        // Navigate to home if search is cleared
        navigate('/')
      }
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim().length > 0) {
      // Clear timeout and navigate immediately on Enter
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (autoNavigate) {
        navigate(`/search?q=${encodeURIComponent(value.trim())}`)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative max-w-[600px] min-w-[200px] flex-1 ${className}`}>
      <div className='flex w-full flex-col gap-2'>
        <div className='relative h-9 w-full rounded-full bg-white'>
          <div className='relative box-border flex h-9 w-full items-center justify-start gap-1 overflow-clip px-3 py-1'>
            <div className='relative flex h-4 w-4 shrink-0 items-start justify-center overflow-clip'>
              <MuzaIcon iconName='search' />
            </div>
            <input
              type='text'
              placeholder={placeholder || t('form.searchPlaceholder')}
              value={value}
              onChange={handleSearchInput}
              onKeyDown={handleSearchKeyDown}
              className='text-muted-foreground focus:text-foreground placeholder:text-muted-foreground relative min-h-0 min-w-0 flex-1 shrink-0 border-none bg-transparent p-0 text-left text-sm leading-5 font-normal tracking-[0.25px] text-ellipsis whitespace-nowrap outline-none placeholder:opacity-100 focus:border-none focus:shadow-none'
              style={{
                fontFamily:
                  "var(--typography_font_family_font_sans, 'Founders Grotesk'), sans-serif",
              }}
            />
          </div>
          <div
            className='pointer-events-none absolute inset-0 rounded-full border border-(--muza-light-border-color)'
            aria-hidden='true'
          />
        </div>
      </div>
    </div>
  )
}
