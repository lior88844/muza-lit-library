import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { EntityTypeEnum } from 'server/db/stack.entity'

import { useDraggable } from '~/lib/hooks/useDraggable'
import { cn } from '~/lib/utils'

import type { Artist } from '../../store/models'
import { Image } from '../ui/image'
import { Typography } from '../ui/typography'

interface ArtistDetailsProps {
  details: Artist
  draggable?: boolean
}

export function ArtistPreview({ details, draggable = false }: ArtistDetailsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { dragHandlers, isDragging } = useDraggable({
    type: EntityTypeEnum.Artist,
    data: details,
    enabled: draggable,
  })

  const onArtistClick = () => {
    navigate(`/artists/${details.id}`)
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1',
        draggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
      {...dragHandlers}
      onClick={onArtistClick}
    >
      <Image
        src={details.imageUrl}
        alt={details.name}
        className='aspect-square w-full rounded-full object-cover shadow-md'
      />

      <div>
        <Typography className='mb-1 font-medium'>{details.name}</Typography>

        <Typography variant='caption' as='p' className='text-text-tertiary w-max'>
          {details.albumsCount} {t('common.albums')}
        </Typography>
      </div>
    </div>
  )
}
