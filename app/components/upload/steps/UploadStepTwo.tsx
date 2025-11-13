import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useEffect, useRef, useState } from 'react'

import WaveAnimation from '~/components/ui/WaveAnimation'
import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'
import type { TrackMetadata } from '~/store/uploadStore'

interface UploadStepTwoProps {
  trackMetadata: TrackMetadata[]
  onTrackMetadataChange: (
    trackId: string,
    field: keyof Omit<TrackMetadata, 'id' | 'file'>,
    value: string
  ) => void
  onDeleteTrack: (trackId: string) => void
  onReorderTracks: (fromIndex: number, toIndex: number) => void
}

interface PlaybackState {
  currentTrackId: string | null
  isPlaying: boolean
}

interface SortableTrackRowProps {
  track: TrackMetadata
  index: number
  onTrackMetadataChange: (
    trackId: string,
    field: keyof Omit<TrackMetadata, 'id' | 'file'>,
    value: string
  ) => void
  onDeleteTrack: (trackId: string) => void
  playbackState: PlaybackState
  onPlayPause: (trackId: string) => void
}

const SortableTrackRow: React.FC<SortableTrackRowProps> = ({
  track,
  index,
  onDeleteTrack,
  playbackState,
  onPlayPause,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const renderPlayButton = () => {
    const isCurrentTrack = playbackState.currentTrackId === track.id
    const isPlaying = isCurrentTrack && playbackState.isPlaying

    if (isPlaying && isHovered) {
      return <MuzaIcon iconName='pause' className='size-6' />
    }
    if (isPlaying) {
      return <WaveAnimation />
    }
    return <MuzaIcon iconName='play' className='size-6' />
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-border-light grid min-h-[54px] grid-cols-[auto_1fr_minmax(200px,1fr)_minmax(150px,1.5fr)_auto_auto] items-center border-b transition-all duration-200 ease-in-out hover:bg-[var(--colors_muted_light_50_,#f9fafb7f)] lg:grid-cols-[auto_1fr_minmax(150px,1.5fr)_minmax(120px,1fr)_auto_auto]',
        isDragging && 'bg-secondary z-1000 opacity-70 shadow-[0_4px_8px_rgba(0,0,0,0.15)]'
      )}
    >
      {/* Track Number & Drag Handle */}
      <div className='flex items-center justify-end gap-2 px-4 py-4 pr-[56px] lg:pr-5 lg:pl-5'>
        <button
          className='touch-action-none text-muted-foreground hover:text-background-dark flex h-6 w-6 cursor-grab items-center justify-center rounded-full border-none bg-transparent bg-none p-1 transition-all duration-200 ease-in-out active:cursor-grabbing'
          {...attributes}
          {...listeners}
        >
          <MuzaIcon iconName='grip-vertical' />
        </button>
        <span className='text-muted-foreground w-6 text-center text-base font-medium'>
          {index + 1}
        </span>
      </div>

      {/* File Name with Play Button */}
      <div className='flex items-center gap-2.5 px-4 py-4'>
        <button
          className='bg-secondary hover:bg-border-light flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-none transition-all duration-200 ease-in-out [&_svg]:h-4 [&_svg]:w-4 [&::after]:hidden'
          onClick={() => onPlayPause(track.id)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {renderPlayButton()}
        </button>
        <span
          className='text-muted-foreground flex-1 overflow-hidden text-sm font-normal text-ellipsis whitespace-nowrap'
          title={track.fileName}
        >
          {track.fileName}
        </span>
      </div>

      {/* Editable Song Name */}
      <div className='px-4 py-4'>
        <span className='text-background-dark placeholder:text-muted-foreground focus:text-background-dark w-full border-none bg-none p-0 text-sm font-normal outline-none'>
          {track.songName}
        </span>
      </div>

      {/* Editable Composer */}
      <div className='px-4 py-4'>
        <span className='text-background-dark placeholder:text-muted-foreground focus:text-background-dark w-full border-none bg-none p-0 text-sm font-normal outline-none'>
          {track.composer}
        </span>
      </div>

      {/* Duration (Read-only) */}
      <div className='px-4 py-4 text-right'>
        <span className='text-muted-foreground text-sm font-normal'>{track.duration}</span>
      </div>

      {/* Delete Button */}
      <div className='flex justify-center px-4 py-4'>
        <button
          className='bg-secondary text-muted-foreground hover:bg-destructive hover:text-destructive-foreground flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-none transition-all duration-200 ease-in-out'
          onClick={() => onDeleteTrack(track.id)}
          title='Delete track'
        >
          <MuzaIcon iconName='trash' />
        </button>
      </div>
    </div>
  )
}

const UploadStepTwo: React.FC<UploadStepTwoProps> = ({
  trackMetadata,
  onTrackMetadataChange,
  onDeleteTrack,
  onReorderTracks,
}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTrackId: null,
    isPlaying: false,
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handlePlayPause = (trackId: string) => {
    const track = trackMetadata.find(t => t.id === trackId)
    if (!track) return

    if (playbackState.currentTrackId === trackId && playbackState.isPlaying) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setPlaybackState({ currentTrackId: trackId, isPlaying: false })
    } else {
      // Play new track or resume
      if (audioRef.current) {
        audioRef.current.pause()
      }

      // Create audio element for the track file
      const audio = new Audio()
      audio.src = URL.createObjectURL(track.file)
      audioRef.current = audio

      audio.play().then(() => {
        setPlaybackState({ currentTrackId: trackId, isPlaying: true })
      })

      // Handle audio end
      audio.addEventListener('ended', () => {
        setPlaybackState({ currentTrackId: null, isPlaying: false })
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = trackMetadata.findIndex(track => track.id === active.id)
      const newIndex = trackMetadata.findIndex(track => track.id === over?.id)

      onReorderTracks(oldIndex, newIndex)
    }
  }

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return (
    <div className='h-full flex-1 overflow-y-auto pb-[108px]'>
      <div className='max-w-full border-collapse border-spacing-0'>
        {/* Table Header */}
        <div className='border-border-light text-muted-foreground grid grid-cols-[auto_1fr_minmax(200px,1fr)_minmax(150px,1.5fr)_auto_auto] items-center border-b text-sm font-medium lg:grid-cols-[auto_1fr_minmax(150px,1.5fr)_minmax(120px,1fr)_auto_auto] lg:text-xs'>
          <div className='w-16 px-4 py-4 pr-[56px] text-right lg:pr-5 lg:pl-5'></div>
          <div className='px-4 py-4'>File Name (Not displayed)</div>
          <div className='px-4 py-4'>Song Name</div>
          <div className='px-4 py-4'>Composer</div>
          <div className='px-4 py-4 text-right'>Time</div>
          <div className='w-6 text-center'></div>
        </div>

        {/* Table Body with Drag and Drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={trackMetadata.map(track => track.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='flex flex-col gap-2'>
              {trackMetadata.map((track, index) => (
                <SortableTrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  onTrackMetadataChange={onTrackMetadataChange}
                  onDeleteTrack={onDeleteTrack}
                  playbackState={playbackState}
                  onPlayPause={handlePlayPause}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Empty State */}
        {trackMetadata.length === 0 && (
          <div className='text-muted-foreground px-4 py-12 text-center'>
            <p className='m-0 text-base'>
              No tracks uploaded yet. Please go back to upload audio files.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadStepTwo
