import '../components/sections/MusicSidebar'
import '../styles/variables.css'

import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate } from 'react-router'
import { getStacksByPage, type StackWithEntities } from 'server/api/stack/stack.service'
import { StackPageIdEnum } from 'server/db/stack.entity'

import MusicListSectionComponent from '~/components/listsDisplays/StackPreview'
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

  const navigate = useNavigate()

  const handleShowAll = (stack: StackWithEntities) => {
    // @TODO handle show all
    switch (stack.entityType) {
      case t('section.newReleases'):
        navigate('/albums')
        break
      case t('section.recentlyPlayed'):
        navigate('/songs')
        break
      case t('section.artists'):
        navigate('/artists')
        break
      default:
        break
    }
  }

  return (
    <div className='mx-auto max-w-[1680px]'>
      <Typography variant='h1' as='h2' className='px-3 pb-12'>
        {t('page.home')}
      </Typography>

      <div className='px-3 pb-40'>
        <Divider />
        {stacks.map((stack, index) => (
          <div key={stack.id} className='mb-4'>
            <MusicListSectionComponent stack={stack} onShowAll={handleShowAll} />
            {index < stacks.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </div>
  )
}
