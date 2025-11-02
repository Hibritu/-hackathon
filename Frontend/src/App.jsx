import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import Catches from './pages/Catches';
import MyCatches from './pages/MyCatches';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import VerifyQR from './pages/VerifyQR';
import FreshnessDetector from './pages/FreshnessDetector';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-qr" element={<Layout><VerifyQR /></Layout>} />
          <Route path="/freshness" element={<Layout><FreshnessDetector /></Layout>} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout><Dashboard /></Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/catches"
            element={
              <PrivateRoute>
                <Layout><Catches /></Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/my-catches"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={['FISHER']}>
                  <Layout><MyCatches /></Layout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Layout><Orders /></Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/deliveries"
            element={
              <PrivateRoute>
                <Layout><Deliveries /></Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={['ADMIN']}>
                  <Layout><AdminDashboard /></Layout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/agent"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={['AGENT', 'ADMIN']}>
                  <Layout><AgentDashboard /></Layout>
                </RoleRoute>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
