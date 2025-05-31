package com.elephantwatch.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

public class OfflineStorageManager {
    private static final String TAG = "OfflineStorageManager";
    private static final String PREF_NAME = "elephant_watch_offline_storage";
    private static final String KEY_PENDING_REPORTS = "pending_reports";
    private static final String KEY_USER_SESSION = "user_session";
    
    private final SharedPreferences preferences;
    private static OfflineStorageManager instance;
    
    private OfflineStorageManager(Context context) {
        preferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }
    
    public static synchronized OfflineStorageManager getInstance(Context context) {
        if (instance == null) {
            instance = new OfflineStorageManager(context.getApplicationContext());
        }
        return instance;
    }
    
    public void savePendingReport(JSONObject report) {
        try {
            JSONArray pendingReports = getPendingReports();
            pendingReports.put(report);
            preferences.edit().putString(KEY_PENDING_REPORTS, pendingReports.toString()).apply();
            Log.d(TAG, "Saved pending report. Total pending: " + pendingReports.length());
        } catch (JSONException e) {
            Log.e(TAG, "Error saving pending report", e);
        }
    }
    
    public JSONArray getPendingReports() throws JSONException {
        String reportsStr = preferences.getString(KEY_PENDING_REPORTS, "[]");
        return new JSONArray(reportsStr);
    }
    
    public void removePendingReport(int index) {
        try {
            JSONArray pendingReports = getPendingReports();
            JSONArray newReports = new JSONArray();
            
            for (int i = 0; i < pendingReports.length(); i++) {
                if (i != index) {
                    newReports.put(pendingReports.get(i));
                }
            }
            
            preferences.edit().putString(KEY_PENDING_REPORTS, newReports.toString()).apply();
            Log.d(TAG, "Removed pending report. Remaining: " + newReports.length());
        } catch (JSONException e) {
            Log.e(TAG, "Error removing pending report", e);
        }
    }
    
    public void saveUserSession(JSONObject session) {
        preferences.edit().putString(KEY_USER_SESSION, session.toString()).apply();
        Log.d(TAG, "Saved user session");
    }
    
    public JSONObject getUserSession() throws JSONException {
        String sessionStr = preferences.getString(KEY_USER_SESSION, null);
        return sessionStr != null ? new JSONObject(sessionStr) : null;
    }
    
    public void clearUserSession() {
        preferences.edit().remove(KEY_USER_SESSION).apply();
        Log.d(TAG, "Cleared user session");
    }
    
    public void clearAllData() {
        preferences.edit().clear().apply();
        Log.d(TAG, "Cleared all offline data");
    }
    
    public int getPendingReportsCount() {
        try {
            return getPendingReports().length();
        } catch (JSONException e) {
            Log.e(TAG, "Error getting pending reports count", e);
            return 0;
        }
    }
} 