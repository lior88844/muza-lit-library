import type { ColDef, ICellRendererParams, RowClickedEvent } from 'ag-grid-community'
import { useCallback, useMemo, useState } from 'react'
import { useLoaderData, useNavigate, useNavigation, useRevalidator } from 'react-router'
import { toast } from 'react-toastify'
import { db } from 'server/db/connection'

import { adminApiClient } from '~/components/adminUpload/services/adminApiClient'
import { Button } from '~/components/ui/button'
import { DataGrid } from '~/components/ui/data-grid/DataGrid'
import MuzaIcon from '~/icons/MuzaIcon'

import type { Route } from './+types/admin-data'
type EntityType = {
  value: string
  label: string
  hasDetails?: boolean
}
const ENTITY_TYPES: EntityType[] = [
  { value: 'albums', label: 'Albums', hasDetails: true },
  { value: 'artists', label: 'Artists', hasDetails: true },
  { value: 'tracks', label: 'Tracks' },
  { value: 'playlists', label: 'Playlists', hasDetails: true },
  { value: 'labels', label: 'Labels' },
  // { value: 'stacks', label: 'Stacks' },
  // { value: 'stackItems', label: 'Stack Items' },
  // { value: 'userLibrary', label: 'User Library' },
] as const

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const entityTypeEnum = url.searchParams.get('entityType') || 'albums'
  const entityType = ENTITY_TYPES.find(entity => entity.value === entityTypeEnum)

  try {
    let data: unknown[] = []

    switch (entityTypeEnum) {
      case 'albums':
        data = await db.query.albums.findMany()
        break
      case 'artists':
        data = await db.query.artists.findMany()
        break
      case 'tracks':
        data = await db.query.tracks.findMany()
        break
      case 'playlists':
        data = await db.query.playlists.findMany()
        break
      case 'labels':
        data = await db.query.labels.findMany()
        break
      case 'stacks':
        data = await db.query.stacks.findMany()
        break
      // case 'stackItems':
      //   data = await db.query.stackItems.findMany()
      //   break
      // case 'userLibrary':
      //   data = await db.query.userLibrary.findMany()
      //   break
      // default:
      //   data = await db.query.albums.findMany()
    }

    // Convert dates and arrays to strings for ag-grid compatibility
    const formattedData = data.map(item => {
      const formatted: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
        if (value instanceof Date) {
          formatted[key] = value.toISOString()
        } else if (Array.isArray(value)) {
          formatted[key] = JSON.stringify(value)
        } else if (value !== null && typeof value === 'object') {
          formatted[key] = JSON.stringify(value)
        } else {
          formatted[key] = value
        }
      }
      return formatted
    })
    return {
      success: true,
      data: formattedData,
      entityType,
    }
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      entityType,
    }
  }
}

export default function AdminData() {
  const navigate = useNavigate()
  const loaderData = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const revalidator = useRevalidator()
  const loading = navigation.state === 'loading'
  const { data = [], entityType } = loaderData
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

  const handleEntityChange = (newEntityType: string) => {
    navigate(`/admin/data?entityType=${newEntityType}`)
  }

  const handleDeleteAlbum = useCallback(
    async (albumId: number, event: React.MouseEvent) => {
      event.stopPropagation()

      if (
        !confirm(
          `Are you sure you want to delete this album and all its tracks? This action cannot be undone.`
        )
      ) {
        return
      }

      setDeletingIds((prev: Set<number>) => new Set(prev).add(albumId))

      try {
        const response = await adminApiClient.delete('/api/admin/albums', {
          data: { albumIds: [albumId] },
        })

        if (response.data.success) {
          toast.success(
            `Successfully deleted ${response.data.deletedAlbums} album(s) and ${response.data.deletedTracks} track(s)`
          )
          revalidator.revalidate()
        } else {
          toast.error(`Failed to delete album: ${response.data.errors.join(', ')}`)
        }
      } catch (error) {
        console.error('Error deleting album:', error)
        toast.error('Failed to delete album. Please try again.')
      } finally {
        setDeletingIds((prev: Set<number>) => {
          const next = new Set(prev)
          next.delete(albumId)
          return next
        })
      }
    },
    [revalidator]
  )

  // Generate column definitions from the first row of data
  const columnDefs = useMemo<ColDef[]>(() => {
    if (!data || data.length === 0) return []

    const firstRow = data[0]
    const baseColumns: ColDef[] = Object.keys(firstRow).map(key => ({
      field: key,
      headerName: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim(),
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    }))

    // Add delete action column for albums
    if (entityType?.value === 'albums') {
      baseColumns.push({
        colId: 'actions',
        headerName: '',
        pinned: 'right' as const,
        sortable: false,
        filter: false,
        resizable: false,
        width: 50,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        cellRenderer: (params: ICellRendererParams) => {
          const albumId = params.data?.id as number
          const isDeleting = deletingIds.has(albumId)

          return (
            <Button
              variant='ghost'
              size='icon'
              className='text-destructive hover:text-destructive h-8 w-8'
              onClick={e => {
                handleDeleteAlbum(albumId, e)
              }}
              disabled={isDeleting}
              title='Delete album'
            >
              <MuzaIcon iconName='trash' className='h-4 w-4' />
            </Button>
          )
        },
      })
    }

    return baseColumns
  }, [data, entityType, deletingIds, handleDeleteAlbum])

  const handleRowClicked = (event: RowClickedEvent) => {
    const { data } = event
    if (event.eventPath?.some(path => (path as HTMLElement).tagName === 'BUTTON')) {
      return
    }

    if (data && entityType?.hasDetails) {
      navigate(`/${entityType.value}/${data.id}`)
    }
  }

  return (
    <div className='bg-background flex min-h-screen flex-col p-6'>
      <div className='mx-auto flex w-full max-w-[1920px] flex-col gap-6'>
        {/* Entity Type Selector */}
        <div className='flex flex-wrap gap-2'>
          {ENTITY_TYPES.map(entity => (
            <Button
              key={entity.value}
              variant={entityType?.value === entity.value ? 'default' : 'outline'}
              onClick={() => handleEntityChange(entity.value)}
              className='min-w-[120px]'
            >
              {entity.label}
            </Button>
          ))}
        </div>

        {/* AG Grid */}
        <DataGrid
          rowData={data}
          onRowClicked={handleRowClicked}
          columnDefs={columnDefs}
          entityName={entityType?.value}
          rowClass={entityType?.hasDetails ? 'cursor-pointer' : ''}
          loading={loading}
          className='h-[calc(100vh-var(--admin-header-height)-100px)]'
          hideExport
        />
      </div>
    </div>
  )
}
