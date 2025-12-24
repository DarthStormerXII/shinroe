interface PinataOptions {
  pinataMetadata?: {
    name?: string
    keyvalues?: Record<string, any>
  }
  pinataOptions?: {
    cidVersion?: 0 | 1
  }
}

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
  isDuplicate?: boolean
}

const PINATA_API_URL = 'https://api.pinata.cloud/pinning'
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs'

function getHeaders() {
  const jwt = process.env.PINATA_JWT
  if (!jwt) {
    throw new Error('PINATA_JWT environment variable is not set')
  }
  
  return {
    'Authorization': `Bearer ${jwt}`
  }
}

export async function pinJSONToIPFS(
  json: any,
  options?: PinataOptions
): Promise<PinataResponse> {
  const response = await fetch(`${PINATA_API_URL}/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pinataContent: json,
      ...options
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to pin JSON to IPFS: ${error}`)
  }

  return response.json()
}

export async function pinFileToIPFS(
  file: File | Blob,
  fileName: string,
  options?: PinataOptions
): Promise<PinataResponse> {
  const formData = new FormData()
  
  // If it's a Blob, convert to File with proper name
  if (file instanceof Blob && !(file instanceof File)) {
    file = new File([file], fileName, { type: file.type })
  }
  
  formData.append('file', file)
  
  if (options?.pinataMetadata) {
    formData.append('pinataMetadata', JSON.stringify(options.pinataMetadata))
  }
  
  if (options?.pinataOptions) {
    formData.append('pinataOptions', JSON.stringify(options.pinataOptions))
  }

  const response = await fetch(`${PINATA_API_URL}/pinFileToIPFS`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to pin file to IPFS: ${error}`)
  }

  return response.json()
}

export async function pinFileFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  options?: PinataOptions
): Promise<PinataResponse> {
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType })
  return pinFileToIPFS(blob, fileName, options)
}

export function getIPFSUrl(hash: string): string {
  return `${PINATA_GATEWAY_URL}/${hash}`
}

export function extractIPFSHash(url: string): string | null {
  const ipfsMatch = url.match(/ipfs:\/\/(.+)/)
  if (ipfsMatch) {
    return ipfsMatch[1]
  }
  
  const gatewayMatch = url.match(/\/ipfs\/(.+)/)
  if (gatewayMatch) {
    return gatewayMatch[1]
  }
  
  return null
}

export function formatIPFSUrl(hash: string): string {
  return `ipfs://${hash}`
}

export async function unpinFromIPFS(hash: string): Promise<void> {
  const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
    method: 'DELETE',
    headers: getHeaders()
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to unpin from IPFS: ${error}`)
  }
}

export async function getFileFromIPFS(hash: string): Promise<Response> {
  const url = getIPFSUrl(hash)
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`)
  }
  
  return response
}

export async function getJSONFromIPFS<T = any>(hash: string): Promise<T> {
  const response = await getFileFromIPFS(hash)
  return response.json()
}