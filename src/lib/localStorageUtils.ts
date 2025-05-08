const PENDING_REPORTS_KEY = 'pending_activity_reports';

export interface StoredReportData {
  // This should mirror the structure of reportData in ReportForm.tsx
  // but also include a unique ID for local management if needed
  id: string; // A unique ID for this locally stored report
  data: any; // The actual report data object
  timestamp: number; // When it was saved locally
}

// Get all pending reports from localStorage
export function getPendingReports(): StoredReportData[] {
  const storedReports = localStorage.getItem(PENDING_REPORTS_KEY);
  if (storedReports) {
    try {
      return JSON.parse(storedReports) as StoredReportData[];
    } catch (error) {
      console.error("Error parsing pending reports from localStorage:", error);
      return []; // Return empty array on parsing error
    }
  }
  return [];
}

// Save a new report to the list of pending reports in localStorage
export function savePendingReport(reportData: any): void {
  const pendingReports = getPendingReports();
  const newStoredReport: StoredReportData = {
    id: `pending_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`, // Simple unique ID
    data: reportData,
    timestamp: new Date().getTime(),
  };
  pendingReports.push(newStoredReport);
  try {
    localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(pendingReports));
  } catch (error) {
    console.error("Error saving pending report to localStorage:", error);
    // Potentially handle quota exceeded errors here
    toast.error("Could not save report locally. Storage might be full.");
  }
}

// Remove a specific pending report from localStorage (e.g., after successful sync)
export function removePendingReport(reportId: string): void {
  let pendingReports = getPendingReports();
  pendingReports = pendingReports.filter(report => report.id !== reportId);
  try {
    localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(pendingReports));
  } catch (error) {
    console.error("Error removing pending report from localStorage:", error);
  }
}

// Clear all pending reports (use with caution)
export function clearAllPendingReports(): void {
  try {
    localStorage.removeItem(PENDING_REPORTS_KEY);
  } catch (error) {
    console.error("Error clearing all pending reports from localStorage:", error);
  }
}

// Import toast for error notifications within this utility if needed
// This creates a circular dependency if ReportForm also imports this and uses toast.
// It's often better to let the calling code handle toast notifications.
// For now, I'll use console.error and let ReportForm handle user-facing toasts.
// If we need toast here, we'd import it:
import { toast } from 'sonner'; // Or your preferred toast library