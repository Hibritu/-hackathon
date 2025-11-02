import { useState, useEffect } from 'react';
import { catchAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiUsers, FiPackage, FiUserPlus } from 'react-icons/fi';

const AgentDashboard = () => {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFisherForm, setShowFisherForm] = useState(false);
  const [fisherForm, setFisherForm] = useState({
    name: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    loadCatches();
  }, []);

  const loadCatches = async () => {
    try {
      const response = await catchAPI.getAllForAdmin();
      setCatches(response.data.catches || []);
    } catch (error) {
      toast.error('Failed to load catches');
    } finally {
      setLoading(false);
    }
  };

  // Verification is ADMIN-only. Agent dashboard no longer exposes verify actions.

  const handleRegisterFisher = async (e) => {
    e.preventDefault();
    try {
      await userAPI.registerFisher(fisherForm);
      toast.success('Fisher registered successfully!');
      setShowFisherForm(false);
      setFisherForm({ name: '', phone: '', password: '' });
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to register fisher';
      toast.error(message);
    }
  };

  const unverifiedCatches = catches.filter((c) => !c.verified);
  const verifiedCatches = catches.filter((c) => c.verified);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Agent Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View catches and manage fishers
            </p>
          </div>
          <button
            onClick={() => setShowFisherForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
          >
            <FiUserPlus className="mr-2" />
            Register Fisher
          </button>
        </div>

        {/* Register Fisher Form */}
        {showFisherForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Register New Fisher
            </h2>
            <form onSubmit={handleRegisterFisher} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fisherForm.name}
                    onChange={(e) => setFisherForm({ ...fisherForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={fisherForm.phone}
                    onChange={(e) => setFisherForm({ ...fisherForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={fisherForm.password}
                    onChange={(e) => setFisherForm({ ...fisherForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFisherForm(false);
                    setFisherForm({ name: '', phone: '', password: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Register Fisher
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FiPackage className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{unverifiedCatches.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified Catches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{verifiedCatches.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Catches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{catches.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FiXCircle className="mr-2 text-yellow-600" />
              Pending Verification
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : unverifiedCatches.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No pending verifications
              </p>
            ) : (
              <div className="space-y-4">
                {unverifiedCatches.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {item.fishName}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Weight:</span> {item.weight} kg
                          </div>
                          <div>
                            <span className="font-medium">Price:</span> ETB {item.price}
                          </div>
                          <div>
                            <span className="font-medium">Freshness:</span> {item.freshness}
                          </div>
                          <div>
                            <span className="font-medium">Lake:</span> {item.lake}
                          </div>
                        </div>
                        {item.fisher && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Fisher:</span> {item.fisher.name} - {item.fisher.phone}
                          </div>
                        )}
                      </div>
                      {/* Verification actions removed for agents */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verified Catches */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FiCheckCircle className="mr-2 text-green-600" />
              Verified Catches
            </h2>
          </div>
          <div className="p-6">
            {verifiedCatches.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No verified catches yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedCatches.map((item) => (
                  <div
                    key={item.id}
                    className="border border-green-200 dark:border-green-800 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.fishName}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                        Verified
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Weight:</span> {item.weight} kg
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ETB {item.price}
                      </div>
                      <div>
                        <span className="font-medium">Lake:</span> {item.lake}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;






