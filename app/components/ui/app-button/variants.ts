import { cva } from 'class-variance-authority'

export const buttonVariants = cva('app-btn', {
  variants: {
    variant: {
      default: 'app-btn-default',
      destructive: 'app-btn-destructive',
      outline: 'app-btn-outline',
      secondary: 'app-btn-secondary',
      ghost: 'app-btn-ghost',
      link: 'app-btn-link',
    },
    size: {
      default: 'app-btn-size-md',
      sm: 'app-btn-size-sm',
      lg: 'app-btn-size-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})
