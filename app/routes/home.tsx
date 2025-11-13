import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import { getStacksByPage } from 'server/api/stack/stack.service'
import { isStackWithTracks } from 'server/api/stack/types'
import { StackPageIdEnum } from 'server/db/stack.entity'

import { StackPreview } from '~/components/listsDisplays/StackPreview'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'

export async function loader() {
  try {
    const stacks = await getStacksByPage(StackPageIdEnum.Home)
    return { success: true, stacks }
  } catch (error) {
    console.error('Error fetching stacks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stacks: [],
    }
  }
}

export default function Home() {
  const { stacks } = useLoaderData<typeof loader>()
  const { t } = useTranslation()

  return (
    <div className='mx-auto max-w-[1680px]'>
      <Typography variant='h1' as='h2' className='px-3 pb-12'>
        {t('page.home')}
      </Typography>

      <div className='px-3 pb-40'>
        <Divider />

        {stacks.map((stack, index) => (
          <div key={stack.id} className='mb-4'>
            <StackPreview
              stack={stack}
              maxItems={isStackWithTracks(stack) ? DEFAULT_TRACKS_VISIBLE_COUNT : undefined}
            />
            {index < stacks.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </div>
  )
}

const DEFAULT_TRACKS_VISIBLE_COUNT = 9
