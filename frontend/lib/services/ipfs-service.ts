export interface ProfileMetadata {
  displayName: string
  avatarUrl?: string
  bio?: string
  did: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface AirdropMetadata {
  name: string
  description: string
  image?: string // IPFS URI for the image
  created_at: string
  creator?: string
  token?: {
    address: string
    symbol: string
    decimals: number
  }
  distribution?: {
    amountPerClaim: string
    totalAmount: string
    startTime: string
    endTime: string
  }
  criteria?: {
    minScore: number
    requiredBadges: number[]
    badgeRequirement?: 'any' | 'all'
    minEndorsementWeight: string
    requiresRegistration: boolean
  }
}

export async function uploadAirdropImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', `airdrop-image-${Date.now()}`)

  const response = await fetch('/api/ipfs/file', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload image to IPFS')
  }

  const result = await response.json()
  return result.url // Returns ipfs://... format
}

export async function uploadAirdropMetadata(
  metadata: Omit<AirdropMetadata, 'created_at'>
): Promise<string> {
  const fullMetadata: AirdropMetadata = {
    ...metadata,
    created_at: new Date().toISOString(),
  }

  const response = await fetch('/api/ipfs/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: fullMetadata,
      name: `airdrop-metadata-${Date.now()}`,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload metadata to IPFS')
  }

  const result = await response.json()
  return result.url // Returns ipfs://... format
}

export async function uploadImageAndMetadata(
  imageFile: File | null,
  metadata: Omit<AirdropMetadata, 'created_at' | 'image'>
): Promise<string> {
  let imageUri: string | undefined

  if (imageFile) {
    imageUri = await uploadAirdropImage(imageFile)
  }

  return uploadAirdropMetadata({
    ...metadata,
    image: imageUri,
  })
}

// Profile metadata functions
export async function uploadProfileMetadata(
  metadata: Omit<ProfileMetadata, 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString()
  const fullMetadata: ProfileMetadata = {
    ...metadata,
    createdAt: now,
    updatedAt: now,
  }

  // Use API route for client-side IPFS upload
  const response = await fetch('/api/ipfs/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: fullMetadata,
      name: `profile-${metadata.address}-${Date.now()}`,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload profile to IPFS')
  }

  const result = await response.json()
  return result.url // Returns ipfs://... format
}
