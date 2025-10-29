import './statistic-item.scss'

interface Props {
  value: number
  label: string
}

export function StatisticItem({ value, label }: Props) {
  return (
    <div className='stat-item'>
      <span className='stat-item-value'>{value}</span>
      <span className='stat-item-label'>{label}</span>
    </div>
  )
}
