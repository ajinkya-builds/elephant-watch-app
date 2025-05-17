import { supabase } from "./supabaseClient";

// Fetch functions
export async function fetchActivityLogs() {
  return supabase.from("activity_logs").select("*").order("time", { ascending: false });
}
export async function fetchErrorLogs() {
  return supabase.from("error_logs").select("*").order("time", { ascending: false });
}
export async function fetchLoginLogs() {
  return supabase.from("login_logs").select("*").order("time", { ascending: false });
}
export async function fetchSystemLogs() {
  return supabase.from("system_logs").select("*").order("time", { ascending: false });
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
