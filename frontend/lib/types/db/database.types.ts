export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          ens_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          ens_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          ens_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          transaction_hash: string
          from_address: string
          to_address: string
          value: string
          gas_used: string | null
          status: 'pending' | 'confirmed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_hash: string
          from_address: string
          to_address: string
          value: string
          gas_used?: string | null
          status?: 'pending' | 'confirmed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_hash?: string
          from_address?: string
          to_address?: string
          value?: string
          gas_used?: string | null
          status?: 'pending' | 'confirmed' | 'failed'
          created_at?: string
        }
      }
      tokens: {
        Row: {
          id: string
          user_id: string
          token_address: string
          symbol: string
          name: string
          decimals: number
          balance: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_address: string
          symbol: string
          name: string
          decimals: number
          balance: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_address?: string
          symbol?: string
          name?: string
          decimals?: number
          balance?: string
          created_at?: string
          updated_at?: string
        }
      }
      nfts: {
        Row: {
          id: string
          user_id: string
          contract_address: string
          token_id: string
          name: string | null
          description: string | null
          image_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contract_address: string
          token_id: string
          name?: string | null
          description?: string | null
          image_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contract_address?: string
          token_id?: string
          name?: string | null
          description?: string | null
          image_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}