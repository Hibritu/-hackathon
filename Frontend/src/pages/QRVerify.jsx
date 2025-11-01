import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { QrCode, CheckCircle, Fish, MapPin, Calendar, User } from 'lucide-react'

const QRVerify = () => {
  const [encryptedData, setEncryptedData] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifiedData, setVerifiedData] = useState(null)

  const handleVerify = async (e) => {
    e.preventDefault()
    
    if (!encryptedData.trim()) {
      toast.error('Please enter QR code data')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/verify', { encrypted: encryptedData })
      setVerifiedData(response.data)
      toast.success('QR code verified successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to verify QR code')
      setVerifiedData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-aqua-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <QrCode className="w-20 h-20 mx-auto text-primary-600 dark:text-aqua-400 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Verify Fish QR Code
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enter the encrypted QR code data to verify fish traceability
          </p>
        </div>

        <div className="card mb-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="encrypted" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                QR Code Data (Encrypted)
              </label>
              <textarea
                id="encrypted"
                rows="4"
                value={encryptedData}
                onChange={(e) => setEncryptedData(e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="Paste the encrypted QR code data here..."
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Scan a QR code or paste the encrypted data to verify
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Verify QR Code</span>
                </>
              )}
            </button>
          </form>
        </div>

        {verifiedData && verifiedData.verified && (
          <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                Verified Fish Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Fish className="w-6 h-6 text-primary-600 dark:text-aqua-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fish Name</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {verifiedData.catch.fishName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-primary-600 dark:text-aqua-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Origin Lake</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {verifiedData.catch.lake}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-6 h-6 text-primary-600 dark:text-aqua-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fisher</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {verifiedData.catch.fisher.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {verifiedData.catch.fisher.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Weight</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {verifiedData.catch.weight} kg
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Price</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ETB {verifiedData.catch.price}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Freshness</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {verifiedData.catch.freshness}
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-6 h-6 text-primary-600 dark:text-aqua-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Caught Date</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(verifiedData.catch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <p className="font-semibold">
                  {verifiedData.catch.verified ? 'Verified by Agent/Admin' : 'Pending Verification'}
                </p>
              </div>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                This fish has been registered in the FishLink system and its origin has been verified.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRVerify

