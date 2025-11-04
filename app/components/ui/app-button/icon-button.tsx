import type { ReactElement } from 'react'

import { AppButton, type ButtonProps } from './app-button'

interface IconButtonProps extends Omit<ButtonProps, 'iconStart' | 'iconEnd' | 'children' | 'size'> {
  icon: ReactElement
}

export function IconButton(props: IconButtonProps) {
  const { icon, ...buttonProps } = props

  return (
    <AppButton size='default' {...buttonProps}>
      {icon}
    </AppButton>
  )
}
