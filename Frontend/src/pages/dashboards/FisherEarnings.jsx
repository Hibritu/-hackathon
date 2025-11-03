import { useEffect, useState } from 'react';
import { orderPaymentAPI, payoutsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FisherEarnings = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ count: 0, totalGross: 0, totalFisherFee: 0, totalNetToFisher: 0 });
  const [balance, setBalance] = useState({ available: 0, gross: 0, fees: 0, net: 0, withdrawn: 0 });
  const [payouts, setPayouts] = useState([]);
  const [payoutForm, setPayoutForm] = useState({ amount: '', method: 'MOBILE_MONEY', account: '', notes: '' });
  const [filters, setFilters] = useState({ from: '', to: '' });

  const load = async () => {
    try {
      setLoading(true);
      const [earnRes, payRes] = await Promise.all([
        orderPaymentAPI.fisherEarnings({ ...filters }),
        payoutsAPI.getMine({ ...filters }),
      ]);
      setItems(earnRes.data.items || []);
      setSummary(earnRes.data.summary || { count: 0, totalGross: 0, totalFisherFee: 0, totalNetToFisher: 0 });
      setBalance(payRes.data.balance || { available: 0, gross: 0, fees: 0, net: 0, withdrawn: 0 });
      setPayouts(payRes.data.payouts || []);
    } catch (e) {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submitPayout = async () => {
    const amt = Number(payoutForm.amount);
    if (!(amt > 0)) { toast.error('Enter a valid amount'); return; }
    if (amt > Number(balance.available || 0)) { toast.error('Amount exceeds available balance'); return; }
    if (!payoutForm.account) { toast.error('Enter destination account/phone'); return; }
    try {
      await payoutsAPI.request({ ...payoutForm, amount: amt });
      toast.success('Payout requested');
      setPayoutForm({ amount: '', method: payoutForm.method, account: '', notes: '' });
      load();
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to request payout';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Earnings</h1>
          <p className="text-gray-600 dark:text-gray-400">Completed sales, commissions, and net payouts</p>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sales (Gross)</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {summary.totalGross?.toFixed ? summary.totalGross.toFixed(2) : summary.totalGross}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Fisher Fees (5%)</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {summary.totalFisherFee?.toFixed ? summary.totalFisherFee.toFixed(2) : summary.totalFisherFee}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Net To Me</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {summary.totalNetToFisher?.toFixed ? summary.totalNetToFisher.toFixed(2) : summary.totalNetToFisher}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Available Balance</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {balance.available?.toFixed ? balance.available.toFixed(2) : balance.available}</div>
          </div>
        </div>

        {/* Request Payout */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Request Payout</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">Amount</label>
              <input type="number" step="0.01" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">Method</label>
              <select value={payoutForm.method} onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">Account / Phone</label>
              <input value={payoutForm.account} onChange={(e) => setPayoutForm({ ...payoutForm, account: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="flex items-end">
              <button onClick={submitPayout} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Submit</button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">You can request up to your available balance. An admin will process and mark your payout as paid.</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sold Items</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No sales found</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Date</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Fish</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Gross</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Fee</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((it) => (
                    <tr key={it.orderId}>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{new Date(it.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{it.fishName}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {it.gross}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {it.fisherFee}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {it.netToFisher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* My Payouts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Payout Requests</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : payouts.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No payout requests yet</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Date</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Amount</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Method</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Account</th>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{new Date(p.created_at || p.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">ETB {p.amount}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{p.method}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{p.account}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{p.status}</td>
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

export default FisherEarnings;
