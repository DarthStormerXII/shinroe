'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useAccount } from '@/lib/web3'
import { useCreateAirdrop } from '@/lib/hooks/use-create-airdrop'
import { uploadImageAndMetadata } from '@/lib/services/ipfs-service'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { WizardStepper, WIZARD_STEPS } from './components/wizard-stepper'
import { TokenStep, type TokenStepData } from './components/token-step'
import { DistributionStep, type DistributionStepData } from './components/distribution-step'
import { EligibilityStep, type EligibilityStepData } from './components/eligibility-step'
import { ReviewStep, type MetadataStepData } from './components/review-step'

const defaultTokenData: TokenStepData = {
  mode: 'create',
  tokenDecimals: 18,
  tokenSymbol: '',
  newTokenParams: { name: '', symbol: '', decimals: 18, totalSupply: '' },
}

const defaultDistributionData: DistributionStepData = {
  amountPerClaim: '',
  totalAmount: '',
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
}

const defaultEligibilityData: EligibilityStepData = {
  requiresRegistration: true,
  minScore: 0,
  requiredBadges: [],
  badgeRequirement: 'any',
  minEndorsementWeight: '0',
}

const defaultMetadataData: MetadataStepData = {
  name: '',
  description: '',
  imageFile: null,
}

export default function CreateAirdropPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { createAirdrop, approveToken, step } = useCreateAirdrop()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tokenData, setTokenData] = useState<TokenStepData>(defaultTokenData)
  const [distributionData, setDistributionData] = useState<DistributionStepData>(defaultDistributionData)
  const [eligibilityData, setEligibilityData] = useState<EligibilityStepData>(defaultEligibilityData)
  const [metadataData, setMetadataData] = useState<MetadataStepData>(defaultMetadataData)

  const getEffectiveTokenAddress = () => {
    if (tokenData.mode === 'existing') return tokenData.existingTokenAddress
    return tokenData.createdTokenAddress
  }

  const handleSubmit = async () => {
    if (isSubmitting) return // Prevent double-click
    const tokenAddress = getEffectiveTokenAddress()
    if (!tokenAddress || !address) return

    setIsSubmitting(true)
    try {
      // 1. Upload metadata to IPFS
      const metadataUri = await uploadImageAndMetadata(metadataData.imageFile, {
        name: metadataData.name,
        description: metadataData.description,
        creator: address,
        token: {
          address: tokenAddress,
          symbol: tokenData.tokenSymbol,
          decimals: tokenData.tokenDecimals,
        },
        distribution: {
          amountPerClaim: distributionData.amountPerClaim,
          totalAmount: distributionData.totalAmount,
          startTime: distributionData.startTime.toISOString(),
          endTime: distributionData.endTime.toISOString(),
        },
        criteria: {
          minScore: eligibilityData.minScore,
          requiredBadges: eligibilityData.requiredBadges,
          badgeRequirement: eligibilityData.badgeRequirement,
          minEndorsementWeight: eligibilityData.minEndorsementWeight,
          requiresRegistration: eligibilityData.requiresRegistration,
        },
      })

      // 2. Approve token transfer
      const totalAmountWei = parseUnits(distributionData.totalAmount, tokenData.tokenDecimals)
      const approvalResult = await approveToken(tokenAddress, totalAmountWei)
      if (!approvalResult.success) {
        toast.error('Token approval failed')
        setIsSubmitting(false)
        return
      }
      toast.success('Token approved successfully')

      // 3. Create airdrop
      const result = await createAirdrop({
        tokenAddress,
        amountPerClaim: distributionData.amountPerClaim,
        totalAmount: distributionData.totalAmount,
        startTime: distributionData.startTime,
        endTime: distributionData.endTime,
        criteria: eligibilityData,
        metadataUri,
        tokenDecimals: tokenData.tokenDecimals,
      })

      if (result.success) {
        toast.success('Airdrop created successfully!')
        router.push('/airdrops')
      } else {
        toast.error('Failed to create airdrop')
        setIsSubmitting(false)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please connect your wallet to create an airdrop.</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Create Airdrop</h1>
          <p className="text-muted-foreground">Launch a reputation-gated token distribution</p>
        </div>

        <WizardStepper
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => step < currentStep && setCurrentStep(step)}
        />

        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <TokenStep
                data={tokenData}
                onUpdate={(update) => setTokenData((prev) => ({ ...prev, ...update }))}
                onNext={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 2 && (
              <DistributionStep
                data={distributionData}
                tokenSymbol={tokenData.tokenSymbol}
                maxSupply={tokenData.newTokenParams?.totalSupply || ''}
                onUpdate={(update) => setDistributionData((prev) => ({ ...prev, ...update }))}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && (
              <EligibilityStep
                data={eligibilityData}
                onUpdate={(update) => setEligibilityData((prev) => ({ ...prev, ...update }))}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && (
              <ReviewStep
                tokenData={tokenData}
                distributionData={distributionData}
                eligibilityData={eligibilityData}
                metadataData={metadataData}
                onUpdateMetadata={(update) => setMetadataData((prev) => ({ ...prev, ...update }))}
                onBack={() => setCurrentStep(3)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                currentStep={isSubmitting ? step || 'uploading' : 'idle'}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
