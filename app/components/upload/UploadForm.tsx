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
    <div className='bg-muted py-6 px-10 pb-2.5 pr-10 border-r border-border-light overflow-y-auto box-border h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
      <div className='flex flex-col gap-6 w-full'>
        {/* General Info Section */}
        <div className='bg-background border border-border-light rounded-md py-6 px-4 flex flex-col gap-8 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'>
          <div className='flex items-center gap-4'>
            <span className='font-sans text-sm leading-4 font-normal text-muted-foreground whitespace-nowrap'>
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

          <div className='flex items-center justify-between w-full'>
            <span className='font-sans text-sm leading-4 font-normal text-muted-foreground flex-1'>
              We add details if we find a match; otherwise fill in manually.
            </span>
            <button
              className='border-none rounded-full flex items-center justify-center gap-2 font-sans text-sm font-medium leading-4 cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap bg-primary text-muted py-2 px-3 opacity-50 hover:bg-[var(--colors_primary_dark)] hover:opacity-100'
              onClick={onFindAlbumDetails}
            >
              <MuzaIcon iconName='sparkles' className='w-4 h-4 flex-shrink-0' />
              <span className='flex-shrink-0'>Find Album Details</span>
            </button>
          </div>
        </div>

        {/* Recording Details Section */}
        <div className='bg-background border border-border-light rounded-md py-6 px-4 flex flex-col gap-8 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'>
          <div className='flex items-center gap-4 w-full'>
            <span className='font-sans text-sm leading-4 font-normal text-muted-foreground whitespace-nowrap'>
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
            className='bg-background border border-border-light rounded-md py-6 px-4 flex flex-col gap-8 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
          >
            <div className='flex items-center gap-4 w-full'>
              <span className='font-sans text-sm leading-4 font-normal text-muted-foreground whitespace-nowrap'>
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
                <div className='flex justify-end mt-2'>
                  <button
                    className='border-none rounded-full flex items-center justify-center gap-2 font-sans text-sm font-medium leading-4 cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap bg-transparent text-text-dark py-2 px-3 hover:bg-secondary'
                    onClick={() => onRemoveMusician(index)}
                    type='button'
                  >
                    <MuzaIcon iconName='trash' className='w-4 h-4 flex-shrink-0' />
                    <span className='flex-shrink-0'>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Musician Button - Outside cards */}
        <div className='flex justify-start w-full'>
          <button
            className='border-none rounded-full flex items-center justify-center gap-2 font-sans text-sm font-medium leading-4 cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap bg-transparent text-text-dark py-2 px-3 hover:bg-secondary'
            onClick={onAddMusician}
          >
            <MuzaIcon iconName='plus' className='w-4 h-4 flex-shrink-0' />
            <span className='flex-shrink-0'>Add Musician</span>
          </button>
        </div>

        {/* Notes & Credits Section */}
        <div className='bg-background border border-border-light rounded-md py-6 px-4 flex flex-col gap-8 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'>
          <div className='flex items-center gap-4 w-full'>
            <span className='font-sans text-sm leading-4 font-normal text-muted-foreground whitespace-nowrap'>
              Notes & Credits
            </span>
            <Divider />
          </div>

          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='linerNotes'
                className='font-sans text-sm leading-4 font-medium text-text-dark leading-none'
              >
                Liner Notes
              </label>
              <textarea
                id='linerNotes'
                placeholder=''
                value={formData.linerNotes}
                onChange={onFormDataChange('linerNotes')}
                rows={4}
                className='py-2 px-3 border border-border-light rounded-md font-sans text-base text-text-dark bg-background resize-y min-h-[60px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_var(--colors_primary_light)] placeholder:text-muted-foreground'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label
                htmlFor='otherCredits'
                className='font-sans text-sm leading-4 font-medium text-text-dark leading-none'
              >
                Other Credits
              </label>
              <textarea
                id='otherCredits'
                placeholder=''
                value={formData.otherCredits}
                onChange={onFormDataChange('otherCredits')}
                rows={4}
                className='py-2 px-3 border border-border-light rounded-md font-sans text-base text-text-dark bg-background resize-y min-h-[60px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_1px_var(--colors_primary_light)] placeholder:text-muted-foreground'
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
