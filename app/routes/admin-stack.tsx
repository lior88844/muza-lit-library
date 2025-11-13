import type { CellValueChangedEvent, ColDef } from 'ag-grid-community'
import type { CustomCellRendererProps } from 'ag-grid-react'
import { useMemo, useState } from 'react'
import { useLoaderData, useNavigate, useNavigation, useSearchParams } from 'react-router'
import {
  createStack,
  deleteStack,
  getStacksByPage,
  updateStack,
  updateStackWithItems,
} from 'server/api/stack/stack.service'
import type { StackWithEntities, StackWithItems } from 'server/api/stack/types'
import { StackPageIdEnum, StackSelectionTypeEnum } from 'server/db/stack.entity'
import { EntityTypeEnum } from 'server/db/stack.entity'

import { AppSelect } from '~/components/ui/app-select'
import { Button } from '~/components/ui/button'
import DataGrid from '~/components/ui/data-grid/DataGrid'
import useFetcherAsync from '~/lib/useFetcherAsync'
import { useDrawerStore } from '~/store/drawerStore'
import type { StackToEdit } from '~/store/models'

import type { Route } from './+types/admin-stack'

const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'explore', label: 'Explore' },
]

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const pageId = (url.searchParams.get('page') as StackPageIdEnum) || StackPageIdEnum.Home

  try {
    const stacksWithItems = await getStacksByPage(pageId)
    return {
      success: true,
      stacks: stacksWithItems,
      pageId,
    }
  } catch (error) {
    console.error('Error fetching stacks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stacks: [],
      pageId,
    }
  }
}
interface StackActionData {
  intent: 'createStack' | 'updateStack' | 'deleteStack' | 'updateStackOrder'
  data: StackWithItems
}
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent') as string
  try {
    if (intent === 'createStack') {
      const { items, ...stackData } = JSON.parse(
        formData.get('data') as string
      ) as StackActionData['data']
      const newStack = await createStack(stackData, items)

      return {
        success: true,
        stack: newStack,
      }
    }

    if (intent === 'updateStack') {
      const { id, items, ...rest } = JSON.parse(
        formData.get('data') as string
      ) as StackActionData['data']
      await updateStackWithItems(id!, rest, items)

      return {
        success: true,
      }
    }

    if (intent === 'deleteStack') {
      const { id } = JSON.parse(formData.get('data') as string) as StackActionData['data']
      if (!id) {
        return {
          success: false,
          error: 'Stack ID is required',
        }
      }
      await deleteStack(id)
      return {
        success: true,
      }
    }

    if (intent === 'updateStackOrder') {
      const stacks = JSON.parse(formData.get('data') as string) as StackActionData['data'][]
      for (const stack of stacks) {
        await updateStack(stack.id, { displayOrder: stack.displayOrder })
      }
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
  const removeFetcher = useFetcherAsync<{ success: boolean; error: string }>()
  const updateFetcher = useFetcherAsync<{ success: boolean; error: string }>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const [selectedPage, setSelectedPage] = useState(
    (searchParams.get('page') as StackPageIdEnum) || StackPageIdEnum.Home
  )
  const { openStackDrawer } = useDrawerStore()
  const stacks = loaderData.stacks || []
  const isLoading = navigation.state === 'loading'

  const handlePageChange = (page: StackPageIdEnum) => {
    setSelectedPage(page)
    navigate(`/admin/stack?page=${page}`)
  }

  const columnDefs = useMemo<ColDef<StackWithEntities>[]>(() => {
    const handleEditStack = (stack: StackWithEntities) => {
      openStackDrawer(stack)
      navigate('/')
    }

    const handleDeleteStack = (stack: StackWithEntities) => {
      removeFetcher.submit(
        {
          intent: 'deleteStack',
          data: JSON.stringify({ id: stack.id }),
        },
        {
          method: 'POST',
          action: '/admin/stack',
        }
      )
    }

    return [
      {
        field: 'displayOrder',
        headerName: 'Order',
        valueGetter: params => params.data!.displayOrder + 1,
        maxWidth: 100,
        rowDrag: true,
      },
      {
        field: 'title',
        headerName: 'Title',
        editable: true,
      },
      {
        field: 'entityType',
        headerName: 'Type',
        valueGetter: params =>
          params.data!.entityType.charAt(0).toUpperCase() + params.data!.entityType.slice(1),
      },
      { field: 'isActive', headerName: 'Active', editable: true, maxWidth: 100 },
      {
        field: 'id',
        headerName: 'Actions',
        cellRenderer: (params: CustomCellRendererProps<StackWithEntities>) => (
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              className='bg-secondary'
              size='icon'
              onClick={() => handleEditStack(params.data!)}
            >
              Edit
            </Button>
            <Button
              variant='ghost'
              className='bg-secondary'
              size='icon'
              onClick={() => handleDeleteStack(params.data!)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ]
  }, [navigate, openStackDrawer, removeFetcher])

  const handleCellValueChanged = ({
    colDef,
    data,
    newValue,
  }: CellValueChangedEvent<StackWithEntities>) => {
    const field = colDef?.field as keyof StackWithEntities
    const value = newValue as unknown as StackWithEntities[typeof field]
    updateFetcher.submit(
      {
        intent: 'updateStack',
        data: JSON.stringify({ [field]: value, id: data.id }),
      },
      { method: 'POST', action: '/admin/stack' }
    )
  }
  const handleCreateStack = () => {
    const newStack: StackToEdit = {
      title: 'New Stack',
      description: '',
      entityType: EntityTypeEnum.Album,
      selectionType: StackSelectionTypeEnum.Manual,
      displayOrder: stacks.length,
      filterConfig: null,
      isActive: true,
      pageId: selectedPage,
      items: [],
    }
    // Store in global state and navigate to home
    openStackDrawer(newStack)
    navigate('/')
  }
  const handleRowOrderChange = (order: StackWithEntities[]) => {
    const payload = order.map((stack, index) => ({
      id: stack.id,
      displayOrder: index,
    }))

    updateFetcher.submit(
      {
        intent: 'updateStackOrder',
        data: JSON.stringify(payload),
      },
      { method: 'POST', action: '/admin/stack' }
    )
  }
  return (
    <div className='bg-background relative flex min-h-screen flex-col'>
      {/* Controls */}
      <div className='px-8 py-4'>
        <div className='flex items-center justify-between gap-4'>
          <AppSelect
            value={selectedPage}
            options={PAGE_OPTIONS}
            onChange={value => handlePageChange(value as StackPageIdEnum)}
            placeholder='Select page'
            triggerClassName='w-[180px]'
          />
          <Button onClick={handleCreateStack} variant='default'>
            Create stack
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col px-8 pb-4'>
        <DataGrid
          hideHeader
          rowData={stacks}
          onCellValueChanged={handleCellValueChanged}
          onRowOrderChange={handleRowOrderChange}
          columnDefs={columnDefs}
          loading={isLoading}
          entityName='stacks'
          className='h-[calc(100vh-var(--admin-header-height)-100px)]'
          hideExport
        />
      </div>
    </div>
  )
}
