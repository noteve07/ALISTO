import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthContextProvider } from "./features/auth/context/AuthContext.jsx";
import { UserLocationProvider } from "./features/auth/context/UserLocationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthContextProvider>
      <UserLocationProvider>
        <App />
      </UserLocationProvider>
    </AuthContextProvider>
  </StrictMode>
);
