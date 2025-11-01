import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Fish, UserPlus, Mail } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Register = () => {
  const [step, setStep] = useState(1) // 1: Email & Details, 2: OTP Verification
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [role, setRole] = useState('BUYER')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')

  useEffect(() => {
    if (roleParam) {
      setRole(roleParam.toUpperCase())
    }
  }, [roleParam])

  useEffect(() => {
    if (user) {
      const userRole = user.role.toLowerCase()
      navigate(`/${userRole === 'fisher' ? 'fisher' : userRole === 'agent' ? 'agent' : userRole === 'admin' ? 'admin' : 'buyer'}`)
    }
  }, [user, navigate])

  const handleSendOTP = async (e) => {
    e.preventDefault()

    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/auth/send-otp', { email, name })
      toast.success(response.data.message)
      setStep(2)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        phone: phone || null,
        password,
        role,
        otp
      })

      const { user: newUser, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success('Registration successful!')
      
      const userRole = newUser.role.toLowerCase()
      navigate(`/${userRole === 'fisher' ? 'fisher' : userRole === 'agent' ? 'agent' : userRole === 'admin' ? 'admin' : 'buyer'}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-aqua-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Fish className="w-16 h-16 mx-auto text-primary-600 dark:text-aqua-400 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join FishLink
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create your account to get started
          </p>
        </div>

        <div className="card">
          {/* Step Indicator */}
          <div className="flex justify-between mb-6">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-primary-600 dark:text-aqua-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 dark:bg-aqua-400 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <p className="text-xs mt-1">Details</p>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-primary-600 dark:text-aqua-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 dark:bg-aqua-400 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <p className="text-xs mt-1">Verify OTP</p>
            </div>
          </div>

          {/* Step 1: Registration Details */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="+251 9XX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                >
                  <option value="BUYER">Buyer</option>
                  <option value="FISHER">Fisher</option>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send OTP to Email</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter OTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full text-sm text-primary-600 dark:text-aqua-400 hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-aqua-400 font-medium hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
