'use client'

import { MessageCircle } from 'lucide-react'

export function VeryChatContacts() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <MessageCircle className="h-4 w-4 text-violet" />
        <span className="font-medium">VeryChat Contacts</span>
      </div>
      <div className="bg-background rounded-lg p-4 border border-border">
        <p className="text-sm text-muted-foreground text-center">
          Contact import coming soon
        </p>
      </div>
    </div>
  )
}
