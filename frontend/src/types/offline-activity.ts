export interface OfflineActivity {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  lastError?: string;
} 