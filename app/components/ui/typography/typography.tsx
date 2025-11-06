import { type ElementType, forwardRef, type Ref } from 'react'

import { cn } from '~/lib/utils'

import { VARIANT_ELEMENT_MAP } from './const'
import type { InferRefType, TypographyProps } from './types'
import { typographyVariants } from './variants'

export const Typography = forwardRef(function Typography<TAs extends ElementType = ElementType>(
  props: TypographyProps<TAs>,
  ref: Ref<InferRefType<TAs, NonNullable<TypographyProps<TAs>['variant']>>>
) {
  const { as, variant, className, ...restOfProps } = props

  const Component = (as ?? VARIANT_ELEMENT_MAP[variant ?? 'default']) as ElementType

  return (
    <Component
      ref={ref as Ref<HTMLElement>}
      className={cn(typographyVariants({ variant }), className)}
      {...restOfProps}
    />
  )
})
