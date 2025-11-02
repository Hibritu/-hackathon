import { useState, useRef } from 'react';
import { verifyAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { MdQrCode } from 'react-icons/md';

const QRVerify = () => {
  const [encryptedData, setEncryptedData] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleVerify = async () => {
    if (!encryptedData.trim()) {
      toast.error('Please enter QR code data or scan a QR code');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyAPI.verifyQR({ encrypted: encryptedData });
      setVerificationResult(response.data);
      toast.success('QR code verified successfully!');
    } catch (error) {
      const message = error.response?.data?.error || 'Verification failed';
      setVerificationResult({ verified: false, error: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo purposes, we'll read as text
    // In production, you'd use a QR scanner library
    const reader = new FileReader();
    reader.onload = (event) => {
      // This is a simplified version - in production, use a QR code reader
      const text = event.target.result;
      setEncryptedData(text.trim());
      toast.success('QR code data loaded. Click Verify to check.');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setEncryptedData('');
    setVerificationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <MdQrCode className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Verify Fish Catch QR Code
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter or scan the QR code to verify fish traceability
            </p>
          </div>

          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label
                htmlFor="qr-data"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                QR Code Data
              </label>
              <textarea
                id="qr-data"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Paste QR code encrypted data here..."
                value={encryptedData}
                onChange={(e) => setEncryptedData(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleVerify}
                disabled={loading || !encryptedData.trim()}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  <>
                    <FiCheckCircle className="mr-2" />
                    Verify QR Code
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
              >
                <FiXCircle className="mr-2" />
                Clear
              </button>

              <label className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                <FiCamera className="mr-2" />
                Scan
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div
                className={`p-6 rounded-lg ${
                  verificationResult.verified
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                {verificationResult.verified ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <FiCheckCircle className="w-8 h-8 text-green-600 mr-2" />
                      <h3 className="text-xl font-semibold text-green-800 dark:text-green-300">
                        Verification Successful!
                      </h3>
                    </div>
                    {verificationResult.catch && (
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Fish Name:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {verificationResult.catch.fishName}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Weight:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {verificationResult.catch.weight} kg
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Price:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              ETB {verificationResult.catch.price}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Freshness:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {verificationResult.catch.freshness}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Lake:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {verificationResult.catch.lake}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Verified:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {verificationResult.catch.verified ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                        {verificationResult.catch.fisher && (
                          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Fisher Information:
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              {verificationResult.catch.fisher.name} - {verificationResult.catch.fisher.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FiXCircle className="w-8 h-8 text-red-600 mr-2" />
                    <div>
                      <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">
                        Verification Failed
                      </h3>
                      <p className="text-red-600 dark:text-red-400 mt-1">
                        {verificationResult.error || 'Invalid QR code'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRVerify;

