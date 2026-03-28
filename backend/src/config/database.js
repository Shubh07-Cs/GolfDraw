import { createClient } from '@supabase/supabase-js';
import env from './env.js';

// Admin client with service role key — bypasses RLS
export const supabaseAdmin = createClient(
  env.SUPABASE_URL || 'https://placeholder.supabase.co',
  env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a client scoped to a user's JWT for RLS enforcement
export function createUserClient(accessToken) {
  return createClient(
    env.SUPABASE_URL || 'https://placeholder.supabase.co',
    env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

export default supabaseAdmin;
