// src/pages/Shop.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import FeaturedProducts from '../components/FeaturedProducts';

const Shop = ({ addToCart }) => {
  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Browse our full selection of fresh groceries
          </p>
        </div>
        <FeaturedProducts addToCart={addToCart} expanded={true} />
      </div>
    </div>
  );
};

export default Shop;