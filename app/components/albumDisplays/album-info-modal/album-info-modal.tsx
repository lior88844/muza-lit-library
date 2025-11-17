import { XCircleIcon } from 'lucide-react'
import { type FC, Fragment } from 'react'
import { Link } from 'react-router'
import type {
  AlbumArtistResponse,
  AlbumResponse,
  LabelResponse,
} from 'server/api/album/types/AlbumResponse'

import { Dialog } from '~/components/ui/dialog'
import { Typography } from '~/components/ui/typography'

import { AlbumInfo } from './components/album-info'

interface AlbumInfoProps {
  isOpen: boolean
  album: AlbumResponse
  onClose: () => void
}

export const AlbumInfoModal: FC<AlbumInfoProps> = ({ isOpen, album, onClose }) => {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString()
  }

  const infoItems = [
    {
      key: 'Recording Date',
      value: formatDate(album.releaseDate),
    },
    {
      key: 'Album Type',
      value: album.albumType,
    },
    {
      key: 'Status',
      value: album.status,
    },
    {
      key: 'Track Count',
      value: album.tracks?.length ?? 0,
    },
  ]

  const identifierItems =
    album.catalogNumber || album.barcode
      ? [
          {
            key: 'Catalog Number',
            value: album.catalogNumber,
          },
          {
            key: 'Barcode',
            value: album.barcode,
          },
        ]
      : []

  const renderLabelValue = (label: LabelResponse) => {
    const parts: string[] = []

    if (label.catalogNumber) {
      parts.push(`Catalog: ${label.catalogNumber}`)
    }
    if (label.country) {
      parts.push(label.country)
    }
    if (label.disambiguation) {
      parts.push(label.disambiguation)
    }

    return parts.join(' • ')
  }
  const otherArtistsByRoles = album.otherArtists.reduce(
    (acc, artist) => {
      artist.roles.forEach(role => {
        const roleToShow = role || 'Member'
        if (!acc[roleToShow]) {
          acc[roleToShow] = []
        }
        acc[roleToShow].push(artist)
      })
      return acc
    },
    {} as Record<string, AlbumArtistResponse[]>
  )
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title={
        <Typography
          variant='h2'
          as='span'
          className='text-primary-foreground relative z-10 text-4xl leading-none'
        >
          {album.title}
        </Typography>
      }
      description={
        <Typography
          variant='h2'
          as='span'
          className='text-primary-foreground relative z-10 leading-none font-normal'
        >
          {album.artist.name}
        </Typography>
      }
      ContentProps={{
        className: 'w-[480px] p-0 overflow-hidden',
        CloseButtonContent: (
          <XCircleIcon className='text-muted-foreground fill-primary-foreground' />
        ),
      }}
      HeaderProps={{
        className:
          'pb-6 pt-19 ps-17 gap-1 bg-no-repeat bg-cover bg-top shadow-md relative before:absolute before:inset-0 before:bg-linear-to-b before:from-transparent before:to-black/95 before:z-0',
        style: {
          backgroundImage: `url(${album.coverArt})`,
        },
      }}
    >
      <div className='max-h-99.5 overflow-y-auto p-10 pt-6'>
        <div className='flex flex-col gap-9.5'>
          <AlbumInfo
            info={[album.artist]}
            getReactKey={artist => artist.id.toString()}
            renderKey={artist => artist.roles.join(', ') || 'Main Artist'}
            renderValue={artist => <Link to={`/artists/${artist.id}`}>{artist.name}</Link>}
          />
          <div className='grid grid-cols-2 gap-x-16 gap-y-2'>
            {Object.entries(otherArtistsByRoles).map(([role, artists]) => (
              <Fragment key={role}>
                <Typography as='span' className='text-text-muted'>
                  {role}
                </Typography>
                <Typography as='span'>
                  {artists.map(a => (
                    <Link key={a.artistId} to={`/artists/${a.artistId}`}>
                      {a.name}
                    </Link>
                  ))}
                </Typography>
              </Fragment>
            ))}
          </div>

          <AlbumInfo
            info={infoItems}
            getReactKey={artist => artist.key}
            renderKey={artist => artist.key}
            renderValue={artist => artist.value}
          />

          <AlbumInfo<LabelResponse>
            info={album.labels ?? []}
            getReactKey={label => label.id.toString()}
            renderKey={label => label.name + (label.labelCode ? ` (${label.labelCode})` : '')}
            renderValue={label => renderLabelValue(label)}
          />

          <AlbumInfo
            info={identifierItems}
            getReactKey={item => item.key}
            renderKey={item => item.key}
            renderValue={item => item.value}
          />

          <AlbumInfo
            info={album.genres?.length ? [{ key: 'Genres', value: album.genres }] : []}
            getReactKey={genre => genre.key.toString()}
            renderKey={genre => genre.key}
            renderValue={genre => genre.value?.join(', ')}
          />

          <AlbumInfo
            info={album.tags?.length ? [{ key: 'Tags', value: album.tags }] : []}
            getReactKey={tag => tag.key.toString()}
            renderKey={tag => tag.key}
            renderValue={tag => tag.value.join(', ')}
          />

          <AlbumInfo
            info={album.notes?.length ? [{ key: 'Notes', value: album.notes }] : []}
            getReactKey={note => note.key.toString()}
            renderKey={note => note.key}
            renderValue={note => note.value}
          />
        </div>
      </div>
    </Dialog>
  )
}
