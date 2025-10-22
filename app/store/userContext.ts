import { User } from 'oidc-client-ts'
import { useAuth } from 'react-oidc-context'

// Re-export the useAuth hook for convenience
export { useAuth }

export const getOidcUser = () => {
  const oidcStorage = localStorage.getItem(
    `oidc.user:${import.meta.env.VITE_COGNITO_AUTHORITY}:${import.meta.env.VITE_COGNITO_CLIENT_ID}`
  )
  if (!oidcStorage) {
    return null
  }

  return User.fromStorageString(oidcStorage)
}
// Helper function to get access token from OIDC context
export const getAccessToken = (): string | null => {
  const oidcUser = getOidcUser()
  if (!oidcUser) {
    return null
  }
  return oidcUser.access_token
}

// Helper function to get access token from auth object
export const getAccessTokenFromAuth = (auth: ReturnType<typeof useAuth>): string | null => {
  return auth.user?.access_token || null
}

// Helper function to check if user is authenticated
export const isAuthenticated = (auth: ReturnType<typeof useAuth>): boolean => {
  return auth.isAuthenticated
}

// Helper function to get user info
export const getUserInfo = (auth: ReturnType<typeof useAuth>) => {
  if (!auth.user) return null
  return {
    sub: auth.user.profile.sub,
    email: auth.user.profile.email,
    email_verified: auth.user.profile.email_verified,
    name: auth.user.profile.name,
    given_name: auth.user.profile.given_name,
    family_name: auth.user.profile.family_name,
    picture: auth.user.profile.picture,
    groups: auth.user.profile['cognito:groups'] || [],
  }
}
