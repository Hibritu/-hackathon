import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { catchAPI, orderAPI, orderPaymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Market = () => {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  // Inline CTA buttons; no modals
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [filters, setFilters] = useState({
    lake: '',
    fishName: '',
    freshness: '',
    nationalId: '',
  });

  const load = async () => {
    try {
      const res = await catchAPI.getAll(filters);
      setCatches(res.data.catches || []);
    } catch (e) {
      toast.error('Failed to load catches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const onFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOrder = async (catchId) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (user?.role !== 'BUYER') {
      toast.error('Only buyers can place orders');
      return;
    }
    try {
      await orderAPI.create({ catchId, paymentStatus: 'PENDING' });
      toast.success('Order placed');
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to place order';
      toast.error(msg);
    }
  };

  const handleOrderAndPay = async (catchId) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (user?.role !== 'BUYER') {
      toast.error('Only buyers can place orders');
      return;
    }
    try {
      const res = await orderPaymentAPI.createAndPay({ catchId });
      const url = res.data?.payment?.checkout_url;
      if (url) window.open(url, '_blank');
      toast.success('Redirecting to payment...');
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to start payment';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Market</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse verified catches. No login required.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fish Name</label>
              <input name="fishName" value={filters.fishName} onChange={onFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lake</label>
              <input name="lake" value={filters.lake} onChange={onFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Freshness</label>
              <input name="freshness" value={filters.freshness} onChange={onFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">National ID</label>
              <input name="nationalId" value={filters.nationalId} onChange={onFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FiPackage className="mr-2" />
              Verified Catches
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : catches.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No catches found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catches.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.fishName}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">Verified</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div><span className="font-medium">Weight:</span> {item.weight} kg</div>
                      <div><span className="font-medium">Price:</span> ETB {item.price}</div>
                      <div><span className="font-medium">Freshness:</span> {item.freshness}</div>
                      <div><span className="font-medium">Lake:</span> {item.lake}</div>
                    </div>
                    {item.fisher && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Fisher:</span> {item.fisher.name} - {item.fisher.phone}
                      </div>
                    )}
                    <div className="mt-4 flex space-x-2">
                      {isAuthenticated && user?.role === 'BUYER' ? (
                        <>
                          <button onClick={() => handleOrder(item.id)} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Order</button>
                          <button onClick={() => handleOrderAndPay(item.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Order & Pay</button>
                        </>
                      ) : (
                        <button onClick={() => navigate('/register')} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Order & Pay</button>
                      )}
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

export default Market;
