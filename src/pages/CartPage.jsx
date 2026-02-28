import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiArrowLeft, FiHeart, FiTrash2 } from 'react-icons/fi';

const CartPage = ({ cartItems, removeFromCart, updateQuantity, addToCart }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const discount = discountApplied ? subtotal * 0.1 : 0; // 10% discount
  const total = subtotal + tax - discount;

  const moveToSaved = (item) => {
    setSavedItems(prev => [...prev, item]);
    removeFromCart(item.id);
  };

  const moveToCart = (item) => {
    addToCart({...item, quantity: 1});
    setSavedItems(prev => prev.filter(i => i.id !== item.id));
  };

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'SAVE10') {
      setDiscountApplied(true);
    }
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-red-600 hover:text-red-800 mb-6">
          <FiArrowLeft className="mr-2" /> Continue Shopping
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
        
        {cartItems.length === 0 && savedItems.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center py-12">
            <FiShoppingBag className="h-24 w-24 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Start adding some delicious items to your cart</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:bg-red-700"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              {cartItems.length > 0 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                  <h2 className="text-xl font-semibold p-6 border-b">Cart Items ({cartItems.length})</h2>
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="p-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.name}</h3>
                              <p className="ml-4">£{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 text-gray-600 hover:text-gray-800"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-2">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-gray-600 hover:text-gray-800"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex space-x-4">
                              <button
                                onClick={() => moveToSaved(item)}
                                className="font-medium text-blue-600 hover:text-blue-500 flex items-center"
                              >
                                <FiHeart className="mr-1" /> Save
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="font-medium text-red-600 hover:text-red-500 flex items-center"
                              >
                                <FiTrash2 className="mr-1" /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {savedItems.length > 0 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <h2 className="text-xl font-semibold p-6 border-b flex items-center">
                    <FiHeart className="mr-2 text-red-500" /> Saved for Later ({savedItems.length})
                  </h2>
                  <ul className="divide-y divide-gray-200">
                    {savedItems.map((item) => (
                      <li key={item.id} className="p-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.name}</h3>
                              <p className="ml-4">£{item.price.toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <button
                              onClick={() => moveToCart(item)}
                              className="font-medium text-red-600 hover:text-red-500"
                            >
                              Move to Cart
                            </button>
                            <button
                              onClick={() => setSavedItems(prev => prev.filter(i => i.id !== item.id))}
                              className="font-medium text-gray-600 hover:text-gray-500 flex items-center"
                            >
                              <FiTrash2 className="mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-8 lg:mt-0 lg:col-span-4">
              <div className="bg-white shadow sm:rounded-lg p-6 sticky top-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">£{subtotal.toFixed(2)}</p>
                  </div>
                  
                  {discountApplied && (
                    <div className="flex justify-between text-green-600">
                      <p className="text-sm">Discount (SAVE10)</p>
                      <p className="text-sm font-medium">-£{discount.toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Tax</p>
                    <p className="text-sm font-medium text-gray-900">£{tax.toFixed(2)}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <p className="text-base font-medium text-gray-900">Total</p>
                    <p className="text-base font-bold text-gray-900">£{total.toFixed(2)}</p>
                  </div>
                </div>
                
                {!discountApplied && (
                  <div className="mt-6">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        onClick={applyDiscount}
                        className="px-4 py-2 bg-gray-800 text-white rounded-r-md hover:bg-gray-900"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:bg-red-700"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
                <div className="mt-6 text-center">
                  <Link 
                    to="/shop" 
                    className="text-red-600 hover:text-red-500 text-sm font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;