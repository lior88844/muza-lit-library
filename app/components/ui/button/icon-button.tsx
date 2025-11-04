import type { ReactElement } from 'react'

import { cn } from '~/lib/utils'

import { Button, type ButtonProps } from './button'

interface IconButtonProps extends Omit<ButtonProps, 'iconStart' | 'iconEnd' | 'children' | 'size'> {
  icon: ReactElement
}

export function IconButton(props: IconButtonProps) {
  const { icon, className, ...restOfProps } = props

  return (
    <Button size='icon' className={cn('rounded-full', className)} {...restOfProps}>
      {icon}
    </Button>
  )
}
