import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { catchAPI, orderAPI, orderPaymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiPackage } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const Market = () => {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  // Inline CTA buttons; no modals
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Initialize category from URL to keep UI consistent on first paint
  const getInitialCategory = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = (params.get('category') || '').toUpperCase();
      const allowed = ['ALL','FRESH','PROCESSED','FROZEN','DRIED','WASTED'];
      if (!allowed.includes(cat)) return 'ALL';
      if (cat === 'ALL') return 'ALL';
      return cat.charAt(0) + cat.slice(1).toLowerCase();
    } catch { return 'ALL'; }
  };
  const initialCategory = getInitialCategory();

  const [filters, setFilters] = useState({
    lake: '',
    fishName: '',
    freshness: initialCategory === 'ALL' ? '' : initialCategory,
    nationalId: '',
  });
  const [category, setCategory] = useState(initialCategory); // ALL | Fresh | Processed | Frozen | Dried | Wasted
  const DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FLAT_FEE || 150);
  const [payCatch, setPayCatch] = useState(null);
  const [needDelivery, setNeedDelivery] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({ address: '', city: '', contactName: '', phone: '', lat: '', lng: '' });
  const [locStatus, setLocStatus] = useState('');
  const [quote, setQuote] = useState({ catchPrice: 0, buyerFee: 0, fisherFee: 0, netToFisher: 0, deliveryFee: 0, total: 0, distanceKm: 0 });
  const [quoting, setQuoting] = useState(false);
  const [lastGoodQuote, setLastGoodQuote] = useState(null);
  const [quoteInfoMsg, setQuoteInfoMsg] = useState('');
  const norm = (v) => String(v || '').trim().toLowerCase();

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const refPricePerKg = (name) => {
    const key = (name || '').toLowerCase();
    const table = {
      tilapia: 180,
      nile_tilapia: 180,
      catfish: 160,
      nile_perch: 220,
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

  const loadWithParams = async (params) => {
    setLoading(true);
    try {
      const res = await catchAPI.getAvailable(params);
      setCatches(res.data.catches || []);
    } catch (e) {
      toast.error('Failed to load catches');
    } finally {
      setLoading(false);
    }
  };
  const load = async () => loadWithParams(filters);

  // Note: Do not load on mount; filters and URL effect will trigger load

  // Periodic polling to reflect purchases made by others
  useEffect(() => {
    const interval = setInterval(() => load(), 10000); // 10s
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Do not auto-load on filters change; URL effect below will trigger loads

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const normalized = (cat || '').toUpperCase();
    const allowed = ['ALL','FRESH','PROCESSED','FROZEN','DRIED','WASTED'];
    let nextCategory = 'ALL';
    if (allowed.includes(normalized)) {
      nextCategory = normalized === 'ALL' ? 'ALL' : (normalized.charAt(0) + normalized.slice(1).toLowerCase());
    }
    if (nextCategory !== category) {
      setCategory(nextCategory);
    }
    const nextFresh = nextCategory === 'ALL' ? '' : nextCategory;
    const newFilters = { ...filters, freshness: nextFresh };
    if (filters.freshness !== nextFresh) setFilters(newFilters);
    // Trigger load immediately using computed filters to avoid race conditions
    loadWithParams(newFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'freshness') {
      const cat = value || 'ALL';
      // Optimistically reflect in state when clearing to ALL to avoid a brief mismatch
      if (!value) setFilters({ ...filters, freshness: '' });
      navigate({ pathname: '/market', search: `?category=${encodeURIComponent(cat)}` }, { replace: true });
      return;
    }
    setFilters({ ...filters, [name]: value });
  };

  const handleOrder = async (catchId) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (user?.role !== 'BUYER') {
      toast.error('Only buyers can place orders');
      return;
    }
    try {
      await orderAPI.create({ catchId, paymentStatus: 'PENDING' });
      toast.success('Order placed');
      // Optimistically remove from market to avoid duplicate ordering
      setCatches((prev) => prev.filter((c) => c.id !== catchId));
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to place order';
      toast.error(msg);
    }
  };

  const handleOrderAndPay = async (catchId) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (user?.role !== 'BUYER') {
      toast.error('Only buyers can place orders');
      return;
    }
    // Open delivery modal
    const item = catches.find((c) => c.id === catchId) || null;
    setPayCatch(item);
    setNeedDelivery(false);
    setDeliveryForm({ address: '', city: '', contactName: '', phone: '' });
    setQuote({ catchPrice: Number(item?.price || 0), deliveryFee: 0, total: Number(item?.price || 0), distanceKm: 0 });
    setLastGoodQuote(null);
    setQuoteInfoMsg('');
  };

  // Quote delivery fee when info changes
  useEffect(() => {
    let timer;
    const doQuote = async () => {
      if (!payCatch) return;
      if (!needDelivery) {
        setQuote({ catchPrice: Number(payCatch.price || 0), buyerFee: 0, fisherFee: 0, netToFisher: Number(payCatch.price || 0), deliveryFee: 0, total: Number(payCatch.price || 0), distanceKm: 0 });
        return;
      }
      const hasGPS = deliveryForm.lat && deliveryForm.lng;
      const hasAddress = (deliveryForm.address?.trim()?.length || 0) >= 3 && (deliveryForm.city?.trim()?.length || 0) >= 2;
      if (!hasGPS && !hasAddress) {
        setQuoteInfoMsg('Provide address + city or use your location to calculate delivery fee.');
        // Keep last good quote if any
        if (lastGoodQuote) {
          setQuote(lastGoodQuote);
        } else {
          setQuote({ catchPrice: Number(payCatch.price || 0), buyerFee: 0, fisherFee: 0, netToFisher: Number(payCatch.price || 0), deliveryFee: 0, total: Number(payCatch.price || 0), distanceKm: 0 });
        }
        return;
      } else {
        setQuoteInfoMsg('');
      }
      try {
        setQuoting(true);
        const res = await orderPaymentAPI.quote(payCatch.id, { needDelivery: true, ...deliveryForm });
        const b = res.data?.breakdown || {};
        setQuote({
          catchPrice: Number(b.catchPrice || payCatch.price || 0),
          buyerFee: Number(b.buyerFee || 0),
          fisherFee: Number(b.fisherFee || 0),
          netToFisher: Number(b.netToFisher || (Number(b.catchPrice || payCatch.price || 0) - Number(b.fisherFee || 0))),
          deliveryFee: Number(b.deliveryFee || 0),
          total: Number(b.total || (Number(payCatch.price || 0) + Number(b.deliveryFee || 0))),
          distanceKm: Number(b.distanceKm || 0),
        });
        if (b.deliveryFee > 0) {
          setLastGoodQuote({
            catchPrice: Number(b.catchPrice || payCatch.price || 0),
            buyerFee: Number(b.buyerFee || 0),
            fisherFee: Number(b.fisherFee || 0),
            netToFisher: Number(b.netToFisher || (Number(b.catchPrice || payCatch.price || 0) - Number(b.fisherFee || 0))),
            deliveryFee: Number(b.deliveryFee || 0),
            total: Number(b.total || (Number(payCatch.price || 0) + Number(b.deliveryFee || 0))),
            distanceKm: Number(b.distanceKm || 0),
          });
        }
      } catch (e) {
        // fallback to default fee if quote fails
        if (lastGoodQuote) {
          setQuote(lastGoodQuote);
        } else {
          setQuote({
            catchPrice: Number(payCatch?.price || 0),
            buyerFee: 0,
            fisherFee: 0,
            netToFisher: Number(payCatch?.price || 0),
            deliveryFee: 0,
            total: Number(payCatch?.price || 0),
            distanceKm: 0,
          });
        }
        setQuoteInfoMsg('Unable to compute delivery fee. Please use your location or provide a more specific address.');
      } finally {
        setQuoting(false);
      }
    };
    timer = setTimeout(doQuote, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needDelivery, deliveryForm.address, deliveryForm.city, deliveryForm.lat, deliveryForm.lng, payCatch?.id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Market</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse verified catches. No login required.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fish Name</label>
              <input name="fishName" value={filters.fishName} onChange={onFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lake</label>
              <input name="lake" value={filters.lake} onChange={onFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Freshness</label>
              <select name="freshness" value={filters.freshness} onChange={onFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                <option value="">All</option>
                <option value="Fresh">Fresh</option>
                <option value="Processed">Processed</option>
                <option value="Frozen">Frozen</option>
                <option value="Dried">Dried</option>
                <option value="Wasted">Wasted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">National ID</label>
              <input name="nationalId" value={filters.nationalId} onChange={onFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Quick category tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {['ALL','Fresh','Processed','Frozen','Dried','Wasted'].map((c) => (
            <button key={c} onClick={() => { navigate({ pathname: '/market', search: `?category=${encodeURIComponent(c)}` }, { replace: true }); }} className={`px-3 py-1.5 rounded-full text-sm border ${category===c ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>
              {c === 'ALL' ? 'All' : c}
            </button>
          ))}
        </div>

        {category === 'Wasted' && (
          <div className="mb-6 p-4 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-amber-800 dark:text-amber-200">
            Looking for secondary products? Wasted fish are discounted and ideal for processing (fish meal, fertilizer, pet food, etc.). Verify details and place bulk orders easily.
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FiPackage className="mr-2" />
              Verified Catches
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : catches.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No catches found</p>
            ) : (
              <div className="space-y-8">
                {(category === 'ALL' ? ['Fresh','Processed','Frozen','Dried','Wasted'] : [category]).map((cat) => {
                  const itemsAll = catches.filter(c => norm(c.freshness) === norm(cat));
                  const items = itemsAll;
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{cat}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.fishName}</h3>
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded text-xs">Posted {timeAgo(item.createdAt)}</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">Verified</span>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <div><span className="font-medium">Weight:</span> {item.weight} kg</div>
                              <div>
                                <span className="font-medium">Price:</span> ETB {item.effectivePrice != null ? item.effectivePrice : item.price}
                                {item.discountApplied && (
                                  <span className="ml-2 text-xs text-emerald-700 dark:text-emerald-300">(2% freshness discount)</span>
                                )}
                              </div>
                              {refPricePerKg(item.fishName) != null && (
                                <div className="text-xs text-gray-500">
                                  <span className="font-medium">Reference:</span> ETB {refPricePerKg(item.fishName)} / kg • Est: ETB {(refPricePerKg(item.fishName) * (Number(item.weight)||0)).toFixed(2)}
                                </div>
                              )}
                              <div><span className="font-medium">Freshness:</span> {item.freshness} {String(item.freshness).toLowerCase() === 'wasted' && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Best for processing</span>
                              )}</div>
                              <div><span className="font-medium">Lake:</span> {item.lake}</div>
                            </div>
                            {item.fisher && (
                              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Fisher:</span> {item.fisher.name} - {item.fisher.phone}
                              </div>
                            )}
                            {item.qrEncrypted && (
                              <div className="mt-4 flex justify-center">
                                <QRCodeSVG value={item.qrEncrypted} size={96} />
                              </div>
                            )}
                            <div className="mt-4 flex space-x-2">
                              {isAuthenticated && user?.role === 'BUYER' ? (
                                <>
                                  <button onClick={() => handleOrder(item.id)} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Order</button>
                                  <button onClick={() => handleOrderAndPay(item.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Order & Pay</button>
                                </>
                              ) : (
                                <button onClick={() => navigate('/register')} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Order & Pay</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Delivery modal for Order & Pay */}
      {payCatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order & Pay: {payCatch.fishName}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Price: ETB {payCatch.price}</p>
            <div className="mt-4 space-y-3">
              <label className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-200">
                <input type="checkbox" checked={needDelivery} onChange={(e) => setNeedDelivery(e.target.checked)} />
                <span>Need delivery?</span>
              </label>
              {needDelivery && (
                <div className="space-y-3">
                  <input value={deliveryForm.address} onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })} placeholder="Address" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                  <input value={deliveryForm.city} onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })} placeholder="City/Region" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                  <input value={deliveryForm.contactName} onChange={(e) => setDeliveryForm({ ...deliveryForm, contactName: e.target.value })} placeholder="Contact name" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                  <input value={deliveryForm.phone} onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                  <div className="flex items-center space-x-2">
                    <button type="button" onClick={() => {
                      setLocStatus('Locating...');
                      if (!('geolocation' in navigator)) { setLocStatus('Geolocation not supported'); return; }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setDeliveryForm({ ...deliveryForm, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) });
                          setLocStatus('Location captured');
                        },
                        (err) => {
                          setLocStatus('Failed to get location');
                        },
                        { enableHighAccuracy: true, timeout: 10000 }
                      );
                    }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">Use my location</button>
                    {locStatus && <span className="text-xs text-gray-600 dark:text-gray-300">{locStatus}</span>}
                  </div>
                </div>
              )}
              <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 border-t pt-3 dark:border-gray-700">
                <div className="flex justify-between"><span>Order fee</span><span>ETB {quote.catchPrice || payCatch.price}</span></div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400"><span>Buyer fee (10%)</span><span>ETB {quote.buyerFee || 0}</span></div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400"><span>Fisher fee (5%)</span><span>ETB {quote.fisherFee || 0}</span></div>
                <div className="flex justify-between"><span>Delivery fee</span><span>{quoting ? 'Calculating…' : `ETB ${needDelivery ? quote.deliveryFee : 0}`}</span></div>
                {needDelivery && (
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400"><span>Distance</span><span>{quote.distanceKm?.toFixed ? quote.distanceKm.toFixed(2) : quote.distanceKm} km</span></div>
                )}
                <div className="flex justify-between font-semibold"><span>Total</span><span>ETB {needDelivery ? quote.total : (Number(quote.catchPrice || payCatch.price) + Number(quote.buyerFee || 0))}</span></div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400"><span>Net to fisher</span><span>ETB {quote.netToFisher || (Number(quote.catchPrice || payCatch.price) - Number(quote.fisherFee || 0))}</span></div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Delivery is charged at 10 ETB per km.</div>
                {quoteInfoMsg && <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">{quoteInfoMsg}</div>}
              </div>
            </div>
            <div className="mt-5 flex justify-end space-x-3">
              <button onClick={() => { setPayCatch(null); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300">Cancel</button>
              <button disabled={needDelivery && (!lastGoodQuote && (quoting || quote.deliveryFee <= 0))} onClick={async () => {
                if (needDelivery && (!lastGoodQuote && (quoting || quote.deliveryFee <= 0))) {
                  toast.error('Please provide delivery location to calculate the delivery fee.');
                  return;
                }
                try {
                  const payload = { catchId: payCatch.id, delivery: { needDelivery, ...(needDelivery ? deliveryForm : {}) } };
                  const res = await orderPaymentAPI.createAndPay(payload);
                  const url = res.data?.payment?.checkout_url;
                  if (url) window.open(url, '_blank');
                  toast.success('Redirecting to payment...');
                  setPayCatch(null);
                  // Optimistically remove from market
                  setCatches((prev) => prev.filter((c) => c.id !== payCatch.id));
                } catch (e) {
                  const msg = e.response?.data?.error || 'Failed to start payment';
                  toast.error(msg);
                }
              }} className={`px-4 py-2 rounded-md text-white ${needDelivery && (!lastGoodQuote && (quoting || quote.deliveryFee <= 0)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Continue to Pay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
