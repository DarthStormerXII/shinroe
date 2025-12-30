// User Metadata Service - Off-chain profile data for Shinroe users

export interface UserMetadata {
  address: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  veryChatHandle?: string | null
  createdAt?: string
  updatedAt?: string
}

class UserMetadataService {
  private baseUrl = '/api/shinroe/user-metadata'

  async getMetadata(address: string): Promise<UserMetadata | null> {
    try {
      const response = await fetch(`${this.baseUrl}?address=${address}`)
      const result = await response.json()
      return result.success ? result.data : null
    } catch {
      return null
    }
  }

  async searchByDisplayName(query: string): Promise<UserMetadata[]> {
    try {
      const response = await fetch(`${this.baseUrl}?search=${encodeURIComponent(query)}`)
      const result = await response.json()
      return result.success ? result.data : []
    } catch {
      return []
    }
  }

  async setMetadata(data: {
    address: string
    displayName?: string
    avatarUrl?: string
    bio?: string
  }): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      return result.success
    } catch {
      return false
    }
  }
}

export const userMetadataService = new UserMetadataService()
