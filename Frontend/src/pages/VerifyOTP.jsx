import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, sendOTP } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [name, setName] = useState(location.state?.name || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await verifyOTP(email, otp);
    setLoading(false);

    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      switch (role) {
        case 'ADMIN':
          navigate('/dashboard/admin');
          break;
        case 'AGENT':
          navigate('/dashboard/agent');
          break;
        case 'FISHER':
          navigate('/dashboard/fisher');
          break;
        case 'BUYER':
          navigate('/dashboard/buyer');
          break;
        default:
          navigate('/');
      }
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    await sendOTP(email, name);
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification code to <br />
            <span className="font-medium text-primary-600">{email}</span>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">
              OTP Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength="6"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-2xl tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <FiMail className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
            >
              {resending ? 'Sending...' : "Didn't receive code? Resend"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
            >
              <FiArrowLeft className="mr-1" />
              Back to registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;

