import { cva } from 'class-variance-authority'

export const typographyVariants = cva('text-text-base', {
  variants: {
    variant: {
      default: 'text-base/tight font-normal',
      caption: 'text-sm/[16px] font-normal',
      h4: 'text-lg/tight font-bold',
      h3: 'text-xl/none font-bold',
      h2: 'text-2xl/none font-bold',
      h1: 'text-3xl/none font-bold',
    },
  },
})
