import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#191c28",
              color: "#f1f5f9",
              border: "1px solid #2a2e40",
              fontSize: "0.875rem",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#191c28" } },
            error: { iconTheme: { primary: "#f43f5e", secondary: "#191c28" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
