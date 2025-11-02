import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Package, MapPin, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Deliveries = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchDeliveryByOrder(orderId);
    } else if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
      fetchAllDeliveries();
    } else {
      fetchMyDeliveries();
    }
  }, [user, orderId]);

  const fetchAllDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/delivery/all');
      setDeliveries(response.data.deliveries || []);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/delivery/my-deliveries');
      setDeliveries(response.data.deliveries || []);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryByOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/delivery/order/${orderId}`);
      setDeliveries([response.data.delivery]);
    } catch (error) {
      toast.error('Failed to load delivery');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'IN_TRANSIT':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'PICKED':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-gray-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-700';
      case 'PICKED':
        return 'bg-yellow-100 text-yellow-700';
      case 'PENDING':
        return 'bg-gray-100 text-gray-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading deliveries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-600 mt-1">Track your delivery status</p>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No deliveries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold">Delivery #{delivery.id}</h3>
                  </div>
                  {delivery.order && delivery.order.catch && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Fish:</strong> {delivery.order.catch.fishName}</p>
                      <p><strong>Order ID:</strong> #{delivery.orderId}</p>
                    </div>
                  )}
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(delivery.status)}`}>
                  {getStatusIcon(delivery.status)}
                  <span className="font-medium text-sm">{delivery.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                {delivery.pickedAt && (
                  <div>
                    <p className="text-gray-600">Picked At</p>
                    <p className="font-semibold">
                      {new Date(delivery.pickedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {delivery.deliveredAt && (
                  <div>
                    <p className="text-gray-600">Delivered At</p>
                    <p className="font-semibold">
                      {new Date(delivery.deliveredAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {delivery.deliveryPerson && (
                  <div>
                    <p className="text-gray-600">Delivery Person</p>
                    <p className="font-semibold">{delivery.deliveryPerson.name}</p>
                  </div>
                )}
              </div>

              {delivery.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {delivery.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deliveries;

