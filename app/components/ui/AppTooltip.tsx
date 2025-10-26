import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { forwardRef, type PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  triggerProps?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
  asChild?: boolean
}
export const AppTooltip = forwardRef<HTMLButtonElement, Props>(
  ({ children, content, side = 'top', triggerProps = {}, asChild = false }, ref) => {
    if (!content) return children
    return (
      <TooltipPrimitive.TooltipProvider>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Content side={side} className='tooltip' sideOffset={12}>
            {content}
          </TooltipPrimitive.Content>
          <TooltipPrimitive.Trigger ref={ref} asChild={asChild} {...triggerProps}>
            {children}
          </TooltipPrimitive.Trigger>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.TooltipProvider>
    )
  }
)

AppTooltip.displayName = 'AppTooltip'
