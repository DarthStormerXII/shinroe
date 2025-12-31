import { toast as sonnerToast } from 'sonner'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
  action?: ToastAction
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration, action } = options

    const message = title || description || ''
    const descriptionText = title && description ? description : undefined

    const toastOptions = {
      description: descriptionText,
      duration: duration || 5000,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    }

    switch (variant) {
      case 'destructive':
        sonnerToast.error(message, toastOptions)
        break
      case 'success':
        sonnerToast.success(message, toastOptions)
        break
      default:
        sonnerToast(message, toastOptions)
    }
  }

  return { toast }
}

// Export toast function for direct usage
export const toast = (options: ToastOptions) => {
  const { title, description, variant = 'default', duration, action } = options

  const message = title || description || ''
  const descriptionText = title && description ? description : undefined

  const toastOptions = {
    description: descriptionText,
    duration: duration || 5000,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
  }

  switch (variant) {
    case 'destructive':
      sonnerToast.error(message, toastOptions)
      break
    case 'success':
      sonnerToast.success(message, toastOptions)
      break
    default:
      sonnerToast(message, toastOptions)
  }
}