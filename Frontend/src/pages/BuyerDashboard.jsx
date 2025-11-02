import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ShoppingCart, Search, Filter, Fish } from 'lucide-react'

const BuyerDashboard = () => {
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    lake: '',
    fishName: '',
    freshness: ''
  })

  useEffect(() => {
    fetchCatches()
  }, [])

  const fetchCatches = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.lake) params.append('lake', filters.lake)
      if (filters.fishName) params.append('fishName', filters.fishName)
      if (filters.freshness) params.append('freshness', filters.freshness)

      const response = await axios.get(`/api/catch?${params.toString()}`)
      setCatches(response.data.catches)
    } catch (error) {
      toast.error('Failed to fetch catches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCatches()
  }, [filters])

  const handleBuy = async (catchId) => {
    if (!window.confirm('Are you sure you want to buy this fish?')) return

    try {
      const orderResponse = await axios.post('/api/order', {
        catchId,
        paymentStatus: 'PENDING'
      })

      // Simulate payment processing
      toast.success('Processing payment...')
      
      setTimeout(async () => {
        try {
          await axios.patch(`/api/order/${orderResponse.data.order.id}/payment`, {
            paymentStatus: 'COMPLETED'
          })
          toast.success('Order placed successfully! Payment completed (mock)')
          fetchCatches()
        } catch (error) {
          toast.error('Payment processing failed')
        }
      }, 2000)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-6">
          <ShoppingCart className="w-8 h-8 text-green-600" />
          <span>Buyer Dashboard</span>
        </h1>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lake
              </label>
              <input
                type="text"
                value={filters.lake}
                onChange={(e) => setFilters({ ...filters, lake: e.target.value })}
                className="input-field"
                placeholder="e.g., Lake Tana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fish Type
              </label>
              <input
                type="text"
                value={filters.fishName}
                onChange={(e) => setFilters({ ...filters, fishName: e.target.value })}
                className="input-field"
                placeholder="e.g., Tilapia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Freshness
              </label>
              <select
                value={filters.freshness}
                onChange={(e) => setFilters({ ...filters, freshness: e.target.value })}
                className="input-field"
              >
                <option value="">All</option>
                <option value="Fresh">Fresh</option>
                <option value="Very Fresh">Very Fresh</option>
                <option value="Moderate">Moderate</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fish Listings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Available Fish ({catches.length})
        </h2>
        {catches.length === 0 ? (
          <div className="card text-center py-12">
            <Fish className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No verified fish available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catches.map((catchItem) => (
              <div key={catchItem.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{catchItem.fishName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">From {catchItem.lake}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">by {catchItem.fisher.name}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold px-2 py-1 rounded">
                    Verified
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Weight:</span> {catchItem.weight} kg
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Price:</span> ETB {catchItem.price}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Price per kg:</span> ETB {(catchItem.price / catchItem.weight).toFixed(2)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Freshness:</span> {catchItem.freshness}
                  </p>
                </div>

                <button
                  onClick={() => handleBuy(catchItem.id)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Buy Now (Mock Payment)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BuyerDashboard

