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
    <div className='fixed bottom-0 left-0 right-0 bg-background-dark py-[19px] px-5 flex items-center justify-between z-100 h-(--upload-footer-height) box-border'>
      <div className='flex justify-center flex-1'>
        <div className='flex items-center gap-0 min-w-[440px]'>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className='flex flex-col items-center gap-1 w-12'>
                <div
                  className={cn(
                    'w-[26px] h-[26px] rounded-full flex items-center justify-center text-lg font-medium',
                    currentStep === step.number
                      ? 'bg-background text-background-dark'
                      : 'bg-transparent text-muted'
                  )}
                >
                  {step.number}
                </div>
                <div className='text-xs text-muted text-center w-[163px] font-normal'>
                  {step.label}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className='flex-1 flex items-start justify-center h-[26px]'>
                  <MuzaIcon iconName='line-container' />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className='flex gap-4 items-center absolute right-11'>
        {showBack && (
          <button
            className='bg-muted-foreground text-background border-none rounded-full py-2 px-8 text-base font-medium cursor-pointer shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] transition-colors duration-200 hover:bg-background-dark'
            onClick={onPrevious}
          >
            Back
          </button>
        )}

        <button
          className={cn(
            'bg-primary text-muted border-none rounded-full py-2 px-8 text-base font-medium cursor-pointer shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] transition-colors duration-200',
            isNextDisabled
              ? 'opacity-50 cursor-not-allowed hover:bg-primary'
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
