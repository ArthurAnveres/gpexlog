import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useApp } from './context/AppContext'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { BillingPage } from './pages/BillingPage'
import { DashboardPage } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { MapsPage } from './pages/MapsPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProofsPage } from './pages/ProofsPage'
import { ShipmentsPage } from './pages/ShipmentsPage'
import { SignupPage } from './pages/SignupPage'

function ProtectedRoute() {
  const { isAuthenticated } = useApp()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="shipments" element={<ShipmentsPage />} />
          <Route path="maps" element={<MapsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="proofs" element={<ProofsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
