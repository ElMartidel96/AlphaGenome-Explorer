import { createThirdwebClient } from 'thirdweb'

let _client: ReturnType<typeof createThirdwebClient> | null = null

export function getClient() {
  if (_client) return _client

  const clientId = process.env.NEXT_PUBLIC_TW_CLIENT_ID

  if (!clientId) {
    if (typeof window === 'undefined') return null
    console.warn('Thirdweb client ID not found. Set NEXT_PUBLIC_TW_CLIENT_ID in .env')
    return null
  }

  _client = createThirdwebClient({ clientId })
  return _client
}

export const client = typeof window !== 'undefined' ? getClient() : null

export const getClientSafe = () => {
  if (typeof window === 'undefined') return null
  return getClient()
}
