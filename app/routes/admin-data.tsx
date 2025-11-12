import type { ColDef } from 'ag-grid-community'
import { useMemo, useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams } from 'react-router'
import { db } from 'server/db/connection'

import { Button } from '~/components/ui/button'
import { DataGrid } from '~/components/ui/data-grid/DataGrid'

import type { Route } from './+types/admin-data'

const ENTITY_TYPES = [
  { value: 'albums', label: 'Albums' },
  { value: 'artists', label: 'Artists' },
  { value: 'tracks', label: 'Tracks' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'labels', label: 'Labels' },
  { value: 'stacks', label: 'Stacks' },
  { value: 'stackItems', label: 'Stack Items' },
  { value: 'userLibrary', label: 'User Library' },
] as const

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const entityType = url.searchParams.get('entityType') || 'albums'

  try {
    let data: unknown[] = []

    switch (entityType) {
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
      case 'stackItems':
        data = await db.query.stackItems.findMany()
        break
      case 'userLibrary':
        data = await db.query.userLibrary.findMany()
        break
      default:
        data = await db.query.albums.findMany()
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
  const [searchParams] = useSearchParams()
  const currentEntityType = searchParams.get('entityType') || 'albums'
  const [selectedEntity, setSelectedEntity] = useState(currentEntityType)

  const { data = [], entityType } = loaderData

  const handleEntityChange = (newEntityType: string) => {
    setSelectedEntity(newEntityType)
    navigate(`/admin/data?entityType=${newEntityType}`)
  }

  // Generate column definitions from the first row of data
  const columnDefs = useMemo<ColDef[]>(() => {
    if (!data || data.length === 0) return []

    const firstRow = data[0]
    return Object.keys(firstRow).map(key => ({
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
  }, [data])

  return (
    <div className='bg-background flex min-h-screen flex-col p-6'>
      <div className='mx-auto flex w-full max-w-[1920px] flex-col gap-6'>
        {/* Entity Type Selector */}
        <div className='flex flex-wrap gap-2'>
          {ENTITY_TYPES.map(entity => (
            <Button
              key={entity.value}
              variant={selectedEntity === entity.value ? 'default' : 'outline'}
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
          columnDefs={columnDefs}
          entityName={entityType}
          className='h-[calc(100vh-var(--admin-header-height)-100px)]'
          hideExport
        />
      </div>
    </div>
  )
}
