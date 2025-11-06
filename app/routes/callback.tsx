import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'
import { useNavigate } from 'react-router'

export default function Callback() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isLoading) {
      return
    }

    if (auth.error) {
      console.error('Authentication error:', auth.error)
      navigate('/')
      return
    }

    if (auth.isAuthenticated) {
      navigate('/')
    }
  }, [auth.isLoading, auth.error, auth.isAuthenticated, navigate])

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
        <p className='text-gray-600'>Completing authentication...</p>
      </div>
    </div>
  )
}
