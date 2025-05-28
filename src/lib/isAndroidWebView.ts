export function isAndroidWebView() {
  return (
    typeof navigator !== "undefined" &&
    /wv/.test(navigator.userAgent) &&
    /Android/.test(navigator.userAgent)
  );
} 