import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { Typography } from '~/components/ui/typography'

import { useAuth } from '../store/userContext'

export default function Login() {
  const navigate = useNavigate()
  const auth = useAuth()

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (auth.isAuthenticated) {
      navigate('/')
      return
    }

    // If there's an error, show it
    if (auth.error) {
      console.error('Authentication error:', auth.error)
      return
    }

    // If not loading and not authenticated, redirect to Cognito
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect()
    }
  }, [auth, navigate])

  if (auth.isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>Authenticating...</p>
        </div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 text-red-600'>
            <i className='fas fa-exclamation-triangle text-4xl'></i>
          </div>
          <Typography variant='h2' className='mb-2'>
            Authentication Error
          </Typography>
          <p className='mb-4 text-gray-600'>{auth.error.message}</p>
          <button
            onClick={() => auth.signinRedirect()}
            className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
        <p className='text-gray-600'>Redirecting to login...</p>
      </div>
    </div>
  )
}
