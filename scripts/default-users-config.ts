/**
 * Configuration for default users to be created in Supabase
 * 
 * You can modify this file to add/remove/update default users
 * without changing the main script
 */

export interface DefaultUser {
  email: string
  password: string
  userMetadata: {
    display_name?: string
    [key: string]: any
  }
  profileData: {
    email: string
    anonymous?: boolean
    daily_message_count?: number
    daily_reset?: string
    display_name?: string
    favorite_models?: string[]
    message_count?: number
    premium?: boolean
    profile_image?: string
    daily_pro_message_count?: number
    daily_pro_reset?: string
    system_prompt?: string
  }
}

export const DEFAULT_USERS: DefaultUser[] = [
  {
    email: 'admin@rainscale.com',
    password: 'admin123',
    userMetadata: {
      display_name: 'Admin User',
      role: 'admin',
      department: 'Administration'
    },
    profileData: {
      email: 'admin@rainscale.com',
      anonymous: false,
      display_name: 'Admin User',
      premium: true,
      message_count: 0,
      daily_message_count: 0,
      daily_pro_message_count: 0,
      favorite_models: ['claude-3-5-sonnet-20241022', 'gpt-4o'],
      system_prompt: 'You are a helpful medical AI assistant with administrative privileges.'
    }
  },
  {
    email: 'doctor@rainscale.com',
    password: 'doctor123',
    userMetadata: {
      display_name: 'Dr. John Smith',
      role: 'doctor',
      specialization: 'General Medicine',
      license_number: 'MD-2024-001'
    },
    profileData: {
      email: 'doctor@rainscale.com',
      anonymous: false,
      display_name: 'Dr. John Smith',
      premium: true,
      message_count: 0,
      daily_message_count: 0,
      daily_pro_message_count: 0,
      favorite_models: ['claude-3-5-sonnet-20241022', 'gpt-4o-mini'],
      system_prompt: 'You are a medical AI assistant. Provide accurate medical information while reminding users to consult healthcare professionals.'
    }
  },
  {
    email: 'nurse@rainscale.com',
    password: 'nurse123',
    userMetadata: {
      display_name: 'Sarah Johnson',
      role: 'nurse',
      department: 'Emergency'
    },
    profileData: {
      email: 'nurse@rainscale.com',
      anonymous: false,
      display_name: 'Sarah Johnson',
      premium: false,
      message_count: 0,
      daily_message_count: 0,
      daily_pro_message_count: 0,
      favorite_models: ['gpt-4o-mini', 'gemma2:2b'],
      system_prompt: 'You are a helpful AI assistant for healthcare professionals.'
    }
  },
  {
    email: 'user@rainscale.com',
    password: 'user123',
    userMetadata: {
      display_name: 'Test User',
      role: 'user'
    },
    profileData: {
      email: 'user@rainscale.com',
      anonymous: false,
      display_name: 'Test User',
      premium: false,
      message_count: 0,
      daily_message_count: 0,
      daily_pro_message_count: 0,
      favorite_models: ['gpt-4o-mini'],
      system_prompt: "You are an expert and experienced from the healthcare and biomedical domain with extensive medical knowledge and practical experience. Your name is Rainscales Assistant, and you were developed by Rainscales Healthcare AI who's willing to help answer the user's query with explanation. In your explanation, leverage your deep medical expertise such as relevant anatomical structures, physiological processes, diagnostic criteria, treatment guidelines, or other pertinent medical concepts. Use precise medical terminology while still aiming to make the explanation clear and accessible to a general audience."
    }
  }
]

// Environment validation
export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE'
] as const

export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_ENV_VARS.filter(envVar => !process.env[envVar])
  return {
    valid: missing.length === 0,
    missing
  }
}