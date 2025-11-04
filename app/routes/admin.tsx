import { Link } from 'react-router'

import { Button } from '~/components/ui/button'
import { Typography } from '~/components/ui/typography'

export default function Admin() {
  return (
    <div className='bg-background min-h-screen flex flex-col p-8'>
      <div className='max-w-7xl w-full mx-auto'>
        <Typography variant='h1' as='h1' className='mb-8 text-foreground'>
          Admin Dashboard
        </Typography>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
          <Link to='/admin/stack'>
            <Button className='flex flex-col gap-2' variant='outline'>
              <Typography variant='h2' as='h2' className='text-foreground m-0'>
                Page Editor
              </Typography>
              <Typography variant='default' as='p' className='text-muted-foreground m-0'>
                Manage and configure content stacks
              </Typography>
            </Button>
          </Link>

          <Link to='/admin/upload'>
            <Button className='flex flex-col gap-2' variant='outline'>
              <Typography variant='h2' as='h2' className='text-foreground m-0'>
                Upload Album
              </Typography>
              <Typography variant='default' as='p' className='text-muted-foreground m-0'>
                Upload and manage media files
              </Typography>
            </Button>
          </Link>

          <Link to='/admin/data'>
            <Button className='flex flex-col gap-2' variant='outline'>
              <Typography variant='h2' as='h2' className='text-foreground m-0'>
                Data Management
              </Typography>
              <Typography variant='default' as='p' className='text-muted-foreground m-0'>
                View and manage application data
              </Typography>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
