import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Fish, Mail, Phone } from 'lucide-react';

const Login = () => {
  const [loginType, setLoginType] = useState('email'); // 'email' or 'phone'
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext toast
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 dark:from-gray-900 to-primary-100 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="card">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Fish className="w-16 h-16 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.welcomeBack')}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t('auth.signIn')}</p>
          </div>

          <div className="mt-8">
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setLoginType('email')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  loginType === 'email'
                    ? 'bg-primary-600 dark:bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </button>
              <button
                onClick={() => setLoginType('phone')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  loginType === 'phone'
                    ? 'bg-primary-600 dark:bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {loginType === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email format',
                      },
                    })}
                    className="input-field"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone is required',
                    })}
                    className="input-field"
                    placeholder="0911222333"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="input-field"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <button type="submit" className="btn-primary w-full">
                {t('auth.signInLink')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                  {t('auth.signUpLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

