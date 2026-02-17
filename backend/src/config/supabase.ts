import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Supabase configuration
const supabaseUrl = env.supabaseUrl;
const supabaseServiceKey = env.supabaseServiceKey;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Image storage will not work.');
  console.warn('   Add SUPABASE_URL and SUPABASE_SERVICE_KEY to your .env file');
}

// Create Supabase client with service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Bucket name for storing images
export const IMAGES_BUCKET = 'nespresso-images';
