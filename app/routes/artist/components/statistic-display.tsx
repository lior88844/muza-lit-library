interface Props {
  value: number
  label: string
}

export function StatisticDisplay({ value, label }: Props) {
  return (
    <div>
      <span>{value}</span>
      <span>{label}</span>
    </div>
  )
}
