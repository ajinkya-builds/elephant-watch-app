import { supabase } from '@/lib/supabase';
import { logger } from './loggerService';

/**
 * Ensures a user exists in the public.users table
 * This is needed because activity reports have a foreign key constraint
 * requiring the user_id to exist in the users table
 * 
 * @param userId The auth user ID to ensure exists
 * @returns True if the user exists or was created, false if failed
 */
export const ensureUserExists = async (userId: string): Promise<string | null> => {
  logger.info(`ensureUserExists called for userId: ${userId}`); // Added logging
  if (!userId) {
    logger.error('Cannot ensure user exists with empty userId');
    return null;
  }

  try {
    // First check if the user already exists
    logger.debug(`Checking if user ${userId} already exists in public.users table`); // Added logging
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // "Results contain 0 rows"
        logger.warn(`User ${userId} not found in public.users table. Not attempting to create as per instruction.`);
        return null; // User not found, and we are not inserting
      } else {
        logger.error(`Error checking if user ${userId} exists:`, fetchError);
        return null;
      }
    }

    // If the user already exists, return true
    if (existingUser) {
      logger.debug(`User ${userId} already exists in public.users table. Returning ID: ${existingUser.id}`);
      return existingUser.id;
    }

    // If we reach here, it means existingUser was null/undefined and fetchError was not PGRST116.
    // This case should ideally not happen if single() is used correctly, but as a fallback:
    logger.warn(`Unexpected state: User ${userId} not found, but no PGRST116 error. Not attempting to create.`);
    return null;
  } catch (error: any) {
    logger.error('Unexpected error in ensureUserExists:', error);
    return null;
  }
};
