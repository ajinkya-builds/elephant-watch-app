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
 * Clean any existing pending reports by removing the beat_id field
 * This ensures data compatibility with the current database schema
 */
export const cleanPendingReports = async (): Promise<void> => {
  try {
    const { value: reportsJSON } = await Preferences.get({ key: PENDING_REPORTS_KEY });
    if (!reportsJSON) {
      return;
    }
    
    const reports: PendingReport[] = JSON.parse(reportsJSON);
    
    // Remove beat_id from all reports
    const sanitizedReports = reports.map(report => {
      // Create a shallow copy of the report
      const sanitizedReport = { ...report };
      
      // Remove beat_id from reportData if it exists
      if (sanitizedReport.reportData && (sanitizedReport.reportData as any).beat_id !== undefined) {
        const { beat_id, ...restOfData } = sanitizedReport.reportData as any;
        sanitizedReport.reportData = restOfData;
      }
      
      return sanitizedReport;
    });
    
    // Save the sanitized reports back
    await Preferences.set({
      key: PENDING_REPORTS_KEY,
      value: JSON.stringify(sanitizedReports)
    });
    
    logger.info(`Cleaned ${sanitizedReports.length} pending reports to ensure DB compatibility`);
  } catch (error) {
    logger.error('Error cleaning pending reports:', error);
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
  // Clean all pending reports first to ensure beat_id is removed
  await cleanPendingReports();
  
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
        
        // Create a clean object with only the columns we know exist in the database
        // This ensures we don't try to insert any fields that don't exist in the DB schema
        const cleanReportData = {
          user_id: report.reportData.user_id,
          activity_date: report.reportData.activity_date,
          activity_time: report.reportData.activity_time,
          observation_type: report.reportData.observation_type,
          latitude: report.reportData.latitude,
          longitude: report.reportData.longitude,
          compass_bearing: report.reportData.compass_bearing,
          indirect_sighting_type: report.reportData.indirect_sighting_type,
          loss_type: report.reportData.loss_type
        };
        
        // Add optional fields only if they exist in the report data
        const optionalFields = [
          'total_elephants', 'male_elephants', 'female_elephants', 'unknown_elephants',
          'calves', 'photo_url', 'damage_done', 'damage_description',
          'reporter_mobile', 'associated_division', 'associated_range', 'associated_beat'
        ];
        
        optionalFields.forEach(field => {
          if (report.reportData[field as keyof typeof report.reportData] !== undefined) {
            (cleanReportData as any)[field] = report.reportData[field as keyof typeof report.reportData];
          }
        });
        
        // Use a specific columns approach to avoid any database triggers or RLS policies
        // that might reference non-existent columns
        const { error } = await supabase
          .from('activity_reports')
          .insert([cleanReportData]);
        
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

    // Create a clean object with only the columns we know exist in the database
    const cleanReportData = {
      user_id: reportData.user_id,
      activity_date: reportData.activity_date,
      activity_time: reportData.activity_time,
      observation_type: reportData.observation_type,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      compass_bearing: reportData.compass_bearing,
      indirect_sighting_type: reportData.indirect_sighting_type,
      loss_type: reportData.loss_type
    };
    
    // Add optional fields only if they exist
    const optionalFields = [
      'total_elephants', 'male_elephants', 'female_elephants', 'unknown_elephants',
      'calves', 'photo_url', 'damage_done', 'damage_description',
      'reporter_mobile', 'associated_division', 'associated_range', 'associated_beat'
    ];
    
    optionalFields.forEach(field => {
      if ((reportData as any)[field] !== undefined) {
        (cleanReportData as any)[field] = (reportData as any)[field];
      }
    });

    const { error } = await supabase
      .from('activity_reports')
      .insert([cleanReportData]);
    
    if (error) {
      // Even though we're online, the submission failed
      // Save it for later and return the error
      // We save `cleanReportData` which doesn't have `beat_id`
      await saveReportForLaterSync(cleanReportData);
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
    // Save a clean version locally as fallback
    const cleanReportData: Partial<ActivityReport> = {
      user_id: reportData.user_id,
      activity_date: reportData.activity_date,
      activity_time: reportData.activity_time,
      observation_type: reportData.observation_type,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      compass_bearing: reportData.compass_bearing,
      indirect_sighting_type: reportData.indirect_sighting_type,
      loss_type: reportData.loss_type
    };
    
    // Add optional fields only if they exist
    const optionalFields = [
      'total_elephants', 'male_elephants', 'female_elephants', 'unknown_elephants',
      'calves', 'photo_url', 'damage_done', 'damage_description',
      'reporter_mobile', 'associated_division', 'associated_range', 'associated_beat'
    ];
    
    optionalFields.forEach(field => {
      if ((reportData as any)[field] !== undefined) {
        (cleanReportData as any)[field] = (reportData as any)[field];
      }
    });
    
    await saveReportForLaterSync(cleanReportData);
    return {
      success: false,
      offline: false,
      message: `Error during submission: ${error.message || 'Unknown error'}`,
      error
    };
  }
};
