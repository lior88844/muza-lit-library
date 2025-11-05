import React from 'react'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

interface UploadFooterProps {
  currentStep: number
  onNext: () => void
  onPrevious?: () => void
  isNextDisabled: boolean
  showBack?: boolean
  nextLabel?: string
}

const UploadFooter: React.FC<UploadFooterProps> = ({
  currentStep,
  onNext,
  onPrevious,
  isNextDisabled,
  showBack = false,
  nextLabel = 'Next',
}) => {
  const steps = [
    { number: 1, label: 'Upload Files' },
    { number: 2, label: 'Complete Metadata' },
    { number: 3, label: 'Preview & Publish' },
  ]

  return (
    <div className='bg-background-dark fixed right-0 bottom-0 left-0 z-100 box-border flex h-(--upload-footer-height) items-center justify-between px-5 py-[19px]'>
      <div className='flex flex-1 justify-center'>
        <div className='flex min-w-[440px] items-center gap-0'>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className='flex w-12 flex-col items-center gap-1'>
                <div
                  className={cn(
                    'flex h-[26px] w-[26px] items-center justify-center rounded-full text-lg font-medium',
                    currentStep === step.number
                      ? 'bg-background text-background-dark'
                      : 'text-muted bg-transparent'
                  )}
                >
                  {step.number}
                </div>
                <div className='text-muted w-[163px] text-center text-xs font-normal'>
                  {step.label}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className='flex h-[26px] flex-1 items-start justify-center'>
                  <MuzaIcon iconName='line-container' />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className='absolute right-11 flex items-center gap-4'>
        {showBack && (
          <button
            className='bg-muted-foreground text-background hover:bg-background-dark cursor-pointer rounded-full border-none px-8 py-2 text-base font-medium shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] transition-colors duration-200'
            onClick={onPrevious}
          >
            Back
          </button>
        )}

        <button
          className={cn(
            'bg-primary text-muted cursor-pointer rounded-full border-none px-8 py-2 text-base font-medium shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] transition-colors duration-200',
            isNextDisabled
              ? 'hover:bg-primary cursor-not-allowed opacity-50'
              : 'hover:bg-(--colors_primary_dark)'
          )}
          onClick={onNext}
          disabled={isNextDisabled}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

export default UploadFooter
