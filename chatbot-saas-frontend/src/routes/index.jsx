// src/routes/index.js
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signin from "../components/Signin";
import Signup from "../components/Signup";
import Dashboard from "../routes/Dashboard";
import PrivateRoute from "../components/PrivateRoute";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signin", element: <Signin /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
]);
