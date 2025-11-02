import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';
import { QrCode, Camera, Upload, CheckCircle, XCircle, Fish } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyQR = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setScanning(true);
      setResult(null);
      
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleVerify(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );
    } catch (error) {
      toast.error('Failed to start camera');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (error) {
        // Ignore errors
      }
    }
    setScanning(false);
  };

  const handleVerify = async (encryptedData) => {
    setLoading(true);
    try {
      const response = await api.post('/api/verify', { encrypted: encryptedData });
      setResult({
        verified: response.data.verified,
        catch: response.data.catch,
        message: response.data.message,
      });
      toast.success('QR code verified successfully!');
    } catch (error) {
      setResult({
        verified: false,
        message: error.response?.data?.error || 'Verification failed',
      });
      toast.error('QR code verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleVerify(manualInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <QrCode className="w-16 h-16 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify QR Code</h1>
        <p className="text-gray-600">Scan or enter QR code to verify fish authenticity</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
          
          {!scanning ? (
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <button
                onClick={startScanning}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Start Scanning</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div id="qr-reader" className="aspect-square rounded-lg overflow-hidden"></div>
              <button
                onClick={stopScanning}
                className="btn-secondary w-full"
              >
                Stop Scanning
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Manual Entry</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="input-field h-32 resize-none"
              placeholder="Paste QR code data here..."
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>{loading ? 'Verifying...' : 'Verify'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            {result.verified ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <h2 className="text-xl font-semibold">
              {result.verified ? 'Verification Successful' : 'Verification Failed'}
            </h2>
          </div>

          {result.verified && result.catch ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Fish Name</p>
                  <p className="font-semibold text-lg">{result.catch.fishName}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold text-lg">{result.catch.weight} kg</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Lake</p>
                  <p className="font-semibold text-lg">{result.catch.lake}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Freshness</p>
                  <p className="font-semibold text-lg">{result.catch.freshness}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold text-lg text-primary-600">
                    ETB {parseFloat(result.catch.price).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-lg text-green-600">Verified</p>
                </div>
              </div>
              {result.catch.fisher && (
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">
                    <strong>Fisher:</strong> {result.catch.fisher.name}
                  </p>
                </div>
              )}
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium">
                  ✓ This fish is authentic and traceable
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-700">{result.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyQR;

