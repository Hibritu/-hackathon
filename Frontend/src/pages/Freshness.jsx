import { useState } from 'react';
import { fishFreshnessAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiCamera, FiLink2 } from 'react-icons/fi';

const Freshness = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDetectFile = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please choose an image');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('image', imageFile);
      const res = await fishFreshnessAPI.detect(form);
      setResult(res.data);
      toast.success('Analysis complete');
    } catch (err) {
      const msg = err.response?.data?.error || 'Detection failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectUrl = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    setLoading(true);
    try {
      const res = await fishFreshnessAPI.detectUrl({ imageUrl });
      setResult(res.data);
      toast.success('Analysis complete');
    } catch (err) {
      const msg = err.response?.data?.error || 'Detection failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fish Freshness Detection</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Upload an image or provide an image URL to analyze fish freshness using the AI model.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleDetectFile} className="space-y-3 border p-4 rounded-md dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full" />
              <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                <FiCamera className="mr-2" />
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </form>

            <form onSubmit={handleDetectUrl} className="space-y-3 border p-4 rounded-md dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/fish.jpg" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                <FiLink2 className="mr-2" />
                {loading ? 'Analyzing...' : 'Analyze URL'}
              </button>
            </form>
          </div>

          {result && (
            <div className="mt-6 p-4 rounded-md border dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Result</h2>
              <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Freshness:</span> {result.freshness || 'Unknown'}</p>
              {result.confidencePercent && (
                <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Confidence:</span> {result.confidencePercent}%</p>
              )}
              {Array.isArray(result.allPredictions) && result.allPredictions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Predictions:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                    {result.allPredictions.map((p, i) => (
                      <li key={i}>{p.class} - {p.confidencePercent}%</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Freshness;
