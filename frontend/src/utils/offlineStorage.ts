import { Preferences } from '@capacitor/preferences';
import { ActivityReport } from '@/types/activity-report';
import { v4 as uuidv4 } from 'uuid';
import { isOnline } from './networkUtils';
import { supabase } from '@/lib/supabaseClient';
import { ensureUserExists } from './userUtils';
import { logger } from './loggerService';

// Key for storing pending reports
const PENDING_REPORTS_KEY = 'pendingActivityReports';

/**
 * Interface for offline reports with additional metadata
 */
interface PendingReport {
  id: string;              // Local UUID for tracking
  reportData: Partial<ActivityReport>;
  createdAt: string;       // ISO timestamp string
  syncAttempts: number;    // Number of sync attempts
  lastSyncAttempt?: string; // Last sync attempt timestamp
}

/**
 * Save an activity report for later submission when offline
 * @param reportData The activity report data to save
 * @returns The pending report with generated ID
 */
export const saveReportForLaterSync = async (reportData: Partial<ActivityReport>): Promise<PendingReport> => {
  try {
    console.log('Saving report for later sync:', reportData);

    // Create a pending report with metadata
    const pendingReport: PendingReport = {
      id: uuidv4(),
      reportData,
      createdAt: new Date().toISOString(),
      syncAttempts: 0
    };

    // Get existing pending reports
    const { value: existingReportsJSON } = await Preferences.get({ key: PENDING_REPORTS_KEY });
    const existingReports: PendingReport[] = existingReportsJSON ? JSON.parse(existingReportsJSON) : [];
    
    // Add new report to the list
    const updatedReports = [...existingReports, pendingReport];
    
    // Save back to storage
    await Preferences.set({
      key: PENDING_REPORTS_KEY,
      value: JSON.stringify(updatedReports)
    });
    
    console.log(`Report saved for later sync. Total pending reports: ${updatedReports.length}`);
    
    return pendingReport;
  } catch (error) {
    console.error('Error saving report for later:', error);
    throw error;
  }
};

/**
 * Get all pending reports that haven't been synced yet
 * @returns Array of pending reports
 */
export const getPendingReports = async (): Promise<PendingReport[]> => {
  try {
    const { value: reportsJSON } = await Preferences.get({ key: PENDING_REPORTS_KEY });
    if (!reportsJSON) {
      return [];
    }
    return JSON.parse(reportsJSON);
  } catch (error) {
    console.error('Error getting pending reports:', error);
    return [];
  }
};

/**
 * Remove a successfully synced report from the pending list
 * @param reportId The ID of the report to remove
 */
export const removePendingReport = async (reportId: string): Promise<void> => {
  try {
    const { value: reportsJSON } = await Preferences.get({ key: PENDING_REPORTS_KEY });
    if (!reportsJSON) {
      return;
    }
    
    const reports: PendingReport[] = JSON.parse(reportsJSON);
    const updatedReports = reports.filter(report => report.id !== reportId);
    
    await Preferences.set({
      key: PENDING_REPORTS_KEY,
      value: JSON.stringify(updatedReports)
    });
    
    console.log(`Removed synced report ${reportId}. Remaining: ${updatedReports.length}`);
  } catch (error) {
    console.error('Error removing pending report:', error);
  }
};

/**
 * Update a pending report's sync attempt metadata
 * @param reportId The ID of the report to update
 */
export const updateSyncAttempt = async (reportId: string): Promise<void> => {
  try {
    const { value: reportsJSON } = await Preferences.get({ key: PENDING_REPORTS_KEY });
    if (!reportsJSON) {
      return;
    }
    
    const reports: PendingReport[] = JSON.parse(reportsJSON);
    const updatedReports = reports.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          syncAttempts: report.syncAttempts + 1,
          lastSyncAttempt: new Date().toISOString()
        };
      }
      return report;
    });
    
    await Preferences.set({
      key: PENDING_REPORTS_KEY,
      value: JSON.stringify(updatedReports)
    });
  } catch (error) {
    console.error('Error updating sync attempt:', error);
  }
};

/**
 * Attempts to synchronize all pending reports with the server
 * @returns Object containing stats about the sync operation
 */
