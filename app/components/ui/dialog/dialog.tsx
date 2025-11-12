import type { ComponentProps, ReactNode } from 'react'

import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog-primitives'

export interface DialogProps extends ComponentProps<typeof DialogPrimitive> {
  trigger?: ReactNode
  title?: ReactNode
  description?: ReactNode
  ContentProps?: ComponentProps<typeof DialogContent>
  HeaderProps?: ComponentProps<typeof DialogHeader>
}

export function Dialog(props: DialogProps) {
  const { trigger, title, description, children, ContentProps, HeaderProps, ...restOfProps } = props

  return (
    <DialogPrimitive {...restOfProps}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent {...ContentProps}>
        <DialogHeader {...HeaderProps}>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}
      </DialogContent>
    </DialogPrimitive>
  )
}
