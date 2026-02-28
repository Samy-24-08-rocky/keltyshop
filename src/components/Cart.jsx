import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiHeart, FiClock } from 'react-icons/fi';

const Cart = ({ isOpen, toggleCart, cartItems, removeFromCart, updateQuantity }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [savedForLater, setSavedForLater] = useState([]);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 3.99 : 0;
  const tax = subtotal * 0.05;
  const discount = discountApplied ? subtotal * 0.1 : 0; // 10% discount
  const total = subtotal + shipping + tax - discount;

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'SAVE10') {
      setDiscountApplied(true);
      
      // Show notification
      const event = new CustomEvent('cartNotification', { 
        detail: { 
          message: 'Discount code applied! 10% off your order',
          type: 'success'
        } 
      });
      window.dispatchEvent(event);
    } else {
      // Show error notification
      const event = new CustomEvent('cartNotification', { 
        detail: { 
          message: 'Invalid discount code',
          type: 'error'
        } 
      });
      window.dispatchEvent(event);
    }
  };

  const moveToSaved = (item) => {
    setSavedForLater(prev => [...prev, item]);
    removeFromCart(item.id);
    
    // Show notification
    const event = new CustomEvent('cartNotification', { 
      detail: { 
        message: `${item.name} moved to saved items`,
        type: 'info'
      } 
    });
    window.dispatchEvent(event);
  };

  const moveToCart = (item) => {
    // Add to cart
    const event = new CustomEvent('addToCart', { 
      detail: { 
        ...item,
        quantity: 1
      } 
    });
    window.dispatchEvent(event);
    
    // Remove from saved
    setSavedForLater(prev => prev.filter(i => i.id !== item.id));
    
    // Show notification
    const notificationEvent = new CustomEvent('cartNotification', { 
      detail: { 
        message: `${item.name} moved to cart`,
        type: 'success'
      } 
    });
    window.dispatchEvent(notificationEvent);
  };

  const clearSavedItem = (id) => {
    setSavedForLater(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen">
        <div 
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={toggleCart}
          aria-hidden="true"
        ></div>
        
        <div className={`relative ml-auto max-w-md w-full h-full transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900" id="slide-over-title">
                  Shopping cart
                </h2>
                <div className="ml-3 h-7 flex items-center">
                  <button
                    type="button"
                    className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={toggleCart}
                  >
                    <span className="sr-only">Close panel</span>
                    <FiX className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {cartItems.length === 0 && savedForLater.length === 0 ? (
                <div className="mt-16 flex flex-col items-center justify-center">
                  <FiShoppingBag className="h-24 w-24 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
                  <p className="mt-2 text-gray-500">Start adding some delicious items to your cart</p>
                  <button
                    onClick={toggleCart}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {cartItems.length > 0 && (
                    <div className="mt-8">
                      <div className="flow-root">
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <li key={item.id} className="py-6 flex">
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
                                      <FiMinus className="h-4 w-4" />
                                    </button>
                                    <span className="px-2">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="px-2 py-1 text-gray-600 hover:text-gray-800"
                                    >
                                      <FiPlus className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <div className="flex space-x-4">
                                    <button
                                      onClick={() => moveToSaved(item)}
                                      type="button"
                                      className="font-medium text-blue-600 hover:text-blue-500 flex items-center"
                                    >
                                      <FiHeart className="mr-1" /> Save
                                    </button>
                                    <button
                                      onClick={() => removeFromCart(item.id)}
                                      type="button"
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
                    </div>
                  )}

                  {savedForLater.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FiHeart className="mr-2 text-red-500" /> Saved for later ({savedForLater.length})
                      </h3>
                      <ul role="list" className="divide-y divide-gray-200">
                        {savedForLater.map((item) => (
                          <li key={item.id} className="py-4 flex">
                            <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-center object-cover"
                              />
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <h4 className="text-base font-medium text-gray-900">{item.name}</h4>
                                <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                              </div>
                              <div className="flex-1 flex items-end justify-between">
                                <p className="text-sm font-medium text-gray-900">£{item.price.toFixed(2)}</p>
                                <div className="flex space-x-4">
                                  <button
                                    onClick={() => moveToCart(item)}
                                    className="text-sm font-medium text-red-600 hover:text-red-500"
                                  >
                                    Move to cart
                                  </button>
                                  <button
                                    onClick={() => clearSavedItem(item.id)}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>£{subtotal.toFixed(2)}</p>
                  </div>
                  
                  {discountApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <p>Discount (SAVE10)</p>
                      <p>-£{discount.toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Shipping</p>
                    <p>£{shipping.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Tax</p>
                    <p>£{tax.toFixed(2)}</p>
                  </div>
                  
                  {/* Discount Code Input */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        disabled={discountApplied}
                      />
                      <button
                        onClick={applyDiscount}
                        disabled={discountApplied}
                        className={`px-4 py-2 rounded-r-md font-medium ${
                          discountApplied
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 text-white hover:bg-gray-900'
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200">
                    <p>Total</p>
                    <p>£{total.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Free shipping progress */}
                {subtotal < 30 && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiClock className="text-red-500 mr-2" />
                      <p className="text-sm font-medium text-gray-900">
                        Add £{(30 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-red-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min((subtotal / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    onClick={toggleCart}
                    className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:bg-red-700"
                  >
                    Checkout
                  </Link>
                </div>
                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    or{' '}
                    <button
                      type="button"
                      className="text-red-600 font-medium hover:text-red-500"
                      onClick={toggleCart}
                    >
                      Continue Shopping<span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;