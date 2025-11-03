import { useEffect, useState } from 'react';
import { orderPaymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      const res = await orderPaymentAPI.getAdminDeliveries();
      setDeliveries(res.data.deliveries || []);
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to load deliveries';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = deliveries.filter(d => !statusFilter || d.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Deliveries</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor deliveries with origin/destination coordinates and distance</p>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">All statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PICKED">PICKED</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">No deliveries found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Catch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Origin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Distance (km)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fee (ETB)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{d.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#{d.orderId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{d.buyer?.name}<div className="text-xs text-gray-500">{d.buyer?.phone}</div></td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{d.catch?.fishName}<div className="text-xs text-gray-500">ETB {d.catch?.price}</div></td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{d.origin?.lat != null && d.origin?.lng != null ? `${d.origin.lat.toFixed(5)}, ${d.origin.lng.toFixed(5)}` : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{d.destination?.lat != null && d.destination?.lng != null ? `${d.destination.lat.toFixed(5)}, ${d.destination.lng.toFixed(5)}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{d.distanceKm ? d.distanceKm.toFixed(2) : '0.00'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{d.deliveryFee?.toFixed ? d.deliveryFee.toFixed(2) : d.deliveryFee}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{d.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{new Date(d.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {d.status !== 'DELIVERED' && (
                        <button
                          className="px-3 py-1.5 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={async () => {
                            try {
                              await orderPaymentAPI.updateDeliveryStatus(d.id, 'DELIVERED');
                              toast.success('Marked as DELIVERED');
                              load();
                            } catch (e) {
                              toast.error(e.response?.data?.error || 'Failed to update status');
                            }
                          }}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDeliveries;
