import { cva } from 'class-variance-authority'

export const inputVariants = cva(
  'flex items-center gap-2 text-background-dark bg-background dark:bg-input/30 h-9 w-[314px] min-w-0 overflow-hidden rounded-full px-3 transition-[border-color,box-shadow] duration-300 has-disabled:cursor-not-allowed has-disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'border border-input',
          'focus-within:border-secondary-foreground focus-within:shadow-xs',
          'has-[:aria-invalid]:border-destructive has-[:aria-invalid]:ring-destructive/20 dark:has-[:aria-invalid]:ring-destructive/40',
        ],
        ghost: [
          'border-0',
          'has-[:aria-invalid]:ring-2 has-[:aria-invalid]:ring-destructive/20 dark:has-[:aria-invalid]:ring-destructive/40',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
