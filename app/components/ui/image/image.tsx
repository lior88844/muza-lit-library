import type { ComponentProps } from 'react'

interface ImageProps extends Omit<ComponentProps<'img'>, 'src'> {
  src?: string | null
  fallbackSrc?: string
}

export function Image({ src, fallbackSrc, ...nativeProps }: ImageProps) {
  const imageSrc = src ?? fallbackSrc ?? FALLBACK_IMAGE_URL

  return (
    <img
      src={imageSrc}
      {...nativeProps}
      onError={ev => ((ev.target as HTMLImageElement).src = FALLBACK_IMAGE_URL)}
    />
  )
}

const FALLBACK_IMAGE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3C/svg%3E"
