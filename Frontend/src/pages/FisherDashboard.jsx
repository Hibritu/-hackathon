import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, QrCode, Fish } from 'lucide-react'

const FisherDashboard = () => {
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    fishName: '',
    weight: '',
    price: '',
    freshness: 'Fresh',
    lake: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchCatches()
  }, [])

  const fetchCatches = async () => {
    try {
      const response = await axios.get('/api/catch/my-catches')
      setCatches(response.data.catches)
    } catch (error) {
      toast.error('Failed to fetch catches')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        await axios.put(`/api/catch/${editingId}`, formData)
        toast.success('Catch updated successfully!')
        setEditingId(null)
      } else {
        const response = await axios.post('/api/catch', formData)
        toast.success('Catch registered successfully!')
        
        // Show QR code in a modal or new page
        if (response.data.qrCode) {
          const newWindow = window.open()
          newWindow.document.write(`
            <html>
              <head><title>QR Code</title></head>
              <body style="text-align:center;padding:20px;font-family:Arial;">
                <h2>Your Fish QR Code</h2>
                <img src="${response.data.qrCode}" alt="QR Code" style="max-width:400px;margin:20px;" />
                <p>Save this QR code image for verification</p>
              </body>
            </html>
          `)
        }
      }
      
      setFormData({ fishName: '', weight: '', price: '', freshness: 'Fresh', lake: '' })
      setShowForm(false)
      fetchCatches()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save catch')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (catchItem) => {
    setFormData({
      fishName: catchItem.fishName,
      weight: catchItem.weight.toString(),
      price: catchItem.price.toString(),
      freshness: catchItem.freshness,
      lake: catchItem.lake
    })
    setEditingId(catchItem.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this catch?')) return

    try {
      await axios.delete(`/api/catch/${id}`)
      toast.success('Catch deleted successfully!')
      fetchCatches()
    } catch (error) {
      toast.error('Failed to delete catch')
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Fish className="w-8 h-8 text-primary-600" />
          <span>Fisher Dashboard</span>
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ fishName: '', weight: '', price: '', freshness: 'Fresh', lake: '' })
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{showForm ? 'Cancel' : 'Add New Catch'}</span>
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Catch' : 'Register New Catch'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fish Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fishName}
                  onChange={(e) => setFormData({ ...formData, fishName: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Tilapia, Nile Perch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 150.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Freshness
                </label>
                <select
                  value={formData.freshness}
                  onChange={(e) => setFormData({ ...formData, freshness: e.target.value })}
                  className="input-field"
                >
                  <option>Fresh</option>
                  <option>Very Fresh</option>
                  <option>Moderate</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lake
                </label>
                <input
                  type="text"
                  required
                  value={formData.lake}
                  onChange={(e) => setFormData({ ...formData, lake: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Lake Tana, Lake Hawassa"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Catch' : 'Register Catch'}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">My Listings</h2>
        {catches.length === 0 ? (
          <div className="card text-center py-12">
            <Fish className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No catches registered yet. Add your first catch!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catches.map((catchItem) => (
              <div key={catchItem.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{catchItem.fishName}</h3>
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

                {catchItem.qrEncrypted && (
                  <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <QrCode className="w-6 h-6 inline mr-2 text-primary-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">QR Code Generated</span>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(catchItem)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(catchItem.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FisherDashboard

