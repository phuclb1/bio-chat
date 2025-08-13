#!/usr/bin/env tsx

/**
 * Script to create default users in Supabase for testing and development
 * 
 * Usage:
 * npm run create-users
 * or
 * npx tsx scripts/create-default-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { DEFAULT_USERS, validateEnvironment } from './default-users-config'

// Load environment variables
dotenv.config({ path: '.env.migration' })

async function createDefaultUsers() {
  // Validate environment variables
  const envValidation = validateEnvironment()
  
  if (!envValidation.valid) {
    console.error('❌ Missing required environment variables:')
    envValidation.missing.forEach(envVar => {
      console.error(`- ${envVar}`)
    })
    console.error('')
    console.error('Please check your .env.migration file')
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!

  // Create Supabase admin client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🚀 Creating default users in Supabase...')
  console.log('')

  const results = []

  for (const userData of DEFAULT_USERS) {
    try {
      console.log(`Creating user: ${userData.email}`)

      // Create user with admin privileges (auto-confirm email)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: userData.userMetadata
      })

      if (authError) {
        console.error(`❌ Failed to create user ${userData.email}:`, authError.message)
        results.push({ email: userData.email, success: false, error: authError.message })
        continue
      }

      if (!authData.user) {
        console.error(`❌ Failed to create user ${userData.email}: No user data returned`)
        results.push({ email: userData.email, success: false, error: 'No user data returned' })
        continue
      }

      console.log(`✅ User created: ${userData.email} (ID: ${authData.user.id})`)

      // Insert profile data into users table
      try {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            ...userData.profileData,
            created_at: new Date().toISOString(),
            last_active_at: new Date().toISOString()
          })

        if (profileError) {
          console.warn(`⚠️  Could not create profile for ${userData.email}:`, profileError.message)
        } else {
          console.log(`✅ Profile created for: ${userData.email}`)
        }
      } catch (profileErr) {
        console.warn(`⚠️  Could not create profile for ${userData.email}:`, profileErr)
      }

      // Create default user preferences
      try {
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: authData.user.id,
            layout: 'fullscreen',
            prompt_suggestions: true,
            show_tool_invocations: true,
            show_conversation_previews: true,
            multi_model_enabled: false,
            hidden_models: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (preferencesError) {
          console.warn(`⚠️  Could not create preferences for ${userData.email}:`, preferencesError.message)
        } else {
          console.log(`✅ Preferences created for: ${userData.email}`)
        }
      } catch (preferencesErr) {
        console.warn(`⚠️  Could not create preferences for ${userData.email}:`, preferencesErr)
      }

      results.push({ 
        email: userData.email, 
        success: true, 
        userId: authData.user.id,
        displayName: userData.profileData.display_name,
        premium: userData.profileData.premium
      })

    } catch (error) {
      console.error(`❌ Unexpected error creating user ${userData.email}:`, error)
      results.push({ 
        email: userData.email, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }

    console.log('')
  }

  // Summary
  console.log('📊 Summary:')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Successfully created: ${successful.length} users`)
  successful.forEach(result => {
    const premium = result.premium ? '👑 Premium' : '📝 Free'
    console.log(`   - ${result.email} (${result.displayName}) ${premium}`)
  })

  if (failed.length > 0) {
    console.log(`❌ Failed to create: ${failed.length} users`)
    failed.forEach(result => {
      console.log(`   - ${result.email}: ${result.error}`)
    })
  }

  console.log('')
  console.log('🎉 Default users setup complete!')
  
  if (successful.length > 0) {
    console.log('')
    console.log('📝 Test Credentials:')
    successful.forEach(result => {
      const userData = DEFAULT_USERS.find(u => u.email === result.email)
      const premium = result.premium ? '👑 Premium' : '📝 Free'
      console.log(`   Email: ${result.email}`)
      console.log(`   Password: ${userData?.password}`)
      console.log(`   Name: ${result.displayName}`)
      console.log(`   Type: ${premium}`)
      console.log('')
    })
  }
}

// Handle script execution
if (require.main === module) {
  createDefaultUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

export { createDefaultUsers, DEFAULT_USERS }