import { useCallback, useState } from 'react'

interface UseDraggableOptions<T> {
  type: 'song' | 'album' | 'playlist' | 'artist'
  data: T
  enabled: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

interface UseDraggableReturn {
  isDragging: boolean
  dragHandlers: {
    draggable: boolean
    onDragStart?: (e: React.DragEvent) => void
    onDragEnd?: () => void
  }
  preventClickWhileDragging: (
    e: React.MouseEvent,
    originalHandler: (e: React.MouseEvent) => void
  ) => void
}

export function useDraggable<T>({
  type,
  data,
  enabled,
  onDragStart,
  onDragEnd,
}: UseDraggableOptions<T>): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return

      setIsDragging(true)
      onDragStart?.()

      const dragData = { type, [type]: data }
      e.dataTransfer.setData('application/json', JSON.stringify(dragData))
      e.dataTransfer.effectAllowed = 'copy'
    },
    [enabled, type, data, onDragStart]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    onDragEnd?.()
  }, [onDragEnd])

  const preventClickWhileDragging = useCallback(
    (e: React.MouseEvent, originalHandler: (e: React.MouseEvent) => void) => {
      if (isDragging) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      originalHandler(e)
    },
    [isDragging]
  )

  return {
    isDragging,
    dragHandlers: enabled
      ? {
          draggable: true,
          onDragStart: handleDragStart,
          onDragEnd: handleDragEnd,
        }
      : { draggable: false },
    preventClickWhileDragging,
  }
}
