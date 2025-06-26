import { supabase } from '@/lib/supabase';
import { logger } from './loggerService';

/**
 * Ensures a user exists in the public.users table
 * This is needed because activity reports have a foreign key constraint
 * requiring the user_id to exist in the users table
 * 
 * @param userId The user ID or auth_id to look up
 * @returns The user ID if found, null otherwise
 */
export const ensureUserExists = async (userId: string): Promise<string | null> => {
  logger.info(`ensureUserExists called for userId: ${userId}`);
  if (!userId) {
    logger.error('Cannot ensure user exists with empty userId');
    return null;
  }

  try {
    // First try to find user by ID
    // Try to find user by ID
    const { data: userById, error: idError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userById && 'id' in userById) {
      return userById.id as string;
    }

    // If not found by ID, try by auth_id
    const { data: userByAuthId, error: authError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (userByAuthId && 'id' in userByAuthId) {
      return userByAuthId.id as string;
    }

    // Log appropriate error
    const error = idError || authError;
    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn(`User ${userId} not found in public.users table`);
      } else {
        logger.error('Error checking user existence:', error);
      }
    }
    
    return null;
  } catch (error) {
    logger.error('Unexpected error in ensureUserExists:', error);
    return null;
  }
};
