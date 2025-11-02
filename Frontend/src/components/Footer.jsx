const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">FishLink</h3>
            <p className="text-gray-400">
              Fresh Fish Trace Management System - Ensuring transparency and quality in fish supply chain.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white">Home</a>
              </li>
              <li>
                <a href="/verify" className="hover:text-white">Verify QR</a>
              </li>
              <li>
                <a href="/login" className="hover:text-white">Login</a>
              </li>
              <li>
                <a href="/register" className="hover:text-white">Register</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-gray-400">
              For support and inquiries, please contact us through the dashboard.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FishLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

