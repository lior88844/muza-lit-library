import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate } from 'react-router'
import { getStacksByPage, type StackWithEntities } from 'server/api/stack/stack.service'
import { EntityTypeEnum, StackPageIdEnum } from 'server/db/stack.entity'

import MusicListSectionComponent from '~/components/listsDisplays/StackPreview'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'

export async function loader() {
  try {
    const stacks = await getStacksByPage(StackPageIdEnum.Explore)
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
export default function Explore() {
  const { t } = useTranslation()
  const { stacks } = useLoaderData<typeof loader>()
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
    <>
      <Typography variant='h1' as='h2' className='px-3 pb-4'>
        {t('page.explore')}
      </Typography>
      <Divider />

      {stacks.map((stack, index) => (
        <div key={stack.id} className='mb-4'>
          {stack.entityType === EntityTypeEnum.Album && (
            <MusicListSectionComponent stack={stack} onShowAll={handleShowAll} />
          )}
          {index < stacks.length - 1 && <Divider />}
        </div>
      ))}
    </>
  )
}
