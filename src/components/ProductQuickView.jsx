import React, { useState } from 'react';
import { FiX, FiShoppingCart, FiHeart } from 'react-icons/fi';

const ProductQuickView = ({ product, isOpen, onClose, addToCart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX className="h-6 w-6" />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="h-96 overflow-hidden rounded-xl">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <div className="mt-2 flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-500">({product.rating})</span>
            </div>
            
            <div className="mt-4">
              <span className="text-xl font-bold text-red-600">
                £{product.price.toFixed(2)}
              </span>
              {product.oldPrice && (
                <span className="ml-2 text-gray-500 line-through">
                  £{product.oldPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <p className="mt-4 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            
            <div className="mt-6 flex items-center">
              <div className="flex items-center border border-gray-300 rounded-md mr-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1 text-gray-600"
                >
                  -
                </button>
                <span className="px-3">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-1 text-gray-600"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={() => {
                  addToCart({...product, quantity});
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-2 px-4 rounded-md hover:from-red-700 hover:to-red-600 transition-colors"
              >
                Add to Cart
              </button>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button className="flex items-center text-gray-600 hover:text-red-600">
                <FiHeart className="mr-1" /> Add to Wishlist
              </button>
              <button className="flex items-center text-gray-600 hover:text-red-600">
                <FiShoppingCart className="mr-1" /> View in Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;