import { Link, Outlet, useLocation } from 'react-router'

import { Button } from '~/components/ui/button'
import { Typography } from '~/components/ui/typography'
import { cn } from '~/lib/utils'

export default function Admin() {
  const location = useLocation()
  const isIndexRoute = location.pathname === '/admin'

  return (
    <div className='bg-background min-h-screen flex flex-col'>
      {/* Header with navigation links */}
      <div className='border-b border-border-light py-3 px-8'>
        <div className='flex justify-between items-center'>
          <Typography variant='h3' as='h2'>
            Muza Admin Portal
          </Typography>
          <nav className='flex items-center gap-4'>
            <Link
              to='/admin/stack'
              className={cn(
                'px-4 py-2 rounded-full font-sans text-sm font-medium transition-colors duration-200 ease-in-out',
                location.pathname === '/admin/stack'
                  ? 'bg-primary text-white'
                  : 'bg-white/50 border border-border-light text-foreground hover:bg-[var(--muza-hover-background,#eeeeee)]'
              )}
            >
              Page Editor
            </Link>
            <Link
              to='/admin/upload'
              className={cn(
                'px-4 py-2 rounded-full font-sans text-sm font-medium transition-colors duration-200 ease-in-out',
                location.pathname === '/admin/upload'
                  ? 'bg-primary text-white'
                  : 'bg-white/50 border border-border-light text-foreground hover:bg-[var(--muza-hover-background,#eeeeee)]'
              )}
            >
              Upload Album
            </Link>
            <Link
              to='/admin/data'
              className={cn(
                'px-4 py-2 rounded-full font-sans text-sm font-medium transition-colors duration-200 ease-in-out',
                location.pathname === '/admin/data'
                  ? 'bg-primary text-white'
                  : 'bg-white/50 border border-border-light text-foreground hover:bg-[var(--muza-hover-background,#eeeeee)]'
              )}
            >
              Data Management
            </Link>
          </nav>
        </div>
      </div>

      {/* Render child routes or index content */}
      {isIndexRoute ? (
        <div className='flex-1 p-8'>
          <div className='max-w-7xl w-full mx-auto'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
              <Link to='/admin/stack'>
                <Button className='flex flex-col gap-2 w-full' variant='outline'>
                  <Typography variant='h2' as='h2' className='text-foreground m-0'>
                    Page Editor
                  </Typography>
                  <Typography variant='default' as='p' className='text-muted-foreground m-0'>
                    Manage and configure content stacks
                  </Typography>
                </Button>
              </Link>

              <Link to='/admin/upload'>
                <Button className='flex flex-col gap-2 w-full' variant='outline'>
                  <Typography variant='h2' as='h2' className='text-foreground m-0'>
                    Upload Album
                  </Typography>
                  <Typography variant='default' as='p' className='text-muted-foreground m-0'>
                    Upload and manage media files
                  </Typography>
                </Button>
              </Link>

              <Link to='/admin/data'>
                <Button className='flex flex-col gap-2 w-full' variant='outline'>
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
      ) : (
        <Outlet />
      )}
    </div>
  )
}
