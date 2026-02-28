import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

const ProductComparison = ({ products }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleProduct = (product) => {
    setSelectedProducts(prev => 
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product].slice(0, 4) // Limit to 4 products
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {selectedProducts.length > 0 && (
        <button
          onClick={() => setShowComparison(true)}
          className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:from-red-700 hover:to-red-600 transition-colors"
        >
          Compare ({selectedProducts.length})
        </button>
      )}
      
      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Product Comparison</h2>
              <button onClick={() => setShowComparison(false)}>
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="p-4 text-left">Features</th>
                    {selectedProducts.map(product => (
                      <th key={product.id} className="p-4 text-center">
                        <div className="w-48 mx-auto">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="h-32 object-contain mx-auto"
                          />
                          <h3 className="mt-2 font-medium">{product.name}</h3>
                          <p className="text-red-600 font-bold">£{product.price.toFixed(2)}</p>
                          <button
                            onClick={() => toggleProduct(product)}
                            className="mt-2 text-xs text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Rating</td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        {product.rating}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Category</td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        {product.category}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Stock</td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        {product.stock > 10 
                          ? "In Stock" 
                          : product.stock > 0 
                            ? `Only ${product.stock} left` 
                            : "Out of Stock"}
                      </td>
                    ))}
                  </tr>
                  {/* Add more comparison rows as needed */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Add to product card in FeaturedProducts */}
      <button 
        onClick={() => toggleProduct(product)}
        className={`absolute top-2 right-2 p-2 rounded-full ${
          selectedProducts.some(p => p.id === product.id)
            ? 'bg-red-500 text-white'
            : 'bg-white text-gray-600'
        }`}
      >
        <FiPlus />
      </button>
    </div>
  );
};

export default ProductComparison;