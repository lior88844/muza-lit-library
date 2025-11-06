import * as React from 'react'

import { cn } from '~/lib/utils'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

export interface AppSelectOption {
  value: string
  label: string
}

export interface AppSelectProps {
  value: string
  options: AppSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
  size?: 'sm' | 'default'
}

export function AppSelect({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className,
  triggerClassName,
  disabled,
  size = 'default',
}: AppSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        size={size}
        className={cn(
          'border-border-light rounded-full! border bg-white/50 px-4 py-2 font-sans text-base leading-5 font-medium text-[#030712] backdrop-blur-[10px] transition-colors duration-200 ease-in-out',
          'hover:bg-(--muza-hover-background,#eeeeee)',
          'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none',
          'data-[size=default]:h-auto data-[size=sm]:h-auto',
          className,
          triggerClassName
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
