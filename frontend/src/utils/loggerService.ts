import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

// Types for log entries
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
  userId?: string;
  deviceInfo?: {
    model?: string;
    platform?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

// Storage key for logs
const LOGS_STORAGE_KEY = 'app_detailed_logs';
// Maximum number of logs to keep in storage
const MAX_LOGS = 100;

// Service for comprehensive logging
class LoggerService {
  private deviceInfo: any = null;
  private userId: string | null = null;

  constructor() {
    // Initialize device info
    this.initDeviceInfo();
  }

  /**
   * Get device information for logs
   */
  async initDeviceInfo() {
    if (Capacitor.isNativePlatform()) {
      try {
        this.deviceInfo = await Device.getInfo();
      } catch (error) {
        console.error('Failed to get device info:', error);
        // Fallback to minimal info
        this.deviceInfo = { 
          platform: Capacitor.getPlatform(),
          isVirtual: false,
          model: 'Unknown'
        };
      }
    } else {
      // Web platform info
      this.deviceInfo = {
        platform: 'web',
        model: navigator.userAgent,
        osVersion: 'unknown',
        webViewVersion: navigator.appVersion
      };
    }
  }

  /**
   * Set current user ID for logs
   */
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  /**
   * Create a log entry
   */
  private createLogEntry(level: LogLevel, message: string, details?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      userId: this.userId || undefined,
      deviceInfo: this.deviceInfo ? {
        model: this.deviceInfo.model,
        platform: this.deviceInfo.platform,
        osVersion: this.deviceInfo.osVersion,
        appVersion: this.deviceInfo.appVersion || this.deviceInfo.appBuild
      } : undefined
    };
  }

  /**
   * Save log entry to storage
   */
  private async saveLog(entry: LogEntry) {
    try {
      const { value } = await Preferences.get({ key: LOGS_STORAGE_KEY });
      let logs: LogEntry[] = value ? JSON.parse(value) : [];
      
      // Add new log
      logs.push(entry);
      
      // Keep only the most recent logs
      if (logs.length > MAX_LOGS) {
        logs = logs.slice(-MAX_LOGS);
      }
      
      await Preferences.set({
        key: LOGS_STORAGE_KEY,
        value: JSON.stringify(logs)
      });
    } catch (error) {
      // Just log to console if storage fails
      console.error('Failed to save log:', error);
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, details);
    console.debug(`[DEBUG] ${message}`, details || '');
    this.saveLog(entry);
  }

  /**
   * Log an info message
   */
  info(message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, details);
    console.info(`[INFO] ${message}`, details || '');
    this.saveLog(entry);
  }

  /**
   * Log a warning message
   */
  warn(message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, details);
    console.warn(`[WARN] ${message}`, details || '');
    this.saveLog(entry);
  }

  /**
   * Log an error message
   */
  error(message: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, details);
    console.error(`[ERROR] ${message}`, details || '');
    this.saveLog(entry);
  }

  /**
   * Get stored logs
   */
  async getLogs(): Promise<LogEntry[]> {
    try {
      const { value } = await Preferences.get({ key: LOGS_STORAGE_KEY });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  /**
   * Clear all stored logs
   */
  async clearLogs(): Promise<void> {
    try {
      await Preferences.remove({ key: LOGS_STORAGE_KEY });
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  /**
   * Export logs as a JSON string
   */
  async exportLogs(): Promise<string> {
    const logs = await this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// Create single instance
export const logger = new LoggerService();
