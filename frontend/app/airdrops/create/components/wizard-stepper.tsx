'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface WizardStep {
  id: number
  title: string
  description: string
}

interface WizardStepperProps {
  steps: WizardStep[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isClickable = isCompleted && onStepClick

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    isCompleted && 'bg-violet text-white cursor-pointer hover:bg-violet/90',
                    isCurrent && 'bg-violet text-white ring-4 ring-violet/20',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                    !isClickable && 'cursor-default'
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                </button>
                <p
                  className={cn(
                    'mt-2 text-sm font-medium text-center',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    currentStep > step.id ? 'bg-violet' : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Token', description: 'Select or create' },
  { id: 2, title: 'Distribution', description: 'Amount & duration' },
  { id: 3, title: 'Eligibility', description: 'Who can claim' },
  { id: 4, title: 'Review', description: 'Confirm & create' },
]
