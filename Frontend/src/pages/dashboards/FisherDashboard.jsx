import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    items: [
      { fishName: '', weight: '', price: '', freshness: '' }
    ],
    lake: '',
    nationalId: '',
    originLat: '',
    originLng: '',
  });
  const [locStatus, setLocStatus] = useState('');
  const [errors, setErrors] = useState({}); // keyed by index: { [i]: { weight, price } }
  const fishTypes = [
    'Tilapia',
    'Nile Tilapia',
    'Catfish',
    'Nile Perch',
    'Perch',
    'Carp',
    'Trout',
    'Tuna',
    'Sardine',
  ];
  const lakes = [
    'Lake Tana',
    'Lake Abaya',
    'Lake Chamo',
    'Lake Ziway',
    'Lake Langano',
    'Lake Hawassa',
    'Lake Shala',
    'Lake Koka',
    'Lake Abijatta',
    'Lake Turkana (Ethiopia)',
  ];
  const [customLake, setCustomLake] = useState('');

  const refPricePerKg = (name) => {
    const key = (name || '').toLowerCase();
    const table = {
      tilapia: 180,
      'nile tilapia': 180,
      catfish: 160,
      'nile perch': 220,
      perch: 200,
      carp: 150,
      trout: 260,
      tuna: 300,
      sardine: 120,
    };
    if (table[key] != null) return table[key];
    if (key.includes('tilapia')) return 180;
    if (key.includes('catfish')) return 160;
    if (key.includes('perch')) return 200;
    return null;
  };

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
    // Inline validation for all items
    let ok = true;
    const nextErrors = {};
    formData.items.forEach((it, i) => {
      const w = parseFloat(it.weight);
      const p = parseFloat(it.price);
      const eObj = { weight: '', price: '' };
      if (!(w > 0) || w > 1000) { eObj.weight = 'Weight must be between 0 and 1000 kg'; ok = false; }
      if (!(p > 0) || p > 1000000) { eObj.price = 'Price must be between 0 and 1,000,000 ETB'; ok = false; }
      nextErrors[i] = eObj;
    });
    setErrors(nextErrors);
    if (!ok) { toast.error('Please fix form errors'); return; }
    try {
      if (editingCatch) {
        // Edit supports single item: use first item only
        const it = formData.items[0];
        await catchAPI.update(editingCatch.id, { 
          fishName: it.fishName,
          weight: it.weight,
          price: it.price,
          freshness: it.freshness,
          lake: formData.lake,
          nationalId: formData.nationalId,
          originLat: formData.originLat,
          originLng: formData.originLng,
        });
        toast.success('Catch updated successfully!');
      } else {
        // Create one catch per item
        for (const it of formData.items) {
          await catchAPI.create({
            fishName: it.fishName,
            weight: it.weight,
            price: it.price,
            freshness: it.freshness,
            lake: formData.lake,
            nationalId: formData.nationalId,
            originLat: formData.originLat,
            originLng: formData.originLng,
          });
        }
        toast.success('Catches registered successfully!');
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
      items: [{ fishName: item.fishName, weight: item.weight, price: item.price, freshness: item.freshness }],
      lake: item.lake,
      nationalId: item.nationalId || '',
      originLat: item.originLat || '',
      originLng: item.originLng || '',
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
      items: [{ fishName: '', weight: '', price: '', freshness: '' }],
      lake: '',
      nationalId: '',
      originLat: '',
      originLng: '',
    });
    setLocStatus('');
    setErrors({});
  };

  const updateItem = (index, patch) => {
    const items = [...formData.items];
    items[index] = { ...items[index], ...patch };
    setFormData({ ...formData, items });
  };

  const recomputePrice = (index, fishName, weight) => {
    const per = refPricePerKg(fishName) || 0;
    const w = parseFloat(weight) || 0;
    return per * w ? (per * w).toFixed(2) : '';
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
          <div className="flex items-center space-x-3">
            <Link
              to="/dashboard/fisher/earnings"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View Earnings
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
            >
              <FiPlus className="mr-2" />
              Register Catch
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingCatch ? 'Edit Catch' : 'Register New Catch'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {formData.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-4 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fish Type</label>
                      <select
                        required
                        value={it.fishName}
                        onChange={(e) => {
                          const fishName = e.target.value;
                          const price = recomputePrice(i, fishName, it.weight);
                          updateItem(i, { fishName, price });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select fish type</option>
                        {fishTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="1000"
                        required
                        value={it.weight}
                        onChange={(e) => {
                          const weight = e.target.value;
                          const price = recomputePrice(i, it.fishName, weight);
                          updateItem(i, { weight, price });
                          const w = parseFloat(weight);
                          setErrors((prev) => ({ ...prev, [i]: { ...(prev[i]||{}), weight: (!(w > 0) || w > 1000) ? 'Weight must be between 0 and 1000 kg' : '' } }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                      {errors[i]?.weight && <div className="mt-1 text-xs text-red-600">{errors[i].weight}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (ETB)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="1000000"
                        required
                        value={it.price}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                      {errors[i]?.price && <div className="mt-1 text-xs text-red-600">{errors[i].price}</div>}
                      <div className="mt-1 text-xs text-gray-500">Auto-calculated as (price per kg × weight)</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Freshness</label>
                      <select
                        required
                        value={it.freshness}
                        onChange={(e) => updateItem(i, { freshness: e.target.value })}
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
                    <div className="flex items-end">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const items = formData.items.filter((_, idx) => idx !== i);
                            setFormData({ ...formData, items });
                          }}
                          className="px-3 py-2 border border-red-300 text-red-700 rounded-md text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, items: [...formData.items, { fishName: '', weight: '', price: '', freshness: '' }] })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                  >
                    + Add another fish
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lake
                  </label>
                  <select
                    required
                    value={formData.lake || ''}
                    onChange={(e) => setFormData({ ...formData, lake: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select lake</option>
                    {lakes.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catch Location (GPS)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLocStatus('Locating...');
                        if (!('geolocation' in navigator)) { setLocStatus('Geolocation not supported'); return; }
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setFormData({ ...formData, originLat: String(pos.coords.latitude), originLng: String(pos.coords.longitude) });
                            setLocStatus('Location captured');
                          },
                          () => setLocStatus('Failed to get location'),
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    >
                      Use my location
                    </button>
                    {locStatus && <span className="text-xs text-gray-600 dark:text-gray-300">{locStatus}</span>}
                  </div>
                  {(formData.originLat && formData.originLng) && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Lat: {formData.originLat}, Lng: {formData.originLng}
                    </div>
                  )}
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
                      <div>
                        <span className="font-medium">Origin GPS:</span>{' '}
                        {item.originLat && item.originLng ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Origin set</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Needs GPS</span>
                        )}
                      </div>
                    </div>
                    {item.qrEncrypted && (
                      <div className="mb-4 flex flex-col items-center space-y-2">
                        <QRCodeSVG value={item.qrEncrypted} size={100} />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(item.qrEncrypted);
                              toast.success('QR data copied to clipboard');
                            } catch {
                              toast.error('Failed to copy QR data');
                            }
                          }}
                          className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Copy QR data
                        </button>
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







