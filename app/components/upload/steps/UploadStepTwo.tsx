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
  onTrackMetadataChange,
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
      return <MuzaIcon iconName='pause' />
    }
    if (isPlaying) {
      return <WaveAnimation />
    }
    return <MuzaIcon iconName='play' />
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'grid grid-cols-[auto_1fr_minmax(200px,1fr)_minmax(150px,1.5fr)_auto_auto] items-center min-h-[54px] border-b border-border-light transition-all duration-200 ease-in-out hover:bg-[var(--colors_muted_light_50_,#f9fafb7f)] lg:grid-cols-[auto_1fr_minmax(150px,1.5fr)_minmax(120px,1fr)_auto_auto]',
        isDragging && 'opacity-70 bg-secondary shadow-[0_4px_8px_rgba(0,0,0,0.15)] z-1000'
      )}
    >
      {/* Track Number & Drag Handle */}
      <div className='flex items-center justify-end py-4 px-4 pr-[56px] gap-2 lg:pl-5 lg:pr-5'>
        <button
          className='bg-none border-none w-6 h-6 rounded-full flex items-center justify-center cursor-grab touch-action-none p-1 bg-transparent text-muted-foreground hover:text-background-dark active:cursor-grabbing transition-all duration-200 ease-in-out'
          {...attributes}
          {...listeners}
        >
          <MuzaIcon iconName='grip-vertical' />
        </button>
        <span className='text-base font-medium text-muted-foreground w-6 text-center'>
          {index + 1}
        </span>
      </div>

      {/* File Name with Play Button */}
      <div className='flex items-center py-4 px-4 gap-2.5'>
        <button
          className='bg-none border-none w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out bg-secondary hover:bg-border-light [&::after]:hidden [&_svg]:w-4 [&_svg]:h-4'
          onClick={() => onPlayPause(track.id)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {renderPlayButton()}
        </button>
        <span
          className='flex-1 text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis font-normal'
          title={track.fileName}
        >
          {track.fileName}
        </span>
      </div>

      {/* Editable Song Name */}
      <div className='py-4 px-4'>
        <span className='w-full border-none bg-none text-sm text-background-dark font-normal p-0 outline-none placeholder:text-muted-foreground focus:text-background-dark'>
          {track.songName}
        </span>
      </div>

      {/* Editable Composer */}
      <div className='py-4 px-4'>
        <span className='w-full border-none bg-none text-sm text-background-dark font-normal p-0 outline-none placeholder:text-muted-foreground focus:text-background-dark'>
          {track.composer}
        </span>
      </div>

      {/* Duration (Read-only) */}
      <div className='py-4 px-4 text-right'>
        <span className='text-sm text-muted-foreground font-normal'>{track.duration}</span>
      </div>

      {/* Delete Button */}
      <div className='py-4 px-4 flex justify-center'>
        <button
          className='bg-none border-none w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out bg-secondary text-muted-foreground hover:bg-destructive hover:text-destructive-foreground'
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

      audio
        .play()
        .then(() => {
          setPlaybackState({ currentTrackId: trackId, isPlaying: true })
        })
        .catch(error => {
          console.error('Error playing audio:', error)
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
    <div className='h-full flex-1 pb-[108px] overflow-y-auto'>
      <div className='max-w-full border-collapse border-spacing-0'>
        {/* Table Header */}
        <div className='grid grid-cols-[auto_1fr_minmax(200px,1fr)_minmax(150px,1.5fr)_auto_auto] items-center border-b border-border-light text-sm text-muted-foreground font-medium lg:grid-cols-[auto_1fr_minmax(150px,1.5fr)_minmax(120px,1fr)_auto_auto] lg:text-xs'>
          <div className='w-16 text-right py-4 px-4 pr-[56px] lg:pl-5 lg:pr-5'></div>
          <div className='py-4 px-4'>File Name (Not displayed)</div>
          <div className='py-4 px-4'>Song Name</div>
          <div className='py-4 px-4'>Composer</div>
          <div className='py-4 px-4 text-right'>Time</div>
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
          <div className='py-12 px-4 text-center text-muted-foreground'>
            <p className='text-base m-0'>
              No tracks uploaded yet. Please go back to upload audio files.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadStepTwo
