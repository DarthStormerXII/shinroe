/**
 * Google Gemini AI integration for transaction summaries
 * Now uses server-side API to protect API keys
 */

interface TransactionSummaryParams {
  functionName: string
  contractAddress: string
  args?: any[]
  value?: string
  gasEstimate?: string
  estimatedCost?: string
  chainName?: string
}

export async function generateTransactionSummary(params: TransactionSummaryParams): Promise<string> {
  try {
    // Call our server-side API instead of Gemini directly
    console.log('Requesting transaction summary with params:', params)
    const response = await fetch('/api/ai/transaction-summary', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      ...params,
      args: params.args?.map(arg => typeof arg === 'bigint' ? arg.toString() : arg)
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Transaction summary API error:', response.status, errorData)
      
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      console.error('Transaction summary error:', data.error)
      return 'AI summary temporarily unavailable'
    }

    return data.summary || 'AI summary could not be generated'
  } catch (error: any) {
    console.error('Failed to generate AI summary:', error.message || error)
    
    // Return more specific error messages
    if (error.message?.includes('fetch')) {
      return 'AI summary unavailable - Network error'
    }
    
    return 'AI summary temporarily unavailable'
  }
}