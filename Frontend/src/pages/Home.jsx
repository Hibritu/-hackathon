import { Link } from 'react-router-dom';
import { Fish, Shield, QrCode, Sparkles, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: t('home.features.traceability'),
      description: t('home.features.traceabilityDesc'),
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: t('home.features.aiFreshness'),
      description: t('home.features.aiFreshnessDesc'),
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: t('home.features.easyOrdering'),
      description: t('home.features.easyOrderingDesc'),
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: t('home.features.multiRole'),
      description: t('home.features.multiRoleDesc'),
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center py-20">
        <div className="flex justify-center mb-6">
          <Fish className="w-20 h-20 text-primary-600" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {t('home.welcome')} <span className="text-primary-600 dark:text-primary-400">FishLink</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
        <div className="flex justify-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                {t('home.getStarted')}
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                {t('nav.login')}
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
              {t('nav.dashboard')}
            </Link>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        {features.map((feature, index) => (
          <div key={index} className="card hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
            <p className="text-gray-600 text-center">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-16 grid md:grid-cols-2 gap-6">
        <Link
          to="/verify-qr"
          className="card hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <QrCode className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 dark:text-white">{t('home.quickActions.verifyQR')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('home.quickActions.verifyQRDesc')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/freshness"
          className="card hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Sparkles className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 dark:text-white">{t('home.quickActions.checkFreshness')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('home.quickActions.checkFreshnessDesc')}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;

