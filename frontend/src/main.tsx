// import { Ion } from "cesium";
// Ion.defaultAccessToken = ""; // Leave blank unless you have a token
(window as any).CESIUM_BASE_URL = "/cesium";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";

createRoot(document.getElementById("root")!).render(<App />);
