import type { ElementType } from 'react'

import type { TypographyProps } from './types'

type Variant = NonNullable<TypographyProps['variant']>

export const VARIANT_ELEMENT_MAP = {
  default: 'p',
  caption: 'caption',
  h4: 'h4',
  h3: 'h3',
  h2: 'h2',
  h1: 'h1',
} as const satisfies Record<Variant, ElementType>
