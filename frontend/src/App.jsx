import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Investments from './pages/Investments';
import Transactions from './pages/Transactions';
import FinanceDashboard from './pages/FinanceDashboard';
import LandingPage from './pages/LandingPage';
import OfficerDashboard from './pages/OfficerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes - No login required */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes - Login required */}
        <Route element={<ProtectedRoute />}>
          {/* Customer Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/finance" element={<FinanceDashboard />} />

          {/* Officer Routes */}
          <Route path="/officer" element={<OfficerDashboard />} />
        </Route>

        {/* Fallback - redirect to public home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
