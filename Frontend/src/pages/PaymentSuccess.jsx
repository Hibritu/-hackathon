import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const txRef = params.get('tx_ref') || '';
  const status = params.get('status') || 'success';

  useEffect(() => {
    // Optionally we could poll backend /api/chapa/verify/:tx_ref here if needed
  }, [txRef]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment {status === 'success' ? 'Successful' : 'Result'}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {status === 'success' ? 'Thank you! Your payment was processed.' : 'Returned from payment gateway.'}
        </p>
        {txRef && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Transaction Ref: <span className="font-mono">{txRef}</span></p>
        )}
        <div className="space-x-3">
          <Link to="/dashboard/buyer" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Go to My Orders</Link>
          <Link to="/" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
