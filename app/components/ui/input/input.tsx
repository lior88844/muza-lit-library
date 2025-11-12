'use client'

import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '~/lib/utils'

import { Typography } from '../typography'
import { inputVariants } from './variants'

export interface InputProps extends ComponentProps<'input'>, VariantProps<typeof inputVariants> {
  label?: ReactNode
  helperText?: ReactNode
  containerClassName?: string
  inputClassName?: string
  iconStart?: ReactNode
  iconEnd?: ReactNode
}

export function Input(props: InputProps) {
  const {
    className,
    label,
    helperText,
    containerClassName,
    inputClassName,
    iconStart,
    iconEnd,
    variant,
    ...restOfProps
  } = props

  const labelRef = useRef<HTMLSpanElement>(null)
  const [labelWidth, setLabelWidth] = useState(0)

  useLayoutEffect(() => {
    if (!labelRef.current) return

    const { width } = labelRef.current.getBoundingClientRect()
    setLabelWidth(Math.round(width))
  }, [label])

  const isInvalid = restOfProps['aria-invalid'] === true || restOfProps['aria-invalid'] === 'true'

  const cloneIconComponent = (icon: ReactNode): ReactNode => {
    if (!icon || !isValidElement(icon)) return icon

    const iconElement = icon as ReactElement<{ className?: string }>
    const existingClassName = iconElement.props?.className

    const iconClassName = cn(
      'shrink-0',
      isInvalid ? 'text-destructive' : 'text-inherit',
      existingClassName
    )

    return cloneElement(iconElement, {
      ...iconElement.props,
      className: iconClassName,
    })
  }

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

        <div className={cn(inputVariants({ variant }), className)}>
          {iconStart && cloneIconComponent(iconStart)}

          <input
            data-slot='input'
            className={cn(
              'placeholder:text-muted-foreground h-full w-full text-base/tight font-normal text-inherit outline-none',
              'file:text-foreground selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'disabled:pointer-events-none',
              inputClassName
            )}
            {...restOfProps}
          />

          {iconEnd && cloneIconComponent(iconEnd)}
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
