import { useEffect, useState } from 'react';
import api from '../services/api';
import { Fish, Plus, Edit, Trash2, CheckCircle, XCircle, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MyCatches = () => {
  const { user } = useAuth();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCatch, setEditingCatch] = useState(null);
  const [formData, setFormData] = useState({
    fishName: '',
    weight: '',
    price: '',
    freshness: 'Fresh',
    lake: '',
    nationalId: '',
  });

  useEffect(() => {
    fetchCatches();
  }, []);

  const fetchCatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/catch/my-catches');
      setCatches(response.data.catches || []);
    } catch (error) {
      toast.error('Failed to load catches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCatch) {
        await api.put(`/api/catch/${editingCatch.id}`, formData);
        toast.success('Catch updated successfully');
      } else {
        const response = await api.post('/api/catch', formData);
        toast.success('Catch created successfully! QR code generated.');
        
        // Show QR code if available
        if (response.data.qrCode) {
          const qrWindow = window.open();
          qrWindow.document.write(`
            <html>
              <head><title>QR Code</title></head>
              <body style="display:flex;justify-content:center;align-items:center;height:100vh;">
                <img src="${response.data.qrCode}" alt="QR Code" style="max-width:500px;" />
              </body>
            </html>
          `);
        }
      }
      setShowForm(false);
      setEditingCatch(null);
      resetForm();
      fetchCatches();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (catchItem) => {
    setEditingCatch(catchItem);
    setFormData({
      fishName: catchItem.fishName,
      weight: catchItem.weight.toString(),
      price: catchItem.price.toString(),
      freshness: catchItem.freshness,
      lake: catchItem.lake,
      nationalId: catchItem.nationalId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this catch?')) return;
    
    try {
      await api.delete(`/api/catch/${id}`);
      toast.success('Catch deleted successfully');
      fetchCatches();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete catch');
    }
  };

  const resetForm = () => {
    setFormData({
      fishName: '',
      weight: '',
      price: '',
      freshness: 'Fresh',
      lake: '',
      nationalId: '',
    });
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
          <h1 className="text-3xl font-bold text-gray-900">My Catches</h1>
          <p className="text-gray-600 mt-1">Manage your fish catches</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCatch(null);
            resetForm();
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Catch</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingCatch ? 'Edit Catch' : 'Add New Catch'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCatch(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fishName}
                    onChange={(e) => setFormData({ ...formData, fishName: e.target.value })}
                    className="input-field"
                    placeholder="Nile Tilapia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input-field"
                    placeholder="5.2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (ETB) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="1200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Freshness *
                  </label>
                  <select
                    required
                    value={formData.freshness}
                    onChange={(e) => setFormData({ ...formData, freshness: e.target.value })}
                    className="input-field"
                  >
                    <option value="Fresh">Fresh</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Salted">Salted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lake *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lake}
                    onChange={(e) => setFormData({ ...formData, lake: e.target.value })}
                    className="input-field"
                    placeholder="Lake Tana"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="input-field"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingCatch ? 'Update Catch' : 'Create Catch'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCatch(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catches List */}
      {catches.length === 0 ? (
        <div className="card text-center py-12">
          <Fish className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">No catches yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Catch
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catches.map((catchItem) => (
            <div key={catchItem.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{catchItem.fishName}</h3>
                  <p className="text-sm text-gray-500">{catchItem.lake}</p>
                </div>
                {catchItem.verified ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-600" />
                )}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-semibold">{catchItem.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-primary-600">
                    ETB {parseFloat(catchItem.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Freshness:</span>
                  <span className="font-semibold">{catchItem.freshness}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${catchItem.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {catchItem.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(catchItem)}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(catchItem.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
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
  );
};

export default MyCatches;

