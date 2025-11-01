import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { UserPlus, CheckCircle, XCircle, Fish, Users } from 'lucide-react'

const AgentDashboard = () => {
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFisherForm, setShowFisherForm] = useState(false)
  const [fisherForm, setFisherForm] = useState({
    name: '',
    phone: '',
    password: ''
  })

  useEffect(() => {
    fetchCatches()
  }, [])

  const fetchCatches = async () => {
    try {
      const response = await axios.get('/api/catch/all')
      setCatches(response.data.catches)
    } catch (error) {
      toast.error('Failed to fetch catches')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterFisher = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/user/register-fisher', fisherForm)
      toast.success('Fisher registered successfully!')
      setFisherForm({ name: '', phone: '', password: '' })
      setShowFisherForm(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register fisher')
    }
  }

  const handleVerify = async (id, verified) => {
    try {
      await axios.patch(`/api/catch/${id}/verify`, { verified })
      toast.success(verified ? 'Catch verified!' : 'Verification removed')
      fetchCatches()
    } catch (error) {
      toast.error('Failed to update verification')
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Users className="w-8 h-8 text-aqua-600" />
          <span>Agent Dashboard</span>
        </h1>
        <button
          onClick={() => setShowFisherForm(!showFisherForm)}
          className="btn-secondary flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>{showFisherForm ? 'Cancel' : 'Register Fisher'}</span>
        </button>
      </div>

      {showFisherForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Register New Fisher</h2>
          <form onSubmit={handleRegisterFisher} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={fisherForm.name}
                  onChange={(e) => setFisherForm({ ...fisherForm, name: e.target.value })}
                  className="input-field"
                  placeholder="Fisher's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={fisherForm.phone}
                  onChange={(e) => setFisherForm({ ...fisherForm, phone: e.target.value })}
                  className="input-field"
                  placeholder="+251 9XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={fisherForm.password}
                  onChange={(e) => setFisherForm({ ...fisherForm, password: e.target.value })}
                  className="input-field"
                  placeholder="Temporary password"
                />
              </div>
            </div>
            <button type="submit" className="btn-secondary">
              Register Fisher
            </button>
          </form>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2">
          <Fish className="w-6 h-6" />
          <span>Pending Verification ({pendingCatches.length})</span>
        </h2>
        {pendingCatches.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No pending catches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCatches.map((catchItem) => (
              <div key={catchItem.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{catchItem.fishName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">by {catchItem.fisher.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{catchItem.lake}</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold px-2 py-1 rounded">
                    Pending
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
                    <span className="font-medium">Freshness:</span> {catchItem.freshness}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleVerify(catchItem.id, true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleVerify(catchItem.id, false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Verified Catches ({verifiedCatches.length})</h2>
        {verifiedCatches.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No verified catches yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedCatches.map((catchItem) => (
              <div key={catchItem.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{catchItem.fishName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">by {catchItem.fisher.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{catchItem.lake}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold px-2 py-1 rounded">
                    Verified
                  </span>
                </div>
                
                <div className="space-y-2">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentDashboard

