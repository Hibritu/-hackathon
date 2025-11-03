import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/fishlink-logo.svg';
import FishIcon from '../assets/fishlink-icon-fish.svg';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiHome, 
  FiLogOut, 
  FiUser, 
  FiMoon, 
  FiSun,
  FiMenu,
  FiX 
} from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'AGENT':
        return '/dashboard/agent';
      case 'FISHER':
        return '/dashboard/fisher';
      case 'BUYER':
        return '/dashboard/buyer';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white/90 dark:bg-gray-800/80 backdrop-blur shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <img src={FishIcon} alt="FishLink" className="h-7 w-7 md:h-8 md:w-8" />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-400 bg-clip-text text-transparent font-extrabold text-xl md:text-2xl tracking-tight">
                FishLink
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/deliveries"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600"
                  >
                    Admin Deliveries
                  </Link>
                )}
                <Link
                  to="/verify"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600"
                >
                  Verify QR
                </Link>
                <Link
                  to="/market"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600"
                >
                  Market
                </Link>
                <Link
                  to="/freshness"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600"
                >
                  Freshness AI
                </Link>
                <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                  <FiUser className="mr-1" />
                  <span>{user.name}</span>
                  <span className="text-xs bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'light' ? <FiMoon /> : <FiSun />}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 flex items-center"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600"
                >
                  <FiHome className="inline mr-1" />
                  Home
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Login
                </Link>
                <Link
                  to="/market"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600"
                >
                  Market
                </Link>
                <Link
                  to="/freshness"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600"
                >
                  Freshness AI
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-primary-600 border border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900"
                >
                  Register
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'light' ? <FiMoon /> : <FiSun />}
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/verify"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Verify QR
                </Link>
                <Link
                  to="/market"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Market
                </Link>
                <Link
                  to="/freshness"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Freshness AI
                </Link>
                <div className="px-3 py-2 text-base text-gray-700 dark:text-gray-200">
                  <span>{user.name} ({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  to="/market"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Market
                </Link>
                <Link
                  to="/freshness"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Freshness AI
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200"
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

