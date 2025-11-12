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
      <TooltipPrimitive.TooltipProvider delayDuration={300}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger ref={ref} asChild={asChild} {...triggerProps}>
            {children}
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              side={side}
              className='z-50 max-w-[320px] min-w-[280px] rounded-md bg-[#1f2937] p-3 text-left shadow-lg'
              sideOffset={12}
            >
              {content}
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.TooltipProvider>
    )
  }
)

AppTooltip.displayName = 'AppTooltip'
