import { Link } from 'react-router-dom'
import { Fish, Shield, TrendingUp, Users, QrCode } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Landing = () => {
  const { user } = useAuth()

  const roles = [
    { name: 'Fisher', icon: Fish, path: '/fisher', color: 'bg-primary-600' },
    { name: 'Agent', icon: Users, path: '/agent', color: 'bg-aqua-600' },
    { name: 'Buyer', icon: TrendingUp, path: '/buyer', color: 'bg-green-600' },
    { name: 'Admin', icon: Shield, path: '/admin', color: 'bg-purple-600' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-aqua-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Fish className="w-20 h-20 mx-auto mb-6 animate-bounce" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              FishLink
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              Fair, Fresh, and Fully Traceable Fish Marketplace
            </p>
            <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
              Empowering Ethiopian fishers by increasing their income, eliminating middlemen, 
              and bringing digital traceability and trust to local fish trade.
            </p>
            {!user && (
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                  Get Started
                </Link>
                <Link to="/verify" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors text-lg">
                  Verify QR Code
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why FishLink?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary-600" />
              <h3 className="text-xl font-semibold mb-2">Fully Traceable</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every fish comes with an encrypted QR code that traces its origin from the fisherman to your fork.
              </p>
            </div>
            <div className="card text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-aqua-600" />
              <h3 className="text-xl font-semibold mb-2">Fair Income</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fishers get fair prices directly, eliminating middlemen and increasing their earnings.
              </p>
            </div>
            <div className="card text-center">
              <QrCode className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">Verified Quality</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All fish are verified by agents before being available for purchase, ensuring freshness and quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      {!user && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Login as
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <Link
                    key={role.name}
                    to={`/login?role=${role.name.toLowerCase()}`}
                    className={`${role.color} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-center`}
                  >
                    <Icon className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">{role.name}</h3>
                    <p className="text-sm mt-2 opacity-90">
                      {role.name === 'Fisher' && 'Register and sell your catch'}
                      {role.name === 'Agent' && 'Verify and manage fish listings'}
                      {role.name === 'Buyer' && 'Browse and buy verified fish'}
                      {role.name === 'Admin' && 'Monitor the entire platform'}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-aqua-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join FishLink today and be part of the transparent fish trade revolution.
          </p>
          {!user && (
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors text-lg inline-block">
              Create Account
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Landing

