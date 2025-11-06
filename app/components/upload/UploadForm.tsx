import React from 'react'

import MuzaInputField from '~/controls/MuzaInputField'
import MuzaIcon from '~/icons/MuzaIcon'
import type { Musician, UploadFormData } from '~/store/uploadStore'

import { Divider } from '../ui/divider'

interface UploadFormProps {
  formData: UploadFormData
  musicians: Musician[]
  onFormDataChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onMusicianChange: (
    index: number,
    field: keyof Musician
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddMusician: () => void
  onRemoveMusician: (index: number) => void
  onFindAlbumDetails?: () => void
}

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  musicians,
  onFormDataChange,
  onMusicianChange,
  onAddMusician,
  onRemoveMusician,
  onFindAlbumDetails,
}) => {
  return (
    <div className='bg-muted border-border-light box-border h-full overflow-y-auto border-r px-10 py-6 pr-10 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <div className='flex w-full flex-col gap-6'>
        {/* General Info Section */}
        <div className='bg-background border-border-light flex flex-col gap-8 rounded-md border px-4 py-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'>
          <div className='flex items-center gap-4'>
            <span className='text-muted-foreground font-sans text-sm leading-4 font-normal whitespace-nowrap'>
              General Info
            </span>
          </div>

          <div className='flex flex-col gap-4'>
            <MuzaInputField
              name='albumTitle'
              label='Album Title'
              placeholder="Your album's title"
              value={formData.albumTitle}
              onChange={onFormDataChange('albumTitle')}
            />

            <MuzaInputField
              name='mainArtist'
              label='Main Artist'
              placeholder="The artist's name"
              value={formData.mainArtist}
              onChange={onFormDataChange('mainArtist')}
            />
          </div>

          <div className='flex w-full items-center justify-between'>
            <span className='text-muted-foreground flex-1 font-sans text-sm leading-4 font-normal'>
              We add details if we find a match; otherwise fill in manually.
            </span>
            <button
              className='bg-primary text-muted flex cursor-pointer items-center justify-center gap-2 rounded-full border-none px-3 py-2 font-sans text-sm leading-4 font-medium whitespace-nowrap opacity-50 transition-all duration-200 ease-in-out hover:bg-[var(--colors_primary_dark)] hover:opacity-100'
              onClick={onFindAlbumDetails}
            >
              <MuzaIcon iconName='sparkles' className='h-4 w-4 flex-shrink-0' />
              <span className='flex-shrink-0'>Find Album Details</span>
            </button>
          </div>
        </div>

        {/* Recording Details Section */}
        <div className='bg-background border-border-light flex flex-col gap-8 rounded-md border px-4 py-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'>
          <div className='flex w-full items-center gap-4'>
            <span className='text-muted-foreground font-sans text-sm leading-4 font-normal whitespace-nowrap'>
              Recording Details
            </span>
            <Divider />
          </div>

          <div className='flex flex-col gap-4'>
            <MuzaInputField
              name='bandName'
              label='Band Name (Optional)'
              placeholder="Your band's name"
              value={formData.bandName}
              onChange={onFormDataChange('bandName')}
            />

            <div>
              <MuzaInputField
                name='recordingDate'
                label='Recording Date'
                placeholder='Select Date'
                type='date'
                value={formData.recordingDate}
                onChange={onFormDataChange('recordingDate')}
                leadingIcon='calendar'
              />
            </div>
          </div>
        </div>

        {/* Additional Musicians - Individual Cards */}
        {musicians.map((musician, index) => (
          <div
            key={index}
            className='bg-background border-border-light flex flex-col gap-8 rounded-md border px-4 py-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
          >
            <div className='flex w-full items-center gap-4'>
              <span className='text-muted-foreground font-sans text-sm leading-4 font-normal whitespace-nowrap'>
                Additional Musicians
              </span>
              <Divider />
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-4'>
                <MuzaInputField
                  name={`musicianName-${index}`}
                  label="Musician's Name"
                  placeholder="Musician's Name"
                  value={musician.name}
                  onChange={onMusicianChange(index, 'name')}
                />

                <MuzaInputField
                  name={`musicianInstruments-${index}`}
                  label='Instruments'
                  placeholder='type in instruments'
                  helperText='Separate multiple instruments with commas.'
                  value={musician.instruments}
                  onChange={onMusicianChange(index, 'instruments')}
                />
              </div>

              {musicians.length > 1 && index > 0 && (
                <div className='mt-2 flex justify-end'>
                  <button
                    className='text-text-dark hover:bg-secondary flex cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-transparent px-3 py-2 font-sans text-sm leading-4 font-medium whitespace-nowrap transition-all duration-200 ease-in-out'
                    onClick={() => onRemoveMusician(index)}
                    type='button'
                  >
                    <MuzaIcon iconName='trash' className='h-4 w-4 flex-shrink-0' />
                    <span className='flex-shrink-0'>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Musician Button - Outside cards */}
        <div className='flex w-full justify-start'>
          <button
            className='text-text-dark hover:bg-secondary flex cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-transparent px-3 py-2 font-sans text-sm leading-4 font-medium whitespace-nowrap transition-all duration-200 ease-in-out'
            onClick={onAddMusician}
          >
            <MuzaIcon iconName='plus' className='h-4 w-4 flex-shrink-0' />
            <span className='flex-shrink-0'>Add Musician</span>
          </button>
        </div>

        {/* Notes & Credits Section */}
        <div className='bg-background border-border-light flex flex-col gap-8 rounded-md border px-4 py-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'>
          <div className='flex w-full items-center gap-4'>
            <span className='text-muted-foreground font-sans text-sm leading-4 font-normal whitespace-nowrap'>
              Notes & Credits
            </span>
            <Divider />
          </div>

          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='linerNotes'
                className='text-text-dark font-sans text-sm leading-4 leading-none font-medium'
              >
                Liner Notes
              </label>
              <textarea
                id='linerNotes'
                placeholder=''
                value={formData.linerNotes}
                onChange={onFormDataChange('linerNotes')}
                rows={4}
                className='border-border-light text-text-dark bg-background focus:border-primary placeholder:text-muted-foreground min-h-[60px] resize-y rounded-md border px-3 py-2 font-sans text-base shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[0_0_0_1px_var(--colors_primary_light)] focus:outline-none'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label
                htmlFor='otherCredits'
                className='text-text-dark font-sans text-sm leading-4 leading-none font-medium'
              >
                Other Credits
              </label>
              <textarea
                id='otherCredits'
                placeholder=''
                value={formData.otherCredits}
                onChange={onFormDataChange('otherCredits')}
                rows={4}
                className='border-border-light text-text-dark bg-background focus:border-primary placeholder:text-muted-foreground min-h-[60px] resize-y rounded-md border px-3 py-2 font-sans text-base shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[0_0_0_1px_var(--colors_primary_light)] focus:outline-none'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadForm
export type { Musician, UploadFormData }
