// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-600">404</h1>
        <h2 className="text-2xl font-medium text-gray-900 mt-4">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="mt-6 inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;