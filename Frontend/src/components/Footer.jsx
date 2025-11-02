import { Fish } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Fish className="w-6 h-6 text-aqua-400" />
              <span className="text-xl font-bold text-aqua-400">FishLink</span>
            </div>
            <p className="text-gray-400">
              Fair, Fresh, and Fully Traceable Fish Marketplace
            </p>
            <p className="text-sm text-gray-500 mt-2 italic">
              From Fisherman to Fork
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-aqua-400 transition-colors">Home</a></li>
              <li><a href="/verify" className="hover:text-aqua-400 transition-colors">Verify QR Code</a></li>
              <li><a href="/login" className="hover:text-aqua-400 transition-colors">Login</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-gray-400">
              Empowering Ethiopian fishers by increasing their income, eliminating middlemen, 
              and bringing digital traceability and trust to local fish trade.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FishLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

