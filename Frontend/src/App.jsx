import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import QRVerify from './pages/QRVerify';
import Freshness from './pages/Freshness';
import PaymentSuccess from './pages/PaymentSuccess';
import Market from './pages/Market';
import AdminDeliveries from './pages/admin/AdminDeliveries';
import AdminIncome from './pages/admin/AdminIncome';

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AgentDashboard from './pages/dashboards/AgentDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import FisherDashboard from './pages/dashboards/FisherDashboard';
import FisherEarnings from './pages/dashboards/FisherEarnings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/verify" element={<QRVerify />} />
                <Route path="/freshness" element={<Freshness />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/market" element={<Market />} />

                {/* Admin Dashboard */}
                <Route
                  path="/dashboard/admin"
                  element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />

                {/* Admin: Deliveries */}
                <Route
                  path="/admin/deliveries"
                  element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                      <AdminDeliveries />
                    </PrivateRoute>
                  }
                />

                {/* Admin: Income */}
                <Route
                  path="/dashboard/admin/income"
                  element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                      <AdminIncome />
                    </PrivateRoute>
                  }
                />

                {/* Agent Dashboard */}
                <Route
                  path="/dashboard/agent"
                  element={
                    <PrivateRoute allowedRoles={['AGENT']}>
                      <AgentDashboard />
                    </PrivateRoute>
                  }
                />

                {/* Buyer Dashboard */}
                <Route
                  path="/dashboard/buyer"
                  element={
                    <PrivateRoute allowedRoles={['BUYER']}>
                      <BuyerDashboard />
                    </PrivateRoute>
                  }
                />

                {/* Fisher Dashboard */}
                <Route
                  path="/dashboard/fisher"
                  element={
                    <PrivateRoute allowedRoles={['FISHER']}>
                      <FisherDashboard />
                    </PrivateRoute>
                  }
                />
                {/* Fisher: Earnings */}
                <Route
                  path="/dashboard/fisher/earnings"
                  element={
                    <PrivateRoute allowedRoles={['FISHER']}>
                      <FisherEarnings />
                    </PrivateRoute>
                  }
                />

                {/* Unauthorized */}
                <Route
                  path="/unauthorized"
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          Access Denied
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          You don't have permission to access this page.
                        </p>
                        <Navigate to="/" replace />
                      </div>
                    </div>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;




