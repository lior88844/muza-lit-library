import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ElementType } from 'react'

import type { VARIANT_ELEMENT_MAP } from './const'
import type { typographyVariants } from './variants'

type ElementToHTMLElement<T extends ElementType> = T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : HTMLElement

export type InferRefType<
  TAs extends ElementType | undefined,
  TVariant extends keyof typeof VARIANT_ELEMENT_MAP | undefined,
> = TAs extends ElementType
  ? ElementToHTMLElement<TAs>
  : TVariant extends keyof typeof VARIANT_ELEMENT_MAP
    ? ElementToHTMLElement<(typeof VARIANT_ELEMENT_MAP)[TVariant]>
    : HTMLElementTagNameMap['p']

type BaseTypographyProps = VariantProps<typeof typographyVariants>

export type TypographyProps<TAs extends ElementType = ElementType> = BaseTypographyProps &
  (TAs extends string
    ? Omit<ComponentPropsWithoutRef<TAs>, keyof BaseTypographyProps | 'as'>
    : Omit<ComponentPropsWithoutRef<'p'>, keyof BaseTypographyProps | 'as'>) & {
    as?: TAs
  }
