import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Fish, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    catches: 0,
    orders: 0,
    deliveries: 0,
    verified: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'FISHER') {
        const catchesRes = await api.get('/api/catch/my-catches');
        const catches = catchesRes.data.catches || [];
        setStats({
          catches: catches.length,
          verified: catches.filter(c => c.verified).length,
          orders: 0,
          deliveries: 0,
        });
      } else if (user?.role === 'BUYER') {
        const ordersRes = await api.get('/api/order/my-orders');
        const orders = ordersRes.data.orders || [];
        setStats({
          catches: 0,
          orders: orders.length,
          deliveries: orders.filter(o => o.delivery).length,
          verified: 0,
        });
      } else {
        // For other roles, get general stats
        const catchesRes = await api.get('/api/catch');
        const catches = catchesRes.data.catches || [];
        setStats({
          catches: catches.length,
          verified: catches.filter(c => c.verified).length,
          orders: 0,
          deliveries: 0,
        });
      }
    } catch (error) {
      toast.error(t('common.loading') + '...');
    } finally {
      setLoading(false);
    }
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'FISHER':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">{t('dashboard.quickActions')}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/my-catches" className="btn-primary flex items-center justify-center space-x-2">
                  <Fish className="w-5 h-5" />
                  <span>{t('dashboard.viewMyCatches')}</span>
                </Link>
                <Link to="/my-catches" className="btn-secondary flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>{t('dashboard.addNewCatch')}</span>
                </Link>
              </div>
            </div>
          </div>
        );
      
      case 'BUYER':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">{t('dashboard.quickActions')}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/catches" className="btn-primary flex items-center justify-center space-x-2">
                  <Fish className="w-5 h-5" />
                  <span>{t('dashboard.browseCatches')}</span>
                </Link>
                <Link to="/orders" className="btn-secondary flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>{t('dashboard.myOrders')}</span>
                </Link>
              </div>
            </div>
          </div>
        );
      
      case 'AGENT':
      case 'ADMIN':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">{t('dashboard.quickActions')}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/agent" className="btn-primary flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>{t('dashboard.verifyCatches')}</span>
                </Link>
                <Link to="/deliveries" className="btn-secondary flex items-center justify-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>{t('dashboard.manageDeliveries')}</span>
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="btn-secondary flex items-center justify-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>{t('dashboard.adminPanel')}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.dashboard')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{t('dashboard.welcome')}, {user?.name}!</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full font-medium">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'FISHER' && (
          <>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.totalCatches')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.catches}</p>
                </div>
                <Fish className="w-12 h-12 text-primary-600 opacity-50" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.verified')}</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.verified}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </div>
          </>
        )}

        {user?.role === 'BUYER' && (
          <>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.myOrders')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.orders}</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-primary-600 opacity-50" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.deliveries')}</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.deliveries}</p>
                </div>
                <Package className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </div>
          </>
        )}

        {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (
          <>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.totalCatches')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.catches}</p>
                </div>
                <Fish className="w-12 h-12 text-primary-600 opacity-50" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.verified')}</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.verified}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Role-specific content */}
      {getRoleSpecificContent()}

      {/* General Tools */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/verify-qr" className="card hover:shadow-xl transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <QrCode className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1 dark:text-white">{t('verifyQR.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{t('verifyQR.authentic')}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
          </div>
        </Link>

        <Link to="/freshness" className="card hover:shadow-xl transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1 dark:text-white">{t('freshness.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{t('freshness.subtitle')}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

