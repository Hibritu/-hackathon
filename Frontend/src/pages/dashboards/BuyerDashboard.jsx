import { useState, useEffect } from 'react';
import { catchAPI, orderAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiPackage, FiSearch, FiCheck } from 'react-icons/fi';

const BuyerDashboard = () => {
  const [catches, setCatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filters, setFilters] = useState({
    lake: '',
    fishName: '',
    freshness: '',
  });

  useEffect(() => {
    loadCatches();
    loadOrders();
  }, []);

  const loadCatches = async () => {
    try {
      const response = await catchAPI.getAll(filters);
      setCatches(response.data.catches || []);
    } catch (error) {
      toast.error('Failed to load catches');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOrder = async (catchId) => {
    try {
      await orderAPI.create({ catchId, paymentStatus: 'PENDING' });
      toast.success('Order placed successfully!');
      loadOrders();
      loadCatches();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to place order';
      toast.error(message);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    loadCatches();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Buyer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse verified catches and manage your orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fish Name
              </label>
              <input
                type="text"
                name="fishName"
                value={filters.fishName}
                onChange={handleFilterChange}
                placeholder="Search by fish name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lake
              </label>
              <input
                type="text"
                name="lake"
                value={filters.lake}
                onChange={handleFilterChange}
                placeholder="Search by lake"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Freshness
              </label>
              <input
                type="text"
                name="freshness"
                value={filters.freshness}
                onChange={handleFilterChange}
                placeholder="Search by freshness"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Catches */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiPackage className="mr-2" />
                  Available Catches
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : catches.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No verified catches available
                  </p>
                ) : (
                  <div className="space-y-4">
                    {catches.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {item.fishName}
                            </h3>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                          <button
                            onClick={() => handleOrder(item.id)}
                            className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                          >
                            <FiShoppingCart className="mr-2" />
                            Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Orders */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiShoppingCart className="mr-2" />
                  My Orders
                </h2>
              </div>
              <div className="p-6">
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No orders yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.catch.fishName}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              order.paymentStatus === 'COMPLETED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div>ETB {order.catch.price}</div>
                          <div className="mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default BuyerDashboard;




