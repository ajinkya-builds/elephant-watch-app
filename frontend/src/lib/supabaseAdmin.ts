import { supabase } from './supabaseClient';

/**
 * The frontend should never expose the service-role key, but several legacy
 * components still import `supabaseAdmin` expecting a Supabase client with the
 * same API surface.  We therefore export the normal client under that name.
 *
 * TODO: migrate those components to import { supabase } from '@/lib/supabaseClient'
 * directly and remove this shim.
 */
export const supabaseAdmin = supabase; 