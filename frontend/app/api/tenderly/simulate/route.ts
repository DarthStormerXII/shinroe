import { NextRequest, NextResponse } from 'next/server'
import { Tenderly, Network } from '@tenderly/sdk'

// Initialize Tenderly client with server-side credentials
function getServerTenderlyClient(chainId: number): Tenderly {
  const accessToken = process.env.TENDERLY_ACCESS_TOKEN
  const username = process.env.NEXT_PUBLIC_TENDERLY_USERNAME
  const projectSlug =  process.env.NEXT_PUBLIC_TENDERLY_PROJECT_SLUG

  if (!accessToken || !username || !projectSlug || !chainId) {
    throw new Error('Tenderly credentials or chainId not configured. Please set TENDERLY_ACCESS_TOKEN, TENDERLY_USERNAME, and TENDERLY_PROJECT_SLUG in your environment.')
  }

  return new Tenderly({
    accessKey: accessToken,
    accountName: username,
    projectName: projectSlug,
    network: chainId, 
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.from || !body.to || body.network_id === undefined) {
      return NextResponse.json(
        { error: 'from, to, and network_id are required fields' },
        { status: 400 }
      )
    }

    const tenderly = getServerTenderlyClient(body.network_id)
    
    // Prepare simulation parameters
    const simulationParams = {
      from: body.from,
      to: body.to,
      input: body.input || '0x',
      value: body.value || '0',
      gas: body.gas,
      gas_price: body.gas_price,
      network_id: body.network_id,
      save: body.save || false,
      save_if_fails: body.save_if_fails || false,
      simulation_type: body.simulation_type || 'quick',
      state_objects: body.state_objects,
      block_number: body.block_number,
    }

    // Run simulation - wrap params in transaction object as per SDK requirements
    const tenderlyRequest = {
      transaction: {
        from: simulationParams.from,
        to: simulationParams.to,
        input: simulationParams.input,
        value: parseInt(simulationParams.value), // Convert to number
        gas: simulationParams.gas || 3000000, // Provide default gas limit
        gas_price: simulationParams.gas_price || '20000000000', // Default gas price
      },
      blockNumber: simulationParams.block_number,
    }
    
    let simulation
    try {
      simulation = await tenderly.simulator.simulateTransaction(tenderlyRequest)
    } catch (simError: any) {
      console.error('Tenderly SDK error:', simError)
      console.error('Error details:', simError.response?.data || simError.message)
      throw simError
    }
    
    // Format the response - handle potential undefined simulation
    // The SDK returns the simulation data directly, not wrapped
    const simulationData = simulation || {}
    const formattedResult = {
      success: simulationData.status === true,
      gasUsed: simulationData.gasUsed?.toString(),
      blockNumber: simulationData.blockNumber,
      logs: simulationData.logs || [],
      callTrace: simulationData.trace,
      // Return the raw simulation data for any additional properties
      raw: simulationData
    }

    return NextResponse.json({
      success: true,
      simulation: formattedResult,
      raw: simulationData // Include raw data for debugging if needed
    })
  } catch (error: any) {
    console.error('Error in Tenderly simulation API:', error)
    
    // Handle specific Tenderly errors
    if (error.message?.includes('credentials not configured')) {
      return NextResponse.json(
        { error: 'Tenderly service not configured properly' },
        { status: 503 }
      )
    }
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Tenderly credentials' },
        { status: 401 }
      )
    }
    
    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Tenderly rate limit exceeded' },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to simulate transaction' },
      { status: 500 }
    )
  }
}