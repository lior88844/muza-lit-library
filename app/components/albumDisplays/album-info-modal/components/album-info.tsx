import type { ReactNode } from 'react'
import { Fragment } from 'react/jsx-runtime'

import { Typography } from '~/components/ui/typography'

interface Props<T> {
  info: T[]
  getReactKey?: (item: T) => string
  renderKey: (item: T) => ReactNode
  renderValue: (item: T) => ReactNode
}

export function AlbumInfo<T extends object>(props: Props<T>) {
  const { info, getReactKey, renderKey, renderValue } = props

  if (!info.length) return null

  return (
    <div className='grid grid-cols-2 gap-x-16 gap-y-2'>
      {info.map((item, index) => (
        <Fragment key={getReactKey?.(item) ?? index.toString()}>
          <Typography as='span' className='text-text-muted'>
            {renderKey(item)}
          </Typography>

          <Typography as='span'>{renderValue(item)}</Typography>
        </Fragment>
      ))}
    </div>
  )
}
