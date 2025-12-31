import { NextRequest, NextResponse } from 'next/server'

interface TransactionSummaryRequest {
  functionName: string
  contractAddress: string
  args?: any[]
  value?: string
  gasEstimate?: string
  estimatedCost?: string
  chainName?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if AI summaries are disabled
    if (process.env.DISABLE_AI_SUMMARIES === 'true') {
      console.log('AI summaries are disabled via environment variable')
      return NextResponse.json({ summary: 'AI summaries are disabled' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite'

    if (!apiKey) {
      console.warn('Gemini API key not configured')
      return NextResponse.json({ summary: 'AI summary unavailable - API key not configured' })
    }

    const body: TransactionSummaryRequest = await request.json()

    // Validate required fields
    if (!body.functionName || !body.contractAddress) {
      return NextResponse.json(
        { error: 'functionName and contractAddress are required' },
        { status: 400 }
      )
    }

    const prompt = `Generate a brief, user-friendly summary of this blockchain transaction in 1-2 sentences. Be concise and clear:

Function: ${body.functionName}
Contract: ${body.contractAddress}
${body.args && body.args.length > 0 ? `Arguments: ${JSON.stringify(body.args)}` : ''}
${body.value ? `Value: ${body.value} ETH` : ''}
${body.gasEstimate ? `Estimated Gas: ${body.gasEstimate}` : ''}
${body.estimatedCost ? `Estimated Cost: ${body.estimatedCost}` : ''}
${body.chainName ? `Network: ${body.chainName}` : ''}

Explain what this transaction will do in simple terms a non-technical user can understand.`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 100,
            }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Gemini API error:', response.status, errorData)
        
        // Handle specific error codes
        if (response.status === 404) {
          return NextResponse.json({ summary: 'AI summary unavailable - Invalid API endpoint' })
        } else if (response.status === 403) {
          return NextResponse.json({ summary: 'AI summary unavailable - Invalid API key' })
        } else if (response.status === 429) {
          return NextResponse.json({ summary: 'AI summary unavailable - Rate limit exceeded' })
        }
        
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!summary) {
        console.warn('No summary generated from Gemini API', data)
        return NextResponse.json({ summary: 'AI summary could not be generated' })
      }

      return NextResponse.json({ summary: summary.trim() })
    } catch (error: any) {
      console.error('Failed to generate AI summary:', error.message || error)
      
      // Return more specific error messages
      if (error.message?.includes('fetch')) {
        return NextResponse.json({ summary: 'AI summary unavailable - Network error' })
      }
      
      return NextResponse.json({ summary: 'AI summary temporarily unavailable' })
    }
  } catch (error) {
    console.error('Error in transaction summary API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 }
    )
  }
}