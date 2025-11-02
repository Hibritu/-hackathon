import { useState, useEffect } from 'react';
import { catchAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

const FisherDashboard = () => {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCatch, setEditingCatch] = useState(null);
  const [formData, setFormData] = useState({
    fishName: '',
    weight: '',
    price: '',
    freshness: '',
    lake: '',
    nationalId: '',
  });

  useEffect(() => {
    loadCatches();
  }, []);

  const loadCatches = async () => {
    try {
      const response = await catchAPI.getMyCatches();
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
        await catchAPI.update(editingCatch.id, formData);
        toast.success('Catch updated successfully!');
      } else {
        await catchAPI.create(formData);
        toast.success('Catch registered successfully!');
      }
      setShowAddForm(false);
      setEditingCatch(null);
      resetForm();
      loadCatches();
    } catch (error) {
      const message = error.response?.data?.error || 'Operation failed';
      toast.error(message);
    }
  };

  const handleEdit = (item) => {
    setEditingCatch(item);
    setFormData({
      fishName: item.fishName,
      weight: item.weight,
      price: item.price,
      freshness: item.freshness,
      lake: item.lake,
      nationalId: item.nationalId || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this catch?')) return;
    
    try {
      await catchAPI.delete(id);
      toast.success('Catch deleted successfully!');
      loadCatches();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete catch';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      fishName: '',
      weight: '',
      price: '',
      freshness: '',
      lake: '',
      nationalId: '',
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCatch(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Fisher Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your catches and track verification status
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
          >
            <FiPlus className="mr-2" />
            Register Catch
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingCatch ? 'Edit Catch' : 'Register New Catch'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fish Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fishName}
                    onChange={(e) => setFormData({ ...formData, fishName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (ETB)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Freshness
                  </label>
                  <select
                    required
                    value={formData.freshness}
                    onChange={(e) => setFormData({ ...formData, freshness: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select freshness</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Dried">Dried</option>
                    <option value="Processed">Processed</option>
                    <option value="Wasted">Wasted</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lake
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lake}
                    onChange={(e) => setFormData({ ...formData, lake: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    National ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editingCatch ? 'Update' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Catches List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FiPackage className="mr-2" />
              My Catches
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : catches.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No catches registered yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catches.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.fishName}
                      </h3>
                      {item.verified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs flex items-center">
                          <FiCheckCircle className="mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs flex items-center">
                          <FiXCircle className="mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div>
                        <span className="font-medium">Weight:</span> {item.weight} kg
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ETB {item.price}
                      </div>
                      <div>
                        <span className="font-medium">Freshness:</span> {item.freshness}
                      </div>
                      <div>
                        <span className="font-medium">Lake:</span> {item.lake}
                      </div>
                      {item.nationalId && (
                        <div>
                          <span className="font-medium">National ID:</span> {item.nationalId}
                        </div>
                      )}
                    </div>
                    {item.qrEncrypted && (
                      <div className="mb-4 flex justify-center">
                        <QRCodeSVG value={item.qrEncrypted} size={100} />
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm flex items-center justify-center"
                      >
                        <FiEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center justify-center"
                      >
                        <FiTrash2 className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FisherDashboard;







