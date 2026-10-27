import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/auth/pages/DashboardPage";
import CreateOrderPage from "../features/orders/pages/CreateOrderPage";
import OrderDetailsPage from "../features/orders/pages/OrderDetailsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />

            <Route element={<RoleRoute allowedRoles={["COURIER"]} />}>
              <Route
                path="/courier"
                element={<DashboardPage />}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
              <Route
                path="/admin"
                element={<DashboardPage />}
              />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}