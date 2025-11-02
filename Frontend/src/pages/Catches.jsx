import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Fish, Search, Filter, CheckCircle, XCircle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Catches = () => {
  const { user } = useAuth();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    lake: '',
    fishName: '',
    freshness: '',
  });

  useEffect(() => {
    fetchCatches();
  }, [filters]);

  const fetchCatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.lake) params.append('lake', filters.lake);
      if (filters.fishName) params.append('fishName', filters.fishName);
      if (filters.freshness) params.append('freshness', filters.freshness);

      const response = await api.get(`/api/catch?${params.toString()}`);
      setCatches(response.data.catches || []);
    } catch (error) {
      toast.error('Failed to load catches');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (catchId) => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }
    if (user.role !== 'BUYER') {
      toast.error('Only buyers can place orders');
      return;
    }

    try {
      const response = await api.post('/api/order-payment/create-and-pay', {
        catchId,
      });
      
      if (response.data.payment?.checkout_url) {
        window.location.href = response.data.payment.checkout_url;
      } else {
        toast.success('Order created successfully!');
        fetchCatches();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading catches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Catches</h1>
          <p className="text-gray-600 mt-1">All verified fish catches available for order</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lake
            </label>
            <input
              type="text"
              value={filters.lake}
              onChange={(e) => setFilters({ ...filters, lake: e.target.value })}
              className="input-field"
              placeholder="Filter by lake"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fish Name
            </label>
            <input
              type="text"
              value={filters.fishName}
              onChange={(e) => setFilters({ ...filters, fishName: e.target.value })}
              className="input-field"
              placeholder="Filter by fish name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freshness
            </label>
            <select
              value={filters.freshness}
              onChange={(e) => setFilters({ ...filters, freshness: e.target.value })}
              className="input-field"
            >
              <option value="">All</option>
              <option value="Fresh">Fresh</option>
              <option value="Frozen">Frozen</option>
              <option value="Salted">Salted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catches Grid */}
      {catches.length === 0 ? (
        <div className="card text-center py-12">
          <Fish className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No catches found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catches.map((catchItem) => (
            <div key={catchItem.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Fish className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold">{catchItem.fishName}</h3>
                </div>
                {catchItem.verified ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{catchItem.lake}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weight:</span>
                  <span className="font-semibold">{catchItem.weight} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Freshness:</span>
                  <span className="font-semibold">{catchItem.freshness}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ETB {parseFloat(catchItem.price).toLocaleString()}
                  </span>
                </div>
                {catchItem.fisher && (
                  <div className="text-sm text-gray-500">
                    Fisher: {catchItem.fisher.name}
                  </div>
                )}
              </div>

              {user?.role === 'BUYER' && catchItem.verified && (
                <button
                  onClick={() => handleOrder(catchItem.id)}
                  className="btn-primary w-full"
                >
                  Order Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catches;

