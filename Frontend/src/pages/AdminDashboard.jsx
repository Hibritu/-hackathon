import { useEffect, useState } from 'react';
import api from '../services/api';
import { Shield, Users, Fish, ShoppingCart, Package, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    catches: 0,
    orders: 0,
    deliveries: 0,
    verified: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all catches
      const catchesRes = await api.get('/api/catch/all');
      const catches = catchesRes.data.catches || [];
      
      // Fetch all orders
      const ordersRes = await api.get('/api/order/all');
      const orders = ordersRes.data.orders || [];
      
      // Fetch all deliveries
      const deliveriesRes = await api.get('/api/delivery/all');
      const deliveries = deliveriesRes.data.deliveries || [];

      setStats({
        catches: catches.length,
        verified: catches.filter(c => c.verified).length,
        pending: catches.filter(c => !c.verified).length,
        orders: orders.length,
        deliveries: deliveries.length,
        users: 0, // Would need a users endpoint
      });
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">System overview and management</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Catches</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.catches}</p>
            </div>
            <Fish className="w-12 h-12 text-primary-600 opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified Catches</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.verified}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Verification</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <XCircle className="w-12 h-12 text-yellow-600 opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.orders}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deliveries</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.deliveries}</p>
            </div>
            <Package className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-3xl font-bold text-green-600 mt-1">✓</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/agent" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold">Catch Verification</h3>
              <p className="text-sm text-gray-600">Verify and manage catches</p>
            </div>
          </div>
        </a>

        <a href="/orders" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Order Management</h3>
              <p className="text-sm text-gray-600">View and manage all orders</p>
            </div>
          </div>
        </a>

        <a href="/deliveries" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Delivery Tracking</h3>
              <p className="text-sm text-gray-600">Monitor all deliveries</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;

