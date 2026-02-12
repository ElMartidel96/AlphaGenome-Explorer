const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function encryptApiKey(apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/profile/encrypt-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.encrypted_key || null
  } catch {
    return null
  }
}

export async function decryptApiKey(encryptedKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/profile/decrypt-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encrypted_key: encryptedKey }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.api_key || null
  } catch {
    return null
  }
}
