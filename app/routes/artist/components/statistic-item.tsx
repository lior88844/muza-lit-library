import { Typography } from '~/components/ui/typography'

interface Props {
  value: number
  label: string
}

export function StatisticItem({ value, label }: Props) {
  return (
    <div className='border-primary-foreground flex flex-col items-center gap-1 rounded-xl border px-4 py-3 backdrop-blur-xs'>
      <Typography as='span' className='text-text-inverse leading-none font-medium'>
        {value}
      </Typography>
      <Typography variant='caption' as='span' className='text-text-inverse'>
        {label}
      </Typography>
    </div>
  )
}
