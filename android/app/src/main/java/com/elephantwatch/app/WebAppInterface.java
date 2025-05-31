package com.elephantwatch.app;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.util.Log;
import android.location.Location;
import android.location.LocationManager;
import android.location.LocationListener;
import android.os.Bundle;
import android.os.Looper;
import org.json.JSONObject;
import org.json.JSONException;

public class WebAppInterface {
    private static final String TAG = "WebAppInterface";
    private final Context context;
    private final OfflineStorageManager storageManager;
    private LocationManager locationManager;
    private LocationListener locationListener;
    
    public WebAppInterface(Context context) {
        this.context = context;
        this.storageManager = OfflineStorageManager.getInstance(context);
        this.locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    }
    
    @JavascriptInterface
    public void savePendingReport(String reportJson) {
        try {
            JSONObject report = new JSONObject(reportJson);
            storageManager.savePendingReport(report);
            Log.d(TAG, "Saved pending report from JavaScript");
        } catch (JSONException e) {
            Log.e(TAG, "Error saving pending report from JavaScript", e);
        }
    }
    
    @JavascriptInterface
    public String getPendingReports() {
        try {
            return storageManager.getPendingReports().toString();
        } catch (JSONException e) {
            Log.e(TAG, "Error getting pending reports for JavaScript", e);
            return "[]";
        }
    }
    
    @JavascriptInterface
    public void removePendingReport(int index) {
        storageManager.removePendingReport(index);
        Log.d(TAG, "Removed pending report from JavaScript");
    }
    
    @JavascriptInterface
    public void saveUserSession(String sessionJson) {
        try {
            JSONObject session = new JSONObject(sessionJson);
            storageManager.saveUserSession(session);
            Log.d(TAG, "Saved user session from JavaScript");
        } catch (JSONException e) {
            Log.e(TAG, "Error saving user session from JavaScript", e);
        }
    }
    
    @JavascriptInterface
    public String getUserSession() {
        try {
            JSONObject session = storageManager.getUserSession();
            return session != null ? session.toString() : "null";
        } catch (JSONException e) {
            Log.e(TAG, "Error getting user session for JavaScript", e);
            return "null";
        }
    }
    
    @JavascriptInterface
    public void clearUserSession() {
        storageManager.clearUserSession();
        Log.d(TAG, "Cleared user session from JavaScript");
    }
    
    @JavascriptInterface
    public int getPendingReportsCount() {
        return storageManager.getPendingReportsCount();
    }

    @JavascriptInterface
    public void getCurrentLocation() {
        try {
            if (locationManager != null) {
                if (context.checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    // Try to get location from both GPS and Network providers
                    Location lastKnownLocation = null;
                    
                    // First try GPS
                    if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                        lastKnownLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                    }
                    
                    // If GPS location is not available or too old, try Network
                    if (lastKnownLocation == null || System.currentTimeMillis() - lastKnownLocation.getTime() > 30000) {
                        if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                            Location networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                            if (networkLocation != null) {
                                lastKnownLocation = networkLocation;
                            }
                        }
                    }

                    if (lastKnownLocation != null && System.currentTimeMillis() - lastKnownLocation.getTime() < 30000) {
                        // Location is recent enough, use it
                        JSONObject locationData = new JSONObject();
                        locationData.put("latitude", lastKnownLocation.getLatitude());
                        locationData.put("longitude", lastKnownLocation.getLongitude());
                        locationData.put("accuracy", lastKnownLocation.getAccuracy());
                        locationData.put("timestamp", lastKnownLocation.getTime());
                        
                        String js = String.format(
                            "if (window.onLocationReceived) { window.onLocationReceived(%s); }",
                            locationData.toString()
                        );
                        ((MainActivity) context).runOnUiThread(() -> {
                            ((MainActivity) context).getWebView().evaluateJavascript(js, null);
                        });
                    } else {
                        // Request fresh location updates with optimized parameters
                        locationListener = new LocationListener() {
                            private long startTime = System.currentTimeMillis();
                            private static final long TIMEOUT = 10000; // 10 seconds timeout

                            @Override
                            public void onLocationChanged(Location location) {
                                try {
                                    // Check if we've exceeded the timeout
                                    if (System.currentTimeMillis() - startTime > TIMEOUT) {
                                        locationManager.removeUpdates(this);
                                        handleLocationError("Location request timed out");
                                        return;
                                    }

                                    JSONObject locationData = new JSONObject();
                                    locationData.put("latitude", location.getLatitude());
                                    locationData.put("longitude", location.getLongitude());
                                    locationData.put("accuracy", location.getAccuracy());
                                    locationData.put("timestamp", location.getTime());
                                    
                                    String js = String.format(
                                        "if (window.onLocationReceived) { window.onLocationReceived(%s); }",
                                        locationData.toString()
                                    );
                                    ((MainActivity) context).runOnUiThread(() -> {
                                        ((MainActivity) context).getWebView().evaluateJavascript(js, null);
                                    });
                                    
                                    // Remove updates after getting a good location
                                    locationManager.removeUpdates(this);
                                } catch (JSONException e) {
                                    Log.e(TAG, "Error creating location JSON", e);
                                    handleLocationError("Error creating location data");
                                }
                            }

                            @Override
                            public void onStatusChanged(String provider, int status, Bundle extras) {}

                            @Override
                            public void onProviderEnabled(String provider) {}

                            @Override
                            public void onProviderDisabled(String provider) {
                                handleLocationError("Location provider disabled");
                            }
                        };
                        
                        try {
                            // Request updates from both providers with optimized parameters
                            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                                locationManager.requestLocationUpdates(
                                    LocationManager.GPS_PROVIDER,
                                    1000, // 1 second minimum time
                                    10,   // 10 meters minimum distance
                                    locationListener,
                                    Looper.getMainLooper()
                                );
                            }
                            
                            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                                locationManager.requestLocationUpdates(
                                    LocationManager.NETWORK_PROVIDER,
                                    1000, // 1 second minimum time
                                    10,   // 10 meters minimum distance
                                    locationListener,
                                    Looper.getMainLooper()
                                );
                            }
                            
                            // Set a timeout to remove updates if no location is received
                            new android.os.Handler(Looper.getMainLooper()).postDelayed(() -> {
                                if (locationListener != null) {
                                    locationManager.removeUpdates(locationListener);
                                    handleLocationError("Location request timed out");
                                }
                            }, 10000); // 10 seconds timeout
                            
                        } catch (SecurityException e) {
                            Log.e(TAG, "Error requesting location updates", e);
                            handleLocationError("Location permission denied");
                        }
                    }
                } else {
                    handleLocationError("Location permission not granted");
                }
            } else {
                handleLocationError("Location service not available");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting location", e);
            handleLocationError("Error getting location: " + e.getMessage());
        }
    }

    private void handleLocationError(String message) {
        JSONObject errorData = new JSONObject();
        try {
            errorData.put("code", 2); // POSITION_UNAVAILABLE
            errorData.put("message", message);
            
            String js = String.format(
                "if (window.onLocationError) { window.onLocationError(%s); }",
                errorData.toString()
            );
            ((MainActivity) context).runOnUiThread(() -> {
                ((MainActivity) context).getWebView().evaluateJavascript(js, null);
            });
        } catch (JSONException e) {
            Log.e(TAG, "Error creating error JSON", e);
        }
    }
} 