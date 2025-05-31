package com.elephantwatch.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.util.Log;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.content.Context;
import android.content.IntentFilter;
import android.net.ConnectivityManager.NetworkCallback;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private static final int PERMISSION_REQUEST_CODE = 100;
    private WebView webView;
    private PermissionRequest permissionRequest;
    private static final String TAG = "MainActivity";
    private ConnectivityManager connectivityManager;
    private NetworkCallback networkCallback;
    private boolean isOnline = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        webView = findViewById(R.id.webview);
        setupWebView();
        checkAndRequestPermissions();
        setupNetworkCallback();
    }

    private void setupNetworkCallback() {
        connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        
        networkCallback = new NetworkCallback() {
            @Override
            public void onAvailable(Network network) {
                isOnline = true;
                runOnUiThread(() -> {
                    webView.evaluateJavascript(
                        "window.dispatchEvent(new Event('online'))",
                        null
                    );
                });
            }

            @Override
            public void onLost(Network network) {
                isOnline = false;
                runOnUiThread(() -> {
                    webView.evaluateJavascript(
                        "window.dispatchEvent(new Event('offline'))",
                        null
                    );
                });
            }
        };

        NetworkRequest networkRequest = new NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build();

        connectivityManager.registerNetworkCallback(networkRequest, networkCallback);
    }

    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setDatabaseEnabled(true);
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        
        // Add JavaScript interface
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
        
        // Enable hardware acceleration
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

        // Clear cache and data on startup
        webView.clearCache(true);
        webView.clearHistory();
        webView.clearFormData();
        webView.clearSslPreferences();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Log.d(TAG, "Loading URL: " + url);
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView error: " + description + " (Error code: " + errorCode + ")");
                Log.e(TAG, "Failed URL: " + failingUrl);
                super.onReceivedError(view, errorCode, description, failingUrl);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d(TAG, "Page finished loading: " + url);
                // Inject offline handling JavaScript
                String js = "window.onerror = function(msg, url, line) {" +
                           "  console.error('JavaScript Error: ' + msg + ' at ' + url + ':' + line);" +
                           "  return false;" +
                           "};" +
                           "window.addEventListener('online', function() {" +
                           "  window.dispatchEvent(new CustomEvent('syncPendingReports'));" +
                           "});" +
                           "window.addEventListener('offline', function() {" +
                           "  window.dispatchEvent(new CustomEvent('handleOffline'));" +
                           "});" +
                           // Add offline storage functions
                           "window.offlineStorage = {" +
                           "  savePendingReport: function(report) {" +
                           "    Android.savePendingReport(JSON.stringify(report));" +
                           "  }," +
                           "  getPendingReports: function() {" +
                           "    return JSON.parse(Android.getPendingReports());" +
                           "  }," +
                           "  removePendingReport: function(index) {" +
                           "    Android.removePendingReport(index);" +
                           "  }," +
                           "  saveUserSession: function(session) {" +
                           "    Android.saveUserSession(JSON.stringify(session));" +
                           "  }," +
                           "  getUserSession: function() {" +
                           "    const session = Android.getUserSession();" +
                           "    return session === 'null' ? null : JSON.parse(session);" +
                           "  }," +
                           "  clearUserSession: function() {" +
                           "    Android.clearUserSession();" +
                           "  }," +
                           "  getPendingReportsCount: function() {" +
                           "    return Android.getPendingReportsCount();" +
                           "  }" +
                           "};" +
                           // Override navigator.geolocation
                           "navigator.geolocation.getCurrentPosition = function(success, error, options) {" +
                           "  Android.getCurrentLocation();" +
                           "  window.onLocationReceived = function(location) {" +
                           "    success({" +
                           "      coords: {" +
                           "        latitude: location.latitude," +
                           "        longitude: location.longitude," +
                           "        accuracy: location.accuracy," +
                           "        altitude: null," +
                           "        altitudeAccuracy: null," +
                           "        heading: null," +
                           "        speed: null" +
                           "      }," +
                           "      timestamp: location.timestamp" +
                           "    });" +
                           "  };" +
                           "  window.onLocationError = function(error) {" +
                           "    error({" +
                           "      code: error.code," +
                           "      message: error.message" +
                           "    });" +
                           "  };" +
                           "};";
                view.evaluateJavascript(js, null);
                super.onPageFinished(view, url);
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                Log.d(TAG, "Page started loading: " + url);
                super.onPageStarted(view, url, favicon);
            }
        });
        
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                permissionRequest = request;
                String[] requestedResources = request.getResources();
                for (String r : requestedResources) {
                    if (r.equals(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {
                        if (ContextCompat.checkSelfPermission(MainActivity.this, 
                            Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                            request.grant(requestedResources);
                        } else {
                            ActivityCompat.requestPermissions(MainActivity.this,
                                new String[]{Manifest.permission.CAMERA},
                                PERMISSION_REQUEST_CODE);
                        }
                    }
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, 
                GeolocationPermissions.Callback callback) {
                if (ContextCompat.checkSelfPermission(MainActivity.this,
                    Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    ActivityCompat.requestPermissions(MainActivity.this,
                        new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                        PERMISSION_REQUEST_CODE);
                }
            }

            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage consoleMessage) {
                Log.d(TAG, String.format("WebView console: [%s:%d] %s", 
                    consoleMessage.sourceId(), 
                    consoleMessage.lineNumber(), 
                    consoleMessage.message()));
                return true;
            }

            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                Log.d(TAG, "Loading progress: " + newProgress + "%");
                super.onProgressChanged(view, newProgress);
            }
        });

        // Load from local dev server in debug mode, otherwise from assets
        boolean isDebug = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        if (isDebug) {
            // Use 10.0.2.2 to access host machine's localhost from Android emulator
            // For physical device, use your computer's local network IP
            webView.loadUrl("http://10.0.2.2:8080");
        } else {
            webView.loadUrl("file:///android_asset/index.html");
        }
    }

    private void checkAndRequestPermissions() {
        String[] permissions = {
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.INTERNET,
            Manifest.permission.ACCESS_NETWORK_STATE
        };

        List<String> permissionsToRequest = new ArrayList<>();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) 
                != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission);
            }
        }

        if (!permissionsToRequest.isEmpty()) {
            ActivityCompat.requestPermissions(this,
                permissionsToRequest.toArray(new String[0]),
                PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, 
        int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (permissionRequest != null) {
                boolean allGranted = true;
                for (int result : grantResults) {
                    if (result != PackageManager.PERMISSION_GRANTED) {
                        allGranted = false;
                        break;
                    }
                }
                if (allGranted) {
                    permissionRequest.grant(permissionRequest.getResources());
                } else {
                    permissionRequest.deny();
                }
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (connectivityManager != null && networkCallback != null) {
            connectivityManager.unregisterNetworkCallback(networkCallback);
        }
    }

    public WebView getWebView() {
        return webView;
    }
} 