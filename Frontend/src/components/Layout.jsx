import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, 
  Fish, 
  ShoppingCart, 
  Package, 
  QrCode, 
  Sparkles,
  LogOut, 
  Menu,
  X,
  User,
  Shield,
  UserCheck,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'AGENT':
        return <UserCheck className="w-4 h-4" />;
      case 'FISHER':
        return <Fish className="w-4 h-4" />;
      case 'BUYER':
        return <ShoppingCart className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const navItems = isAuthenticated
    ? [
        { path: '/dashboard', translationKey: 'nav.dashboard', icon: Home },
        ...(user?.role === 'FISHER' ? [{ path: '/my-catches', translationKey: 'nav.myCatches', icon: Fish }] : []),
        { path: '/catches', translationKey: 'nav.browseCatches', icon: Fish },
        ...(user?.role === 'BUYER' ? [{ path: '/orders', translationKey: 'nav.myOrders', icon: ShoppingCart }] : []),
        { path: '/deliveries', translationKey: 'nav.deliveries', icon: Package },
        ...(user?.role === 'ADMIN' ? [{ path: '/admin', translationKey: 'nav.admin', icon: Shield }] : []),
        ...(user?.role === 'AGENT' || user?.role === 'ADMIN' ? [{ path: '/agent', translationKey: 'nav.agent', icon: UserCheck }] : []),
        { path: '/verify-qr', translationKey: 'nav.verifyQR', icon: QrCode },
        { path: '/freshness', translationKey: 'nav.freshnessAI', icon: Sparkles },
      ]
    : [
        { path: '/', translationKey: 'nav.home', icon: Home },
        { path: '/verify-qr', translationKey: 'nav.verifyQR', icon: QrCode },
        { path: '/freshness', translationKey: 'nav.freshnessAI', icon: Sparkles },
      ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Fish className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">FishLink</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{t(item.translationKey || `nav.${item.path.replace('/', '') || 'home'}`)}</span>
                </Link>
              ))}
              
              {/* Theme and Language Toggles */}
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={theme === 'light' ? t('theme.dark') : t('theme.light')}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={language === 'en' ? t('lang.amharic') : t('lang.english')}
                >
                  <Languages className="w-5 h-5" />
                </button>
              </div>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
                  <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    {getRoleIcon(user?.role)}
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({user?.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Languages className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{t(item.translationKey || `nav.${item.path.replace('/', '') || 'home'}`)}</span>
                </Link>
              ))}
              
              {isAuthenticated && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {getRoleIcon(user?.role)}
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({user?.role})</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

