import { supabase } from "./supabaseClient";

// Fetch functions
export async function fetchActivityLogs() {
  return supabase.from("activity_logs").select("*").order("time", { ascending: false });
}
export async function fetchErrorLogs() {
  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('time', { ascending: false });

    if (error) {
      console.error('Error fetching error logs:', error);
      return { data: [] };
    }

    return { data };
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return { data: [] };
  }
}
export async function fetchLoginLogs() {
  try {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .order('time', { ascending: false });

    if (error) {
      console.error('Error fetching login logs:', error);
      return { data: [] };
    }

    return { data };
  } catch (error) {
    console.error('Error fetching login logs:', error);
    return { data: [] };
  }
}
export async function fetchSystemLogs() {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('time', { ascending: false });

    if (error) {
      console.error('Error fetching system logs:', error);
      return { data: [] };
    }

    return { data };
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return { data: [] };
  }
}

// Insert functions
export async function insertActivityLog(log: { user: string; action: string; time?: string; ip?: string }) {
  return supabase.from("activity_logs").insert([{ ...log, time: log.time || new Date().toISOString() }]);
}
export async function insertErrorLog(log: { level: string; message: string; time?: string }) {
  return supabase.from("error_logs").insert([{ ...log, time: log.time || new Date().toISOString() }]);
}
export async function insertLoginLog(log: { user: string; status: string; time?: string; ip?: string; browser?: string }) {
  return supabase.from("login_logs").insert([{ ...log, time: log.time || new Date().toISOString() }]);
}
export async function insertSystemLog(log: { job: string; status: string; time?: string }) {
  return supabase.from("system_logs").insert([{ ...log, time: log.time || new Date().toISOString() }]);
}

// Helper functions to log events
export async function logError(level: 'Error' | 'Warning', message: string) {
  try {
    const { error } = await supabase.rpc('log_error', {
      level,
      message
    });

    if (error) {
      console.error('Error logging error:', error);
    }
  } catch (error) {
    console.error('Error logging error:', error);
  }
}

export async function logLogin(email: string, status: 'Success' | 'Failed') {
  try {
    const { error } = await supabase.rpc('log_login', {
      email,
      status
    });

    if (error) {
      console.error('Error logging login:', error);
    }
  } catch (error) {
    console.error('Error logging login:', error);
  }
}

export async function logSystemEvent(job: string, status: 'Success' | 'Failed', details?: string) {
  try {
    const { error } = await supabase.rpc('log_system_event', {
      job,
      status,
      details
    });

    if (error) {
      console.error('Error logging system event:', error);
    }
  } catch (error) {
    console.error('Error logging system event:', error);
  }
}
