import { useState } from 'react';
import api from '../services/api';
import { Sparkles, Upload, Image as ImageIcon, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const FreshnessDetector = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setImageUrl('');
      setResult(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/fish-freshness/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/api/fish-freshness/detect-url', {
        imageUrl: imageUrlInput,
      });

      setResult(response.data);
      setImageUrl(imageUrlInput);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-16 h-16 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Freshness Detector</h1>
        <p className="text-gray-600">Upload a fish image to check its freshness using AI</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
          
          {imageUrl ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <Loader className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>{loading ? 'Analyzing...' : 'Analyze Freshness'}</span>
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setImageUrl('');
                  setResult(null);
                }}
                className="btn-secondary w-full"
              >
                Change Image
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          )}
        </div>

        {/* URL Input Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Or Use Image URL</h2>
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="input-field"
              placeholder="https://example.com/fish.jpg"
            />
            <button
              type="submit"
              disabled={loading || !imageUrlInput.trim()}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <ImageIcon className="w-5 h-5" />
              <span>{loading ? 'Analyzing...' : 'Analyze from URL'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            {result.freshness === 'fresh' ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <h2 className="text-xl font-semibold">Analysis Results</h2>
          </div>

          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${
              result.freshness === 'fresh' 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Freshness Status</p>
                <p className={`text-3xl font-bold mb-2 ${
                  result.freshness === 'fresh' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.freshness === 'fresh' ? 'FRESH' : 'NOT FRESH'}
                </p>
                <p className="text-sm text-gray-600">
                  Confidence: {result.confidencePercent}%
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{result.message}</p>
            </div>

            {result.allPredictions && result.allPredictions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">All Predictions:</h3>
                <div className="space-y-2">
                  {result.allPredictions.map((pred, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium capitalize">{pred.class}</span>
                      <span className="text-primary-600 font-semibold">
                        {pred.confidencePercent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.analyzedAt && (
              <div className="text-sm text-gray-500 text-center">
                Analyzed at: {new Date(result.analyzedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreshnessDetector;

