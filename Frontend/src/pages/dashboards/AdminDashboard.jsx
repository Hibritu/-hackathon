import { useState, useEffect } from 'react';
import { catchAPI, orderAPI, deliveryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiPackage, 
  FiShoppingCart, 
  FiTruck, 
  FiCheckCircle,
  FiDollarSign,
  FiTrendingUp 
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCatches: 0,
    verifiedCatches: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catches, setCatches] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catchesRes, ordersRes, deliveriesRes] = await Promise.all([
        catchAPI.getAllForAdmin(),
        orderAPI.getAll(),
        deliveryAPI.getAll(),
      ]);

      const catches = catchesRes.data.catches || [];
      setCatches(catches);
      const allOrders = ordersRes.data.orders || [];
      const deliveries = deliveriesRes.data.deliveries || [];

      setStats({
        totalCatches: catches.length,
        verifiedCatches: catches.filter((c) => c.verified).length,
        totalOrders: allOrders.length,
        completedOrders: allOrders.filter((o) => o.paymentStatus === 'COMPLETED').length,
        pendingDeliveries: deliveries.filter((d) => d.status === 'PENDING' || d.status === 'PICKED' || d.status === 'IN_TRANSIT').length,
        completedDeliveries: deliveries.filter((d) => d.status === 'DELIVERED').length,
      });

      setOrders(allOrders.slice(0, 10));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleVerify = async (id, verified) => {
    try {
      await catchAPI.verify(id, { verified });
      toast.success(verified ? 'Catch verified!' : 'Verification removed');
      loadData();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update verification';
      toast.error(message);
    }
  };

  const unverifiedCatches = catches.filter((c) => !c.verified);
  const verifiedCatches = catches.filter((c) => c.verified);

  const handleUpdatePayment = async (orderId, status) => {
    try {
      await orderAPI.updatePayment(orderId, { paymentStatus: status });
      toast.success('Payment status updated');
      loadData();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update payment';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of the entire FishLink system
          </p>
        </div>

        {/* Pending Verification */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              Pending Verification
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : unverifiedCatches.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending verifications</p>
            ) : (
              <div className="space-y-4">
                {unverifiedCatches.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.fishName}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button onClick={() => handleVerify(item.id, true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Verify</button>
                        <button onClick={() => handleVerify(item.id, false)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verified Catches */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Verified Catches</h2>
          </div>
          <div className="p-6">
            {verifiedCatches.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No verified catches yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedCatches.map((item) => (
                  <div key={item.id} className="border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.fishName}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">Verified</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div><span className="font-medium">Weight:</span> {item.weight} kg</div>
                      <div><span className="font-medium">Price:</span> ETB {item.price}</div>
                      <div><span className="font-medium">Lake:</span> {item.lake}</div>
                    </div>
                    <div className="mt-3">
                      <button onClick={() => handleVerify(item.id, false)} className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700">Unverify</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Catches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCatches}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.verifiedCatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FiTruck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedDeliveries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FiShoppingCart className="mr-2" />
              Recent Orders
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No orders yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fish
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Buyer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {order.catch.fishName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {order.buyer?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ETB {order.catch.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.paymentStatus === 'COMPLETED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {order.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handleUpdatePayment(order.id, 'COMPLETED')}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;






