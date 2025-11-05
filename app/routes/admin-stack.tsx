import type { ColDef } from 'ag-grid-community'
import { asc, eq } from 'drizzle-orm'
import { useMemo, useState } from 'react'
import { useActionData, useLoaderData, useNavigate, useNavigation } from 'react-router'
import { db } from 'server/db/connection'
import { stackItems, stacks } from 'server/db/schema'
import type { Stack, StackEntityTypeEnum, StackSelectionTypeEnum } from 'server/db/stack.entity'

import DataGrid from '~/components/ui/data-grid/DataGrid'

import type { Route } from './+types/admin-stack'

const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'explore', label: 'Explore' },
] as const

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const pageIdentifier = url.searchParams.get('page') || 'home'

  try {
    const stacksData = await db
      .select()
      .from(stacks)
      .where(eq(stacks.pageIdentifier, pageIdentifier))
      .orderBy(asc(stacks.displayOrder))

    // Fetch stack items for each stack
    const stacksWithItems = await Promise.all(
      stacksData.map(async stack => {
        const items = await db
          .select()
          .from(stackItems)
          .where(eq(stackItems.stackId, stack.id))
          .orderBy(asc(stackItems.displayOrder))

        return {
          ...stack,
          items,
        }
      })
    )

    return {
      success: true,
      stacks: stacksWithItems,
      pageIdentifier,
    }
  } catch (error) {
    console.error('Error fetching stacks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stacks: [],
      pageIdentifier,
    }
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent') as string

  try {
    if (intent === 'createStack') {
      const pageIdentifier = formData.get('pageIdentifier') as string
      const title = formData.get('title') as string
      const entityType = formData.get('entityType') as StackEntityTypeEnum
      const selectionType = formData.get('selectionType') as StackSelectionTypeEnum
      const displayOrder = parseInt(formData.get('displayOrder') as string, 10)

      if (!pageIdentifier || !title || !entityType || !selectionType) {
        return {
          success: false,
          error: 'Missing required fields',
        }
      }

      const [newStack] = await db
        .insert(stacks)
        .values({
          pageIdentifier,
          title,
          entityType,
          selectionType,
          displayOrder: displayOrder || 0,
          filterConfig: formData.get('filterConfig')
            ? JSON.parse(formData.get('filterConfig') as string)
            : null,
          isActive: true,
        })
        .returning()

      return {
        success: true,
        stack: newStack,
      }
    }

    if (intent === 'updateStack') {
      const id = parseInt(formData.get('id') as string, 10)
      const updates: Partial<Stack> = {}

      if (formData.get('title')) updates.title = formData.get('title') as string
      if (formData.get('entityType'))
        updates.entityType = formData.get('entityType') as StackEntityTypeEnum
      if (formData.get('selectionType'))
        updates.selectionType = formData.get('selectionType') as StackSelectionTypeEnum
      if (formData.get('displayOrder'))
        updates.displayOrder = parseInt(formData.get('displayOrder') as string, 10)
      if (formData.get('filterConfig'))
        updates.filterConfig = JSON.parse(formData.get('filterConfig') as string)
      if (formData.get('isActive') !== null) updates.isActive = formData.get('isActive') === 'true'

      await db.update(stacks).set(updates).where(eq(stacks.id, id))

      return {
        success: true,
      }
    }

    if (intent === 'deleteStack') {
      const id = parseInt(formData.get('id') as string, 10)
      await db.delete(stacks).where(eq(stacks.id, id))
      return {
        success: true,
      }
    }

    return {
      success: false,
      error: 'Invalid intent',
    }
  } catch (error) {
    console.error('Stack action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export default function AdminStack() {
  const navigate = useNavigate()
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  const [selectedPage, setSelectedPage] = useState(loaderData.pageIdentifier || 'home')

  const stacks = loaderData.stacks || []
  const isLoading = navigation.state === 'loading'

  const handlePageChange = (page: string) => {
    setSelectedPage(page)
    navigate(`/admin/stack?page=${page}`)
  }

  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      { field: 'displayOrder', headerName: 'Order' },
      { field: 'title', headerName: 'Title', editable: true },
      { field: 'entityType', headerName: 'Entity Type' },
      { field: 'selectionType', headerName: 'Selection Type' },
      { field: 'isActive', headerName: 'Active' },
    ]
  }, [])

  return (
    <div className='bg-background min-h-screen flex flex-col'>
      {/* Controls */}
      <div className='py-4 px-8'>
        <div className='flex items-center gap-2'>
          {PAGE_OPTIONS.map(page => (
            <button
              key={page.value}
              onClick={() => handlePageChange(page.value)}
              className={`border rounded-full py-2 px-4 font-sans text-base font-medium cursor-pointer flex items-center justify-between gap-2 transition-colors duration-200 ease-in-out leading-5 ${
                selectedPage === page.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/50 border-border-light text-[#030712] backdrop-blur-[10px] hover:bg-(--muza-hover-background,#eeeeee)'
              }`}
            >
              <span>{page.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className='flex-1 px-8 pb-4 flex flex-col'>
        <DataGrid
          hideHeader
          rowData={stacks}
          columnDefs={columnDefs}
          entityName='stacks'
          className='h-[calc(100vh-var(--admin-header-height)-100px)]'
          hideExport
        />
      </div>
    </div>
  )
}
