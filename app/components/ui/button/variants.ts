import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'cursor-pointer inline-flex items-center gap-2 py-2 rounded-full text-base/[1.25] font-medium transition-all duration-300 hover:shadow-sm disabled:cursor-default disabled:opacity-50 disabled:hover:shadow-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-muted hover:bg-primary/90 disabled:hover:bg-primary',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:hover:bg-destructive',
        outline:
          'text-text-dark bg-background/50 border border-light hover:border-secondary-foreground hover:shadow-xs hover:bg-secondary disabled:hover:border-light disabled:hover:shadow-none disabled:hover:bg-background/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:hover:bg-secondary',
        ghost:
          'bg-transparent text-background-dark hover:bg-secondary hover:shadow-none disabled:hover:bg-transparent',
        link: 'text-primary hover:underline hover:shadow-none disabled:hover:no-underline',
      },
      size: {
        default: 'px-4',
        sm: 'px-3',
        lg: 'px-8',
        icon: 'py-2.5 px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
