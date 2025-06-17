export function isAndroid() {
  return (
    typeof navigator !== "undefined" &&
    /Android/.test(navigator.userAgent)
  );
} 