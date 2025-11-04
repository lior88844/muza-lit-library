import type { ComponentProps } from 'react'

import { cn } from '~/lib/utils'

export function Divider(props: ComponentProps<'hr'>) {
  const { className, ...restOfProps } = props

  return (
    <hr className={cn('my-3', 'bg-border-light', 'h-px', 'border-0', className)} {...restOfProps} />
  )
}
