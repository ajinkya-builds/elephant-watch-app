const PENDING_REPORTS_KEY = 'pending_activity_reports';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

export interface StoredReportData {
  // This should mirror the structure of reportData in ReportForm.tsx
  // but also include a unique ID for local management if needed
  id: string; // A unique ID for this locally stored report
  data: any; // The actual report data object
  timestamp: number; // When it was saved locally
  retryCount: number;
  lastError?: string;
}

// Get all pending reports from localStorage
export function getPendingReports(): StoredReportData[] {
  const storedReports = localStorage.getItem(PENDING_REPORTS_KEY);
  if (storedReports) {
    try {
      return JSON.parse(storedReports) as StoredReportData[];
    } catch (error) {
      console.error("Error parsing pending reports from localStorage:", error);
      return [];
    }
  }
  return [];
}

// Save a new report to the list of pending reports in localStorage
export function savePendingReport(reportData: any): void {
  const pendingReports = getPendingReports();
  const newStoredReport: StoredReportData = {
    id: `pending_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    data: reportData,
    timestamp: new Date().getTime(),
    retryCount: 0
  };
  pendingReports.push(newStoredReport);
  try {
    localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(pendingReports));
  } catch (error) {
    console.error("Error saving pending report to localStorage:", error);
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error("Storage quota exceeded. Please clear some space and try again.");
    }
    throw new Error("Failed to save report locally");
  }
}

// Update a pending report's retry count and error message
export function updatePendingReportRetry(reportId: string, error: Error): void {
  const pendingReports = getPendingReports();
  const reportIndex = pendingReports.findIndex(report => report.id === reportId);
  
  if (reportIndex !== -1) {
    const report = pendingReports[reportIndex];
    report.retryCount = (report.retryCount || 0) + 1;
    report.lastError = error.message;
    
    try {
      localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(pendingReports));
    } catch (error) {
      console.error("Error updating pending report retry count:", error);
    }
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

// Check if a report has exceeded max retry attempts
export function hasExceededMaxRetries(report: StoredReportData): boolean {
  return (report.retryCount || 0) >= MAX_RETRY_ATTEMPTS;
}

// Get reports that are ready for retry (based on delay)
export function getReportsReadyForRetry(): StoredReportData[] {
  const pendingReports = getPendingReports();
  const now = Date.now();
  
  return pendingReports.filter(report => {
    const lastAttempt = report.timestamp + (report.retryCount || 0) * RETRY_DELAY_MS;
    return now >= lastAttempt && !hasExceededMaxRetries(report);
  });
}

// Import toast for error notifications within this utility if needed
// This creates a circular dependency if ReportForm also imports this and uses toast.
// It's often better to let the calling code handle toast notifications.
// For now, I'll use console.error and let ReportForm handle user-facing toasts.
// If we need toast here, we'd import it:
import { toast } from 'sonner'; // Or your preferred toast library