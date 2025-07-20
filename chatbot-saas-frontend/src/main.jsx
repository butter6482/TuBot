import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { router } from "./routes/index.jsx";
import "./index.css"; // o el nombre correcto de tu archivo de estilos


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  </React.StrictMode>
);
