# Default Users Setup Script

This script creates default test accounts in your Supabase database for development and testing purposes.

## Overview

The script creates users with proper authentication credentials and populates both the `users` table and `user_preferences` table according to the schema defined in `INSTALL.md`.

## Quick Start

1. **Set up environment variables** in `.env.migration`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE=your_service_role_key
   ```

2. **Run the script**:
   ```bash
   npm run create-users
   ```

## Default Accounts Created

The script creates 4 test accounts with different permission levels:

| Email | Password | Type | Premium | Description |
|-------|----------|------|---------|-------------|
| `admin@rainscale.com` | `admin123` | Admin | ✅ Yes | Administrative user with full access |
| `doctor@rainscale.com` | `doctor123` | Doctor | ✅ Yes | Medical professional account |
| `nurse@rainscale.com` | `nurse123` | Nurse | ❌ No | Healthcare staff account |
| `user@rainscale.com` | `user123` | User | ❌ No | Standard user account |

## What the Script Does

1. **Creates Auth Users**: Uses Supabase Auth Admin API to create users with confirmed emails
2. **Populates Users Table**: Inserts profile data matching the database schema
3. **Sets Up Preferences**: Creates default user preferences for each account
4. **Handles Errors**: Gracefully handles existing users and permission errors

## Database Tables Updated

### `auth.users` (Supabase Auth)
- Email and password authentication
- Email automatically confirmed
- User metadata with display names and roles

### `public.users`
- User profile information
- Premium status and message counts
- Favorite models and system prompts
- Timestamps for created_at and last_active_at

### `public.user_preferences`
- UI layout preferences
- Feature toggles (prompt suggestions, tool invocations, etc.)
- Model visibility settings

## Prerequisites

### Required Environment Variables

The script requires these environment variables in your `.env.migration` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Important**: You need the **Service Role Key**, not the anon key, to create users programmatically.

### Database Schema

Ensure your Supabase database has the required tables as defined in `INSTALL.md`:

- `users` table with all required columns
- `user_preferences` table 
- Proper foreign key relationships
- Row Level Security (RLS) policies if enabled

## Configuration

### Customizing Default Users

Edit `scripts/default-users-config.ts` to modify the default users:

```typescript
export const DEFAULT_USERS: DefaultUser[] = [
  {
    email: 'custom@example.com',
    password: 'custompass123',
    userMetadata: {
      display_name: 'Custom User',
      role: 'custom_role'
    },
    profileData: {
      email: 'custom@example.com',
      anonymous: false,
      display_name: 'Custom User',
      premium: false,
      // ... other profile fields
    }
  }
  // Add more users as needed
]
```

### Environment Validation

The script validates required environment variables before running:

```typescript
export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
]
```

## Usage Examples

### Basic Usage
```bash
npm run create-users
```

### With Custom Environment File
```bash
# If using a different env file
NODE_ENV=development tsx scripts/create-default-users.ts
```

### Programmatic Usage
```typescript
import { createDefaultUsers } from './scripts/create-default-users'

// Use in your setup scripts
await createDefaultUsers()
```

## Output Example

```
🚀 Creating default users in Supabase...

Creating user: admin@rainscale.com
✅ User created: admin@rainscale.com (ID: 12345678-1234-1234-1234-123456789012)
✅ Profile created for: admin@rainscale.com
✅ Preferences created for: admin@rainscale.com

Creating user: doctor@rainscale.com
✅ User created: doctor@rainscale.com (ID: 87654321-4321-4321-4321-210987654321)
✅ Profile created for: doctor@rainscale.com
✅ Preferences created for: doctor@rainscale.com

📊 Summary:
==================================================
✅ Successfully created: 4 users
   - admin@rainscale.com (Admin User) 👑 Premium
   - doctor@rainscale.com (Dr. John Smith) 👑 Premium
   - nurse@rainscale.com (Sarah Johnson) 📝 Free
   - user@rainscale.com (Test User) 📝 Free

🎉 Default users setup complete!

📝 Test Credentials:
   Email: admin@rainscale.com
   Password: admin123
   Name: Admin User
   Type: 👑 Premium

   Email: doctor@rainscale.com
   Password: doctor123
   Name: Dr. John Smith
   Type: 👑 Premium
```

## Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Ensure `.env.migration` file exists with required variables
   - Check that `SUPABASE_SERVICE_ROLE_KEY` is the service role key, not anon key

2. **"Authentication failed"**
   - Verify your service role key is correct
   - Check Supabase project URL format

3. **"Table 'users' doesn't exist"**
   - Run the SQL schema from `INSTALL.md` first
   - Ensure you're connected to the correct Supabase project

4. **"Users already exist"**
   - Script handles existing users gracefully
   - Use Supabase dashboard to delete existing test users if needed

5. **"Permission denied"**
   - Ensure RLS policies allow service role access
   - Check that service role key has admin privileges

### Debug Mode

Add more logging by modifying the script:

```typescript
// Add before each operation
console.log('Debug: Current operation details...')
```

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit** `.env.migration` to version control
2. **Service Role Key** has admin privileges - keep it secure
3. **Default passwords** should be changed in production
4. **Delete test accounts** before deploying to production
5. **Review RLS policies** to ensure proper data access control

## File Structure

```
scripts/
├── create-default-users.ts      # Main script
├── default-users-config.ts      # User configuration
└── README.md                    # This documentation
```

## Related Documentation

- [INSTALL.md](../INSTALL.md) - Database schema and setup
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)