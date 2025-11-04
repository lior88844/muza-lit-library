import type { StackEntityTypeEnum } from 'server/db/stack.entity'
import type { Stack } from 'server/db/stack.entity'
import type { StackItem } from 'server/db/stack-item.entity'

import MuzaIcon from '~/icons/MuzaIcon'

interface StackWithItems extends Stack {
  items: StackItem[]
}

interface AdminPortalTableBodyProps {
  stacks: StackWithItems[]
  handleStackTitleChange: (id: number, newTitle: string) => void
  handleStackTypeChange: (id: number, newType: StackEntityTypeEnum) => void
  handleEditContent: (stackId: number) => void
}

const ENTITY_TYPE_LABELS: Record<StackEntityTypeEnum, string> = {
  artist: 'Artist',
  album: 'Album',
  song: 'Song',
  playlist: 'Playlist',
}

const SELECTION_TYPE_LABELS: Record<string, string> = {
  manual: 'Manual',
  filter: 'Filter',
  hybrid: 'Hybrid',
}

export default function AdminPortalTableBody({
  stacks,
  handleStackTitleChange,
  handleStackTypeChange,
  handleEditContent,
}: AdminPortalTableBodyProps) {
  return (
    <div className='flex-1 flex flex-col'>
      {stacks.length === 0 ? (
        <div className='py-8 px-4 text-center text-muted-foreground'>
          No stacks found for this page. Create a new stack to get started.
        </div>
      ) : (
        stacks.map((stack, index) => (
          <div
            key={stack.id}
            className='grid grid-cols-[0.5fr_5fr_1.5fr_1.5fr_1.5fr_0.5fr] border-b border-border-light last:border-b-0'
          >
            <div>
              <div className='py-2 px-2 flex items-center min-h-[40px] border-r border-border-light last:border-r-0'>
                <span>{index + 1}</span>
              </div>
            </div>
            <div>
              <div className='py-2 px-2 flex items-center min-h-[40px] border-r border-border-light last:border-r-0'>
                <input
                  type='text'
                  value={stack.title}
                  onChange={e => handleStackTitleChange(stack.id, e.target.value)}
                  className='w-full h-9 border border-border-light rounded-full py-1.5 px-3 font-sans text-base font-normal text-[#030712] bg-white outline-none transition-colors duration-200 ease-in-out tracking-[0.25px] leading-5 focus:border-border'
                />
              </div>
            </div>
            <div>
              <div className='py-2 px-2 flex items-center min-h-[40px] border-r border-border-light last:border-r-0'>
                <div>
                  <button className='bg-white/50 border border-border-light rounded-full py-2 px-4 font-sans text-base font-medium text-[#030712] cursor-pointer flex items-center justify-between gap-2 backdrop-blur-[10px] transition-colors duration-200 ease-in-out leading-5 hover:bg-[var(--muza-hover-background,#eeeeee)]'>
                    <span>{ENTITY_TYPE_LABELS[stack.entityType] || stack.entityType}</span>
                    <MuzaIcon iconName='ChevronDown' />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className='py-2 px-2 flex items-center min-h-[40px] border-r border-border-light last:border-r-0'>
                <div>
                  <button className='bg-white/50 border border-border-light rounded-full py-2 px-4 font-sans text-base font-medium text-[#030712] cursor-pointer flex items-center justify-between gap-2 backdrop-blur-[10px] transition-colors duration-200 ease-in-out leading-5 hover:bg-[var(--muza-hover-background,#eeeeee)]'>
                    <span>{SELECTION_TYPE_LABELS[stack.selectionType] || stack.selectionType}</span>
                    <MuzaIcon iconName='ChevronDown' />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className='py-2 px-2 flex items-center min-h-[40px] border-r border-border-light last:border-r-0'>
                <button
                  onClick={() => handleEditContent(stack.id)}
                  className='bg-secondary border-none rounded-full py-2.5 px-4 font-sans text-sm font-medium text-text-dark cursor-pointer transition-colors duration-200 ease-in-out hover:bg-[var(--muza-hover-background,#eeeeee)]'
                >
                  Edit
                </button>
              </div>
            </div>
            <div>
              <div className='py-2 px-2 flex items-center min-h-[40px] border-r border-border-light last:border-r-0'>
                <span className='font-sans text-sm font-normal text-foreground text-right w-full tracking-[0.25px]'>
                  {stack.items?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