export const syncPendingReports = async (): Promise<{ 
  success: number, 
  failed: number, 
  remaining: number 
}> => {
  // Check if we're online first
  const online = await isOnline();
  if (!online) {
    logger.info('Device is offline, skipping sync attempt');
    return { success: 0, failed: 0, remaining: 0 };
  }
  
  try {
    const pendingReports = await getPendingReports();
    if (pendingReports.length === 0) {
      return { success: 0, failed: 0, remaining: 0 };
    }
    
    logger.info(`Attempting to sync ${pendingReports.length} pending reports`);
    
    let successCount = 0;
    let failedCount = 0;
    
    // Process each pending report
    for (const report of pendingReports) {
      try {
        // Update sync attempt metadata
        await updateSyncAttempt(report.id);
        
        // Ensure the user exists in the public.users table first
        // This prevents foreign key constraint errors
        const userId = report.reportData.user_id;
        if (!userId) {
          logger.error(`Report ${report.id} has no user_id, skipping sync`);
          failedCount++;
          continue;
        }
        
        const userIdFromDb = await ensureUserExists(userId);
        if (!userIdFromDb) {
          logger.error(`Failed to ensure user ${userId} exists, skipping sync for report ${report.id}`);
          failedCount++;
          continue;
        }
        
        // Attempt to submit to Supabase
        report.reportData.user_id = userIdFromDb;
        const { error } = await supabase
          .from('activity_reports')
          .insert([report.reportData]);
        
        if (error) {
          logger.error(`Error syncing report ${report.id}:`, error);
          failedCount++;
        } else {
          // Successfully synced, remove from pending list
          await removePendingReport(report.id);
          successCount++;
          logger.info(`Successfully synced report ${report.id}`);
        }
      } catch (error) {
        console.error(`Error processing report ${report.id}:`, error);
        failedCount++;
      }
    }
    
    // Get updated count of remaining reports
    const remainingReports = await getPendingReports();
    
    console.log(`Sync complete. Success: ${successCount}, Failed: ${failedCount}, Remaining: ${remainingReports.length}`);
    
    return {
      success: successCount,
      failed: failedCount,
      remaining: remainingReports.length
    };
  } catch (error) {
    console.error('Error syncing pending reports:', error);
    return { success: 0, failed: 0, remaining: 0 };
  }
};

/**
 * Submit an activity report, with offline fallback
 * @param reportData The activity report to submit
 * @returns Object with status of the submission
 */
export const submitActivityReport = async (reportData: Partial<ActivityReport>): Promise<{ 
  success: boolean;
  offline: boolean;
  message: string;
  error?: any;
}> => {
  try {
    const online = await isOnline();
    
    // If offline, save locally
    if (!online) {
      await saveReportForLaterSync(reportData);
      return {
        success: true,
        offline: true,
        message: 'Report saved locally and will be submitted when online'
      };
    }
    
    // We're online, try immediate submission
    if (!reportData.user_id) {
      throw new Error('User ID is required for activity report');
    }
    logger.debug(`Attempting to ensure user exists for auth_id: ${reportData.user_id}`);
    
    const userIdFromDb = await ensureUserExists(reportData.user_id);
    if (!userIdFromDb) {
      throw new Error(`Failed to ensure user ${reportData.user_id} exists in database`);
    }
    
    reportData.user_id = userIdFromDb;
    const { error } = await supabase
      .from('activity_reports')
      .insert([reportData]);
    
    if (error) {
      // Even though we're online, the submission failed
      // Save it for later and return the error
      await saveReportForLaterSync(reportData);
      return {
        success: false,
        offline: false,
        message: `Failed to submit report: ${error.message}`,
        error
      };
    }
    
    // Successfully submitted
    return {
      success: true,
      offline: false,
      message: 'Report submitted successfully'
    };
  } catch (error: any) {
    // Error during the submission process
    // Save locally as fallback
    await saveReportForLaterSync(reportData);
    return {
      success: false,
      offline: false,
      message: `Error during submission: ${error.message || 'Unknown error'}`,
      error
    };
  }
};
