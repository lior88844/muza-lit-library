import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import type { Entity } from 'server/api/stack/stack.service'

import AlbumPreview from '~/components/albumDisplays/AlbumPreview'
import ArtistPreview from '~/components/artistDisplays/ArtistPreview'
import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import { Button } from '~/components/ui/button'
import DropdownMenu from '~/components/ui/DropdownMenu'
import MuzaInputField from '~/controls/MuzaInputField'
import MuzaIcon from '~/icons/MuzaIcon'
import { useFetcherAsync } from '~/lib/useFetcherAsync'
import { cn } from '~/lib/utils'
import type { Artist, SongDetails, StackItemToEdit, StackToEdit } from '~/store/models'

import { EntityTypeEnum, StackSelectionTypeEnum } from '../../../server/db/stack.entity'

interface StackDrawerProps {
  isOpen: boolean
  onClose: () => void
  tempStack: StackToEdit
  onTempStackUpdate: (stack: StackToEdit) => void
}

const StackDrawer: React.FC<StackDrawerProps> = ({
  isOpen,
  onClose,
  tempStack,
  onTempStackUpdate,
}) => {
  const { t } = useTranslation()
  const [stackName, setStackName] = useState(tempStack.title || '')
  const [stackDescription, setStackDescription] = useState(tempStack.description || '')
  const [isDragOver, setIsDragOver] = useState(false)
  const fetcher = useFetcherAsync<{ success: boolean; error?: string; stack?: unknown }>()
  const navigate = useNavigate()
  // Update stack name and description when tempStack changes
  useEffect(() => {
    if (tempStack.title) {
      setStackName(tempStack.title)
    }
    if (tempStack.description) {
      setStackDescription(tempStack.description)
    }
  }, [tempStack.title, tempStack.description])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false)
    }
  }, [])

  const handleAddEntity = useCallback(
    (entity: Entity, entityType: EntityTypeEnum) => {
      // Only add if entity type matches stack entity type
      if (entityType !== tempStack.entityType) {
        return
      }

      // Check if entity already exists
      const exists = tempStack.items.some(item => item.entity.id === entity.id)
      if (exists) return

      // Create new stack item
      const newItem: StackItemToEdit = {
        stackId: tempStack.id!,
        entityId: entity.id,
        entityType,
        displayOrder: tempStack.items.length + 1,
        entity,
      }

      const updatedItems = [...tempStack.items, newItem]
      onTempStackUpdate({
        ...tempStack,
        items: updatedItems,
      })
    },
    [tempStack, onTempStackUpdate]
  )

  // Helper function to remove entity from stack
  const handleRemoveEntity = useCallback(
    (itemToRemove: StackItemToEdit) => {
      const updatedItems = tempStack.items
        .filter(item => item.entity.id !== itemToRemove.entity.id)
        .map((item, idx) => ({
          ...item,
          displayOrder: idx + 1,
        }))

      onTempStackUpdate({
        ...tempStack,
        items: updatedItems,
      })
    },
    [tempStack, onTempStackUpdate]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const dragData = e.dataTransfer.getData('application/json')
      if (dragData) {
        try {
          const data = JSON.parse(dragData)
          // Handle songs/tracks
          if (data.type === 'song' && data.song) {
            handleAddEntity(data.song, EntityTypeEnum.Track)
          }

          // Handle albums
          if (data.type === 'album' && data.album) {
            handleAddEntity(data.album, EntityTypeEnum.Album)
          }

          // Handle artists
          if (data.type === 'artist' && data.artist) {
            handleAddEntity(data.artist, EntityTypeEnum.Artist)
          }
        } catch {
          // Silently handle parsing errors
        }
      }
    },
    [handleAddEntity]
  )

  const handleClose = useCallback(() => {
    onTempStackUpdate({
      ...tempStack,
      title: stackName,
      description: stackDescription,
    })
    onClose()
  }, [stackName, stackDescription, tempStack, onTempStackUpdate, onClose])

  const handleSave = useCallback(async () => {
    if (!stackName.trim()) {
      toast.error(t('stack.nameRequired') || 'Stack name is required', {
        position: 'bottom-center',
        hideProgressBar: true,
      })
      return
    }

    try {
      const payload: Record<string, unknown> = {
        pageId: tempStack.pageId,
        title: stackName.trim(),
        entityType: tempStack.entityType,
        selectionType: StackSelectionTypeEnum.Manual,
        displayOrder: tempStack.displayOrder,
        description: stackDescription.trim(),
        id: tempStack.id,
        items: [],
      }

      payload.items = tempStack.items.map(({ entity, ...item }) => item)

      const isNewStack = !tempStack.id
      const result = await fetcher.submit(
        {
          intent: isNewStack ? 'createStack' : 'updateStack',
          data: JSON.stringify(payload),
        },
        { method: 'POST', action: '/admin/stack' }
      )

      if (result?.success) {
        toast.success(
          isNewStack
            ? t('stack.created') || 'Stack created successfully'
            : t('stack.updated') || 'Stack updated successfully',
          {
            position: 'bottom-center',
            hideProgressBar: true,
            autoClose: 2000,
          }
        )
        onClose()
        navigate(`/admin/stack?page=${tempStack.pageId}`)
      } else {
        toast.error(
          result?.error ||
            (isNewStack
              ? t('stack.createFailed') || 'Failed to create stack'
              : t('stack.updateFailed') || 'Failed to update stack'),
          {
            position: 'bottom-center',
            hideProgressBar: true,
          }
        )
      }
    } catch {
      toast.error(t('stack.saveFailed') || 'Failed to save stack', {
        position: 'bottom-center',
        hideProgressBar: true,
      })
    }
  }, [stackName, t, tempStack, stackDescription, fetcher, onClose, navigate])

  const getEntityTypeLabel = () => {
    switch (tempStack.entityType) {
      case EntityTypeEnum.Album:
        return t('common.albums')
      case EntityTypeEnum.Artist:
        return t('common.artists')
      case EntityTypeEnum.Track:
        return t('common.songs')
      default:
        return 'Items'
    }
  }

  const handleEntityTypeChange = useCallback(
    (newType: EntityTypeEnum) => {
      if (newType === tempStack.entityType) return

      onTempStackUpdate({
        ...tempStack,
        entityType: newType,
        items: [], // Clear items when changing type
      })
    },
    [tempStack, onTempStackUpdate]
  )

  const dropdownItems = [
    {
      id: 'album',
      title: t('common.albums'),
      onClick: () => handleEntityTypeChange(EntityTypeEnum.Album),
    },
    {
      id: 'artist',
      title: t('common.artists'),
      onClick: () => handleEntityTypeChange(EntityTypeEnum.Artist),
    },
    {
      id: 'song',
      title: t('common.songs'),
      onClick: () => handleEntityTypeChange(EntityTypeEnum.Track),
    },
  ]

  const renderStackItem = (item: StackItemToEdit, index: number) => {
    if (!item.entity) return null

    switch (item.entityType) {
      case EntityTypeEnum.Album: {
        const album = item.entity as MiniAlbum
        return (
          <div
            key={item.entity.id}
            className='group relative rounded transition-colors hover:bg-[#eeeeee]'
          >
            <AlbumPreview details={album} draggable={false} />
            <button
              className='absolute top-2 right-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80'
              onClick={() => handleRemoveEntity(item)}
              aria-label='Remove item'
            >
              <MuzaIcon iconName='Close' />
            </button>
          </div>
        )
      }
      case EntityTypeEnum.Artist: {
        const artist = item.entity as Artist
        return (
          <div
            key={item.entity.id}
            className='group relative rounded transition-colors hover:bg-[#eeeeee]'
          >
            <ArtistPreview details={artist} draggable={false} />
            <button
              className='absolute top-2 right-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80'
              onClick={() => handleRemoveEntity(item)}
              aria-label='Remove item'
            >
              <MuzaIcon iconName='Close' />
            </button>
          </div>
        )
      }
      case EntityTypeEnum.Track: {
        const song = item.entity as SongDetails
        return (
          <div
            key={item.entity.id}
            className='relative rounded transition-colors hover:bg-[#eeeeee]'
          >
            <SongLineWithCover
              details={{ ...song, index: index + 1 }}
              onClick={() => {}}
              isPlaying={false}
              showHoverActions={false}
              playlistMode={true}
              draggable={false}
              onRemoveSong={() => handleRemoveEntity(item)}
            />
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'fixed top-0 right-0 z-99 flex h-screen w-[374px] flex-col border-l border-(--muza-light-border-color) bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out',
        'pt-(--muza-topbar-height,64px)',
        'max-md:right-0 max-md:left-0 max-md:w-full',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className='flex items-center justify-between border-b border-(--muza-light-border-color) bg-white px-4 py-2'>
        <div className='flex items-center gap-2'>
          <DropdownMenu
            trigger={
              <div className='flex cursor-pointer items-center gap-1 rounded border border-(--muza-light-border-color) bg-(--colors_muted_light,#f9fafb) px-1 py-1 text-sm leading-none font-normal text-(--muza-primary-text-color) transition-colors hover:bg-[#eeeeee]'>
                <MuzaIcon iconName='playlist' />
                <span>{getEntityTypeLabel()}</span>
                <MuzaIcon iconName='ChevronDown' className='ml-1 h-3 w-3' />
              </div>
            }
            items={dropdownItems}
            title='Entity Type'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={handleSave}
            disabled={fetcher.state === 'loading' || !stackName.trim()}
            variant='default'
            className='h-9 px-4'
          >
            {fetcher.state === 'loading'
              ? t('common.saving') || 'Saving...'
              : tempStack.id === -1
                ? t('stack.create') || 'Create Stack'
                : t('stack.update') || 'Update Stack'}
          </Button>
          <button
            className='flex aspect-square h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-(--muza-light-border-color) bg-transparent transition-colors hover:bg-(--muza-hover-background)'
            onClick={handleClose}
          >
            <MuzaIcon iconName='Close' />
          </button>
        </div>
      </div>

      <div
        className='flex max-w-[540px] min-w-[290px] flex-1 flex-col gap-4 overflow-y-auto px-4'
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className='flex flex-col gap-2 pt-4'>
          <div className='flex flex-col gap-2'>
            <MuzaInputField
              value={stackName}
              onChange={e => setStackName(e.target.value)}
              placeholder='Stack name'
              className='border-none bg-transparent p-0 text-2xl leading-7 font-semibold text-(--muza-track-title-color,#111827) placeholder:text-(--muza-secondary-text-color,#5f5f5f) focus:border-none focus:shadow-none focus:outline-none'
              name='stack-name'
            />
            <MuzaInputField
              value={stackDescription}
              onChange={e => setStackDescription(e.target.value)}
              placeholder='Stack description (optional)'
              className='border-none bg-transparent p-0 text-lg leading-6 font-normal text-(--muza-secondary-text-color,#5f5f5f) placeholder:text-(--muza-secondary-text-color,#5f5f5f) focus:border-none focus:shadow-none focus:outline-none'
              name='stack-description'
            />
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-2 pb-4'>
          {/* Main drop zone - always visible at the top */}
          {!tempStack.items.length && (
            <div
              className={cn(
                'flex h-14 cursor-pointer items-center justify-center gap-2 rounded bg-(--colors_muted_light,#f9fafb) text-sm leading-4 font-normal text-(--muza-secondary-text-color,#5f5f5f) transition-all',
                isDragOver && 'border border-(--muza-track-title-color,#111827)'
              )}
            >
              <span>{t('playlist.dropSongsHere', { entityType: getEntityTypeLabel() })}</span>
            </div>
          )}

          {/* Display current stack items */}
          {tempStack.items.length > 0 && (
            <div className='mt-4 flex flex-col gap-3'>
              {tempStack.items.map((item, index) => renderStackItem(item, index))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StackDrawer
