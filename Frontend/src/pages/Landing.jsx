import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiShield, 
  FiCheckCircle, 
  FiPackage, 
  FiTrendingUp,
  FiUsers,
  FiAnchor 
} from 'react-icons/fi';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiShield className="w-8 h-8" />,
      title: 'Verified Quality',
      description: 'All catches are verified by agents to ensure authenticity and quality.',
    },
    {
      icon: <FiCheckCircle className="w-8 h-8" />,
      title: 'QR Code Tracking',
      description: 'Track fish from catch to delivery with secure QR code verification.',
    },
    {
      icon: <FiPackage className="w-8 h-8" />,
      title: 'Fresh Delivery',
      description: 'Get fresh fish delivered directly from verified fishers.',
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Transparent Supply Chain',
      description: 'Complete visibility into the fish supply chain for buyers.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <FiAnchor className="w-16 h-16 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-primary-600">FishLink</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Fresh Fish Trace Management System - Ensuring transparency, quality, and trust 
            in every catch from lake to table.
          </p>
          <div className="flex justify-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-gray-700 transition"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/verify"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Verify QR Code
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose FishLink?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <div className="text-primary-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                1. Fisher Registers Catch
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fishers register their catch with details like fish type, weight, price, and location.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                2. Agent Verifies
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Agents verify the catch quality and authenticity, generating a QR code for traceability.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                3. Buyer Orders
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Buyers browse verified catches, place orders, and track delivery with QR verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Join FishLink today and experience transparent fish traceability.
        </p>
        {!isAuthenticated && (
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Create Account
          </Link>
        )}
      </div>
    </div>
  );
};

export default Landing;