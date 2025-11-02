import { useEffect, useState } from 'react';
import api from '../services/api';
import { UserCheck, Fish, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'pending'

  useEffect(() => {
    fetchAllCatches();
  }, [filter]);

  const fetchAllCatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/catch/all');
      let allCatches = response.data.catches || [];
      
      if (filter === 'verified') {
        allCatches = allCatches.filter(c => c.verified);
      } else if (filter === 'pending') {
        allCatches = allCatches.filter(c => !c.verified);
      }
      
      setCatches(allCatches);
    } catch (error) {
      toast.error('Failed to load catches');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (catchId, verified) => {
    try {
      await api.patch(`/api/catch/${catchId}/verify`, { verified });
      toast.success(`Catch ${verified ? 'verified' : 'unverified'} successfully`);
      fetchAllCatches();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update verification');
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
          <div className="flex items-center space-x-2 mb-2">
            <UserCheck className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          </div>
          <p className="text-gray-600">Verify and manage fish catches</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Catches
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'verified'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Catches List */}
      {catches.length === 0 ? (
        <div className="card text-center py-12">
          <Fish className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No catches found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {catches.map((catchItem) => (
            <div key={catchItem.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Fish className="w-5 h-5 text-primary-600" />
                    <h3 className="text-xl font-semibold">{catchItem.fishName}</h3>
                    {catchItem.verified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Weight</p>
                      <p className="font-semibold">{catchItem.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-semibold text-primary-600">
                        ETB {parseFloat(catchItem.price).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Lake</p>
                      <p className="font-semibold">{catchItem.lake}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Freshness</p>
                      <p className="font-semibold">{catchItem.freshness}</p>
                    </div>
                  </div>

                  {catchItem.fisher && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Fisher:</strong> {catchItem.fisher.name} ({catchItem.fisher.phone})
                    </div>
                  )}

                  {catchItem.nationalId && (
                    <div className="mt-1 text-sm text-gray-600">
                      <strong>National ID:</strong> {catchItem.nationalId}
                    </div>
                  )}

                  <div className="mt-2 text-sm text-gray-500">
                    Created: {new Date(catchItem.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {!catchItem.verified ? (
                  <button
                    onClick={() => handleVerify(catchItem.id, true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Catch</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(catchItem.id, false)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
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
  );
};

export default AgentDashboard;

