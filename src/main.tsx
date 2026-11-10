import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      defaultTheme={
        new URLSearchParams(window.location.search).get("theme") === "light"
          ? "light"
          : "dark"
      }
      storageKey={
        new URLSearchParams(window.location.search).has("embed")
          ? "arc-embed-theme"
          : "arc-theme"
      }
    >
      <App />
    </ThemeProvider>
  </StrictMode>
)
