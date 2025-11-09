'use client'

import { type ComponentProps, type ReactNode, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '~/lib/utils'

import { Typography } from './typography'

interface InputProps extends ComponentProps<'input'> {
  label?: ReactNode
  helperText?: ReactNode
  containerClassName?: string
  iconStart?: ReactNode
  iconEnd?: ReactNode
}

export function Input(props: InputProps) {
  const { className, label, helperText, containerClassName, iconStart, iconEnd, ...restOfProps } =
    props

  const labelRef = useRef<HTMLSpanElement>(null)
  const [labelWidth, setLabelWidth] = useState(0)

  useLayoutEffect(() => {
    if (!labelRef.current) return

    const { width } = labelRef.current.getBoundingClientRect()
    setLabelWidth(Math.round(width))
  }, [label])

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)}>
      <label className='flex items-center gap-4'>
        {label && (
          <Typography
            ref={labelRef}
            as='span'
            variant='caption'
            className='text-muted-foreground font-medium'
          >
            {label}
          </Typography>
        )}

        <div
          className={cn(
            'flex items-center gap-2',
            'text-background-dark bg-background dark:bg-input/30 border-input h-9 w-[314px] min-w-0 overflow-hidden rounded-full border px-3 transition-[border-color,box-shadow] duration-300',
            'focus-within:border-secondary-foreground focus-within:shadow-xs',
            'has-[:aria-invalid]:border-destructive has-[:aria-invalid]:ring-destructive/20 dark:has-[:aria-invalid]:ring-destructive/40',
            'has-disabled:cursor-not-allowed has-disabled:opacity-50'
          )}
        >
          {iconStart}

          <input
            data-slot='input'
            className={cn(
              'placeholder:text-muted-foreground h-full w-full text-base/tight font-normal text-inherit outline-none',
              'file:text-foreground selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'disabled:pointer-events-none',
              className
            )}
            {...restOfProps}
          />

          {iconEnd}
        </div>
      </label>

      {helperText && (
        <Typography
          as='span'
          variant='caption'
          className='text-muted-foreground inline-block'
          style={{ marginLeft: `${labelWidth + 16}px` }}
        >
          {helperText}
        </Typography>
      )}
    </div>
  )
}
