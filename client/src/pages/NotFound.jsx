import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <p className="text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <HomeIcon className="w-5 h-5" />
            Back to Home
          </Link>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
