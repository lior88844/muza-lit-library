import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { forwardRef } from 'react'

import { cn } from '~/lib/utils'

import { buttonVariants } from './variants'

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asWrapper?: boolean
  iconStart?: ReactNode
  iconEnd?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { className, variant, size, asWrapper, children, iconStart, iconEnd, ...restOfProps } =
    props

  const Comp = asWrapper ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      data-slot='button'
      className={cn(buttonVariants({ variant, size }), className)}
      {...restOfProps}
    >
      {iconStart}
      {children}
      {iconEnd}
    </Comp>
  )
})
