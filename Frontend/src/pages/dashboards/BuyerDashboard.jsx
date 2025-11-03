import { useState, useEffect } from 'react';
import { catchAPI, orderAPI, orderPaymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiPackage, FiSearch, FiCheck } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

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
      const response = await catchAPI.getAvailable(filters);
      setCatches(response.data.catches || []);
    } catch (error) {
      toast.error('Failed to load catches');
    } finally {
      setLoading(false);
    }
  };

  const refPricePerKg = (name) => {
    const key = (name || '').toLowerCase();
    const table = {
      tilapia: 180,
      nile_tilapia: 180,
      catfish: 160,
      nile_perch: 220,
      perch: 200,
      carp: 150,
      trout: 260,
      tuna: 300,
      sardine: 120,
    };
    if (table[key] != null) return table[key];
    if (key.includes('tilapia')) return 180;
    if (key.includes('catfish')) return 160;
    if (key.includes('perch')) return 200;
    return null;
  };

  const handlePayNow = async (orderId) => {
    try {
      const res = await orderPaymentAPI.pay(orderId);
      const url = res.data?.payment?.checkout_url;
      if (url) {
        window.open(url, '_blank');
      }
      toast.success('Redirecting to payment...');
      loadOrders();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Your order is no longer available');
        loadOrders();
        loadCatches();
      } else {
        const message = error.response?.data?.error || 'Failed to initialize payment';
        toast.error(message);
      }
    }
  };

  const handleOrderAndPay = async (catchId) => {
    try {
      const res = await orderPaymentAPI.createAndPay({ catchId });
      const checkout = res.data?.payment?.checkout_url;
      if (checkout) {
        window.open(checkout, '_blank');
      }
      toast.success('Order created. Redirecting to payment...');
      loadOrders();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to start payment';
      toast.error(message);
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

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
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
                  <div className="space-y-8">
                    {['Fresh','Processed','Frozen','Dried','Wasted'].map((cat) => {
                      const items = catches.filter(c => (c.freshness || '').toLowerCase() === cat.toLowerCase());
                      if (!items.length) return null;
                      return (
                        <div key={cat}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{cat}</h3>
                          <div className="space-y-4">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {item.fishName}
                                      </h3>
                                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded text-xs">Posted {timeAgo(item.createdAt)}</span>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <div>
                                        <span className="font-medium">Weight:</span> {item.weight} kg
                                      </div>
                                      <div>
                                        <span className="font-medium">Price:</span> ETB {item.effectivePrice != null ? item.effectivePrice : item.price}
                                        {item.discountApplied && (
                                          <span className="ml-2 text-xs text-emerald-700 dark:text-emerald-300">(2% freshness discount)</span>
                                        )}
                                      </div>
                                      {refPricePerKg(item.fishName) != null && (
                                        <div className="text-xs text-gray-500">
                                          <span className="font-medium">Reference:</span> ETB {refPricePerKg(item.fishName)} / kg • Est: ETB {(refPricePerKg(item.fishName) * (Number(item.weight)||0)).toFixed(2)}
                                        </div>
                                      )}
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
                                    {item.qrEncrypted && (
                                      <div className="mt-3 flex justify-center">
                                        <QRCodeSVG value={item.qrEncrypted} size={96} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4 flex space-x-2">
                                    <button
                                      onClick={() => handleOrder(item.id)}
                                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                                    >
                                      <FiShoppingCart className="mr-2" />
                                      Order
                                    </button>
                                    <button
                                      onClick={() => handleOrderAndPay(item.id)}
                                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
                                    >
                                      <FiCheck className="mr-2" />
                                      Order & Pay
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orders: Pending and History */}
          <div className="space-y-6">
            {/* Pending Payments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiShoppingCart className="mr-2" />
                  Pending Payments
                </h2>
              </div>
              <div className="p-6">
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : (() => {
                  const pending = orders.filter((o) => o.paymentStatus !== 'COMPLETED');
                  return pending.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending payments</p>
                  ) : (
                    <div className="space-y-4">
                      {pending.map((order) => (
                        <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{order.catch.fishName}</span>
                            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{order.paymentStatus}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>ETB {order.catch.price}</div>
                            <div className="mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="mt-3">
                            <button onClick={() => handlePayNow(order.id)} className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm">Pay now</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Purchase History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiShoppingCart className="mr-2" />
                  Purchase History
                </h2>
              </div>
              <div className="p-6">
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : (() => {
                  const completed = orders.filter((o) => o.paymentStatus === 'COMPLETED');
                  return completed.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No completed purchases yet</p>
                  ) : (
                    <div className="space-y-4">
                      {completed.map((order) => (
                        <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{order.catch.fishName}</span>
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{order.paymentStatus}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>ETB {order.catch.price}</div>
                            <div className="mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;







