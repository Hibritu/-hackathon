import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import FisherDashboard from './pages/FisherDashboard'
import AgentDashboard from './pages/AgentDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import AdminPanel from './pages/AdminPanel'
import QRVerify from './pages/QRVerify'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<QRVerify />} />
                
                <Route 
                  path="/fisher" 
                  element={
                    <PrivateRoute>
                      <FisherDashboard />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/agent" 
                  element={
                    <PrivateRoute>
                      <AgentDashboard />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/buyer" 
                  element={
                    <PrivateRoute>
                      <BuyerDashboard />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute>
                      <AdminPanel />
                    </PrivateRoute>
                  } 
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

