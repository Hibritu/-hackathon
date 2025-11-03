import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  FiShield,
  FiCheckCircle,
  FiPackage,
  FiTrendingUp,
  FiUsers,
  FiAnchor,
  FiBriefcase,
  FiShoppingBag
} from 'react-icons/fi';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const [slide, setSlide] = useState(0);

  const didYouKnow = [
    {
      title: 'Fish Meal Production',
      desc: 'Wasted fish are an excellent input for high-protein fish meal used in animal feeds.',
      color: 'from-amber-400 to-rose-500',
      img: (
        <svg viewBox="0 0 64 64" className="w-24 h-24">
          <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f59e0b"/><stop offset="1" stopColor="#ef4444"/></linearGradient></defs>
          <circle cx="32" cy="32" r="30" fill="url(#g1)" opacity="0.15"/>
          <path d="M10 38c8-8 18-12 28-12l8-6v24l-8-6C28 38 18 40 10 38z" fill="#f59e0b"/>
          <circle cx="45" cy="23" r="3" fill="#0f172a"/>
        </svg>
      )
    },
    {
      title: 'Organic Fertilizer',
      desc: 'Processed fish waste enriches soils as organic fertilizer for crops and gardens.',
      color: 'from-emerald-400 to-teal-500',
      img: (
        <svg viewBox="0 0 64 64" className="w-24 h-24">
          <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#10b981"/><stop offset="1" stopColor="#14b8a6"/></linearGradient></defs>
          <circle cx="32" cy="32" r="30" fill="url(#g2)" opacity="0.15"/>
          <path d="M20 40c0-8 6-16 12-16s12 8 12 16H20z" fill="#10b981"/>
          <path d="M32 12v10" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
          <path d="M28 18c2-4 6-4 8 0" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: 'Pet Food & Treats',
      desc: 'Economical ingredient for pet foods and treats with traceable origins.',
      color: 'from-sky-400 to-indigo-500',
      img: (
        <svg viewBox="0 0 64 64" className="w-24 h-24">
          <defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#38bdf8"/><stop offset="1" stopColor="#6366f1"/></linearGradient></defs>
          <circle cx="32" cy="32" r="30" fill="url(#g3)" opacity="0.15"/>
          <path d="M16 36c6-6 14-9 22-9l6-5v20l-6-5c-8 0-16 1-22-1z" fill="#38bdf8"/>
          <circle cx="44" cy="24" r="3" fill="#0f172a"/>
        </svg>
      )
    },
  ];

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % didYouKnow.length), 4000);
    return () => clearInterval(id);
  }, []);

  const features = [
    { icon: <FiShield className="w-8 h-8" />, title: 'Verified Quality', description: 'Agent-verified catches to ensure authenticity and freshness.' },
    { icon: <FiCheckCircle className="w-8 h-8" />, title: 'QR Traceability', description: 'Scan to trace from lake to plate with tamper-proof QR.' },
    { icon: <FiPackage className="w-8 h-8" />, title: 'Fast Delivery', description: 'Distance-based delivery directly from the lakeside.' },
    { icon: <FiTrendingUp className="w-8 h-8" />, title: 'Fair & Transparent', description: 'Clear pricing, fees, and fisher earnings—no surprises.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center mb-6">
          <FiAnchor className="w-16 h-16 text-cyan-500" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
          <span className="brand-gradient">Connect Lakes to Plates</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          A trusted fish marketplace for Fishers, Restaurants & Hotels, and Consumers—
          built on QR traceability, fair pricing, and fresh delivery.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="btn-primary">Create Account</Link>
              <Link to="/market" className="btn-secondary">Explore Market</Link>
              <Link to="/verify" className="btn-secondary">Verify QR</Link>
            </>
          ) : (
            <>
              <Link to="/market" className="btn-primary">Buy Fresh Fish</Link>
              <Link to="/verify" className="btn-secondary">Verify QR</Link>
            </>
          )}
        </div>
        <div className="mt-8 mx-auto max-w-2xl">
          <div className="divider-wave" />
        </div>
      </div>

      {/* Audience Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">Made for everyone in the seafood chain</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center mb-3 text-cyan-500"><FiUsers className="mr-2" /> Fishers</div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">List catches in minutes, get verified, earn transparently, and request payouts securely.</p>
            <Link to="/register" className="btn-primary w-full text-center">Start as Fisher</Link>
          </div>
          <div className="card">
            <div className="flex items-center mb-3 text-blue-500"><FiBriefcase className="mr-2" /> Restaurants & Hotels</div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Source traceable, fresh fish with QR-backed authenticity and delivery tracking.</p>
            <Link to="/market" className="btn-primary w-full text-center">Shop for your kitchen</Link>
          </div>
          <div className="card">
            <div className="flex items-center mb-3 text-sky-500"><FiShoppingBag className="mr-2" /> Consumers</div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Buy directly from fishers, verify quality by QR, and enjoy fair transparent prices.</p>
            <Link to="/market" className="btn-primary w-full text-center">Explore Market</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">Why FishLink?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card hover:shadow-lg transition">
              <div className="text-cyan-500 mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wasted Fish for Secondary Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card border-amber-200 dark:border-amber-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-1">Wasted Fish for Secondary Products</h3>
              <p className="text-gray-700 dark:text-gray-300">Discounted catches ideal for processing: fish meal, fertilizer, pet food and more. Verified supply with QR, transparent pricing, and easy bulk ordering.</p>
            </div>
            <div className="flex-shrink-0">
              <Link to="/market?category=Wasted" className="btn-primary">Shop Wasted Category</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Did you know slider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Did you know?</h3>
        <div className="relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700/60">
          <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {didYouKnow.map((s, i) => (
              <div key={i} className="min-w-full p-6 flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur">
                <div className="flex-1 pr-4">
                  <div className={`inline-block px-2 py-1 rounded-full text-xs text-white bg-gradient-to-r ${s.color} mb-3`}>Wasted fish use case</div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{s.title}</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{s.desc}</p>
                  <Link to="/market?category=Wasted" className="btn-primary">Source Wasted Fish</Link>
                </div>
                <div className="flex-shrink-0">{s.img}</div>
              </div>
            ))}
          </div>
          {/* Controls */}
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
            {didYouKnow.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className={`h-2 w-2 rounded-full ${slide===i ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`} aria-label={`Slide ${i+1}`}></button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center py-8">
          <div className="card py-6"><div className="text-3xl font-extrabold brand-gradient">99%</div><div className="text-sm text-gray-600 dark:text-gray-300">Verified Catches</div></div>
          <div className="card py-6"><div className="text-3xl font-extrabold brand-gradient">24h</div><div className="text-sm text-gray-600 dark:text-gray-300">Avg. Delivery</div></div>
          <div className="card py-6"><div className="text-3xl font-extrabold brand-gradient">10% + 5%</div><div className="text-sm text-gray-600 dark:text-gray-300">Transparent Fees</div></div>
          <div className="card py-6"><div className="text-3xl font-extrabold brand-gradient">QR</div><div className="text-sm text-gray-600 dark:text-gray-300">End‑to‑End Traceability</div></div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                1. Fisher Registers Catch
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fishers register their catch with details like fish type, weight, price, and location.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                2. Agent Verifies
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Agents verify the catch quality and authenticity, generating a QR code for traceability.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                3. Buyer Orders
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Buyers browse verified catches, place orders, and track delivery with QR verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Ready to dive in?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Join FishLink and make seafood sourcing transparent, fair, and fast.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn-primary">Get Started</Link>
          <Link to="/market" className="btn-secondary">Browse Market</Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;