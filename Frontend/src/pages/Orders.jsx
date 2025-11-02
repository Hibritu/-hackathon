import { useEffect, useState } from 'react';
import api from '../services/api';
import { ShoppingCart, Package, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'BUYER') {
      fetchMyOrders();
    } else {
      fetchAllOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/order/my-orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/order/all');
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'BUYER' ? 'My Orders' : 'All Orders'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'BUYER'
              ? 'Track your fish orders'
              : 'Manage all orders in the system'}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <ShoppingCart className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                  </div>
                  {order.catch && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Fish:</strong> {order.catch.fishName}</p>
                      <p><strong>Weight:</strong> {order.catch.weight} kg</p>
                      <p><strong>Lake:</strong> {order.catch.lake}</p>
                    </div>
                  )}
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(order.paymentStatus)}`}>
                  {getStatusIcon(order.paymentStatus)}
                  <span className="font-medium text-sm">{order.paymentStatus}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="font-semibold text-primary-600">
                    ETB {order.catch ? parseFloat(order.catch.price).toLocaleString() : 'N/A'}
                  </p>
                </div>
                {order.delivery && (
                  <div>
                    <p className="text-gray-600">Delivery Status</p>
                    <p className="font-semibold">{order.delivery.status}</p>
                  </div>
                )}
              </div>

              {order.paymentStatus === 'PENDING' && user?.role === 'BUYER' && (
                <button className="btn-primary text-sm">
                  Complete Payment
                </button>
              )}

              {order.delivery && (
                <Link
                  to={`/deliveries?orderId=${order.id}`}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Track Delivery</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

