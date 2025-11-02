import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Shield, Users, Fish, ShoppingBag, CheckCircle, XCircle } from 'lucide-react'

const AdminPanel = () => {
  const [catches, setCatches] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('catches')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [catchesRes, ordersRes] = await Promise.all([
        axios.get('/api/catch/all'),
        axios.get('/api/order/all')
      ])
      setCatches(catchesRes.data.catches)
      setOrders(ordersRes.data.orders)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id, verified) => {
    try {
      await axios.patch(`/api/catch/${id}/verify`, { verified })
      toast.success(verified ? 'Catch verified!' : 'Verification removed')
      fetchData()
    } catch (error) {
      toast.error('Failed to update verification')
    }
  }

  const handlePaymentStatus = async (orderId, status) => {
    try {
      await axios.patch(`/api/order/${orderId}/payment`, { paymentStatus: status })
      toast.success('Payment status updated')
      fetchData()
    } catch (error) {
      toast.error('Failed to update payment status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const pendingCatches = catches.filter(c => !c.verified)
  const verifiedCatches = catches.filter(c => c.verified)
  const stats = {
    totalCatches: catches.length,
    verifiedCatches: verifiedCatches.length,
    pendingCatches: pendingCatches.length,
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.paymentStatus === 'COMPLETED').length
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-6">
          <Shield className="w-8 h-8 text-purple-600" />
          <span>Admin Panel</span>
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center space-x-3">
              <Fish className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Catches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCatches}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.verifiedCatches}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingCatches}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-8 h-8 text-aqua-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('catches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catches'
                  ? 'border-primary-500 text-primary-600 dark:text-aqua-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Catches ({catches.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600 dark:text-aqua-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders ({orders.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Catches Tab */}
      {activeTab === 'catches' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            All Catches
          </h2>
          {catches.length === 0 ? (
            <div className="card text-center py-12">
              <Fish className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No catches registered yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catches.map((catchItem) => (
                <div key={catchItem.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{catchItem.fishName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {catchItem.fisher.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{catchItem.lake}</p>
                    </div>
                    {catchItem.verified ? (
                      <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold px-2 py-1 rounded">
                        Verified
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Weight:</span> {catchItem.weight} kg
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Price:</span> ETB {catchItem.price}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Freshness:</span> {catchItem.freshness}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {!catchItem.verified ? (
                      <button
                        onClick={() => handleVerify(catchItem.id, true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(catchItem.id, false)}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Unverify</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            All Orders
          </h2>
          {orders.length === 0 ? (
            <div className="card text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {order.catch.fishName} - {order.catch.weight} kg
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Buyer: {order.buyer.name} | Fisher: {order.catch.fisher.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: ETB {order.catch.price} | Date: {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        order.paymentStatus === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : order.paymentStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  
                  {order.paymentStatus !== 'COMPLETED' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePaymentStatus(order.id, 'COMPLETED')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Mark as Completed
                      </button>
                      {order.paymentStatus === 'PENDING' && (
                        <button
                          onClick={() => handlePaymentStatus(order.id, 'FAILED')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          Mark as Failed
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPanel

