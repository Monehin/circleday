import { createAuthClient } from 'better-auth/react'
import { magicLinkClient } from 'better-auth/client/plugins'

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

console.log('[Auth Client] Initializing with baseURL:', baseURL)

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    magicLinkClient(),
  ],
})

export const {
  signIn,
  signOut,
  useSession,
} = authClient

