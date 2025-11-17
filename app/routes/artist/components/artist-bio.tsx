import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'
import { Typography, type TypographyProps } from '~/components/ui/typography'
import { cn } from '~/lib/utils'

type Props = TypographyProps & {
  text: string
  maxLines?: number
}

export function ArtistBio(props: Props) {
  const { text, maxLines = 4, className, ...restOfProps } = props
  const { t } = useTranslation()
  const textRef = useRef<HTMLParagraphElement>(null)
  const [truncatedText, setTruncatedText] = useState<string | null>(null)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const buttonText = t('artist.readAllBio')

  useLayoutEffect(() => {
    const element = textRef.current
    if (!element) return

    const truncateText = () => {
      const style = getComputedStyle(element)
      const lineHeight = parseFloat(style.lineHeight)
      const maxHeight = lineHeight * maxLines

      const clone = element.cloneNode(false) as HTMLElement
      clone.style.position = 'absolute'
      clone.style.visibility = 'hidden'
      clone.style.width = getComputedStyle(element).width
      clone.textContent = text
      element.parentElement?.appendChild(clone)

      const needsTrunc = clone.scrollHeight > maxHeight

      if (!needsTrunc) {
        clone.remove()
        setNeedsTruncation(false)
        setTruncatedText(null)
        setIsReady(true)
        return
      }

      const words = text.split(' ')
      let truncated = text

      for (let i = words.length - 1; i >= 0; i--) {
        truncated = words.slice(0, i).join(' ')
        clone.textContent = `${truncated}... ${buttonText}`

        if (clone.scrollHeight <= maxHeight) break
      }

      clone.remove()
      setNeedsTruncation(true)
      setTruncatedText(truncated)
      setIsReady(true)
    }

    truncateText()
    window.addEventListener('resize', truncateText)
    return () => window.removeEventListener('resize', truncateText)
  }, [text, maxLines, buttonText])

  return (
    <>
      <Typography
        variant='h4'
        as='p'
        ref={textRef}
        className={cn(
          'text-text-inverse absolute top-66 max-w-1/2 font-normal',
          className,
          !isReady && 'invisible -z-1'
        )}
        {...restOfProps}
      >
        {needsTruncation && truncatedText ? (
          <>
            {truncatedText}
            {'... '}
            <Button
              variant='link'
              size='sm'
              onClick={() => setIsDialogOpen(true)}
              className='cursor-pointer p-0 leading-[inherit] text-inherit underline'
              style={{ fontSize: 'inherit', fontWeight: 'inherit' }}
            >
              {buttonText}
            </Button>
          </>
        ) : (
          text
        )}
      </Typography>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t('artist.artistBioDialogTitle')}
        description={t('artist.artistBioDialogDesc')}
      >
        {text}
      </Dialog>
    </>
  )
}
