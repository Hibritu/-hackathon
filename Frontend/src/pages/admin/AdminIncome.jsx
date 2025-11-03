import { useEffect, useState } from 'react';
import { orderPaymentAPI, payoutsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminIncome = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ count: 0, totalBuyerFees: 0, totalFisherFees: 0, totalRevenue: 0 });
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [payouts, setPayouts] = useState([]);
  const [payoutStatus, setPayoutStatus] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [incRes, payRes] = await Promise.all([
        orderPaymentAPI.adminIncome({ ...filters }),
        payoutsAPI.adminList({ status: payoutStatus || undefined }),
      ]);
      setItems(incRes.data.items || []);
      setSummary(incRes.data.summary || { count: 0, totalBuyerFees: 0, totalFisherFees: 0, totalRevenue: 0 });
      setPayouts(payRes.data.payouts || []);
    } catch (e) {
      toast.error('Failed to load income');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  
  const updatePayout = async (id, status) => {
    try {
      await payoutsAPI.adminUpdateStatus(id, status);
      toast.success(`Payout ${status.toLowerCase()}`);
      load();
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to update payout';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Platform Income</h1>
          <p className="text-gray-600 dark:text-gray-400">Buyer and fisher fees collected from completed orders</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">From</label>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">To</label>
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="flex items-end">
              <button onClick={load} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Filter</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Buyer Fees (10%)</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {summary.totalBuyerFees?.toFixed ? summary.totalBuyerFees.toFixed(2) : summary.totalBuyerFees}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Fisher Fees (5%)</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {summary.totalFisherFees?.toFixed ? summary.totalFisherFees.toFixed(2) : summary.totalFisherFees}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {summary.totalRevenue?.toFixed ? summary.totalRevenue.toFixed(2) : summary.totalRevenue}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Orders</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No income records</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Date</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Catch</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Gross</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Buyer Fee</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Fisher Fee</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((it) => (
                    <tr key={it.orderId}>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{new Date(it.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">#{it.catchId}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {it.gross}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {it.buyerFee}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {it.fisherFee}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {it.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Payout Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payout Requests</h2>
            <div className="flex items-center space-x-2">
              <select value={payoutStatus} onChange={(e) => setPayoutStatus(e.target.value)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm">
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <button onClick={load} className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm">Apply</button>
            </div>
          </div>
          <div className="p-4 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : payouts.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No payouts</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Date</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Fisher</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Amount</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Method</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Account</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{new Date(p.created_at || p.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{p.fisher_name} ({p.fisher_phone || 'N/A'})</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {p.amount}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{p.method}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{p.account}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{p.status}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200 space-x-2">
                        {p.status === 'PENDING' && (
                          <>
                            <button onClick={() => updatePayout(p.id, 'APPROVED')} className="px-2 py-1 text-xs bg-amber-600 text-white rounded">Approve</button>
                            <button onClick={() => updatePayout(p.id, 'REJECTED')} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Reject</button>
                          </>
                        )}
                        {p.status === 'APPROVED' && (
                          <button onClick={() => updatePayout(p.id, 'PAID')} className="px-2 py-1 text-xs bg-emerald-600 text-white rounded">Mark Paid</button>
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
    </div>
  );
};

export default AdminIncome;
