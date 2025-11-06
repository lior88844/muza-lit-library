import type { VariantProps } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import { cn } from '~/lib/utils'

import { VARIANT_ELEMENT_MAP } from './const'
import { typographyVariants } from './variants'

type TypographyElementType = (typeof VARIANT_ELEMENT_MAP)[keyof typeof VARIANT_ELEMENT_MAP]

export interface TypographyProps
  extends VariantProps<typeof typographyVariants>,
    ComponentPropsWithoutRef<'p'> {
  as?: TypographyElementType
}

export const Typography = forwardRef<HTMLElementTagNameMap[TypographyElementType], TypographyProps>(
  function Typography(props, ref) {
    const { as, variant, className, ...restOfProps } = props

    const Component = as ?? VARIANT_ELEMENT_MAP[variant ?? 'default']

    return (
      <Component
        ref={ref}
        className={cn(typographyVariants({ variant }), className)}
        {...restOfProps}
      />
    )
  }
)
