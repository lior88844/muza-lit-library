'use client'

import { type ComponentProps, type ReactNode, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '~/lib/utils'

import { Typography } from './typography'

interface InputProps extends ComponentProps<'input'> {
  label?: ReactNode
  helperText?: ReactNode
  containerClassName?: string
}

export function Input(props: InputProps) {
  const { className, label, helperText, containerClassName, ...restOfProps } = props

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

        <input
          data-slot='input'
          className={cn(
            'text-background-dark placeholder:text-muted-foreground bg-background dark:bg-input/30 border-input h-9 w-[314px] min-w-0 rounded-full border px-3 py-1 text-base/tight font-normal shadow-xs transition-[color,box-shadow] outline-none',
            'file:text-foreground selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:border-secondary-foreground focus-visible:shadow-sm',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className
          )}
          {...restOfProps}
        />
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
