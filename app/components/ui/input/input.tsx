'use client'

import {
  cloneElement,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { cn } from '~/lib/utils'

import { Typography } from '../typography'

interface InputProps extends ComponentProps<'input'> {
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

        <div
          className={cn(
            'flex items-center gap-2',
            'text-background-dark bg-background dark:bg-input/30 border-input h-9 w-[314px] min-w-0 overflow-hidden rounded-full border px-3 transition-[border-color,box-shadow] duration-300',
            'focus-within:border-secondary-foreground focus-within:shadow-xs',
            'has-[:aria-invalid]:border-destructive has-[:aria-invalid]:ring-destructive/20 dark:has-[:aria-invalid]:ring-destructive/40',
            'has-disabled:cursor-not-allowed has-disabled:opacity-50',
            className
          )}
        >
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
