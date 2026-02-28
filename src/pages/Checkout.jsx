import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiAlertCircle, FiLock } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';

const Checkout = ({ cartItems = [], clearCart }) => {
  const { settings, addOrder, updateProduct, products } = useAdmin();
  const { user } = useAuth();
  const isManualConfirm = settings?.orderConfirmation === 'manual';
  const taxRate = (settings?.taxRate ?? 5) / 100;

  const [formData, setFormData] = useState({
    email: user?.email || '', firstName: '', lastName: '',
    address: '', city: '', postalCode: '', phone: '',
  });
  const [applePayClicked, setApplePayClicked] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

  // Login guard — redirect/show message if not logged in
  if (!user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: "'Inter',sans-serif", padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(229,62,62,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <FiLock size={32} color="#e53e3e" />
        </div>
        <h2 style={{ fontWeight: 800, color: '#1a202c', fontSize: '1.5rem', margin: 0 }}>Sign in to Checkout</h2>
        <p style={{ color: '#718096', maxWidth: 340, margin: '0.25rem 0 1.25rem' }}>
          You need to be signed in so we can track your order and send you updates.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/login" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#e53e3e,#c53030)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(229,62,62,0.3)' }}>Sign In</Link>
          <Link to="/register" style={{ padding: '0.75rem 2rem', border: '1.5px solid #e53e3e', color: '#e53e3e', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>Create Account</Link>
        </div>
        <Link to="/cart" style={{ marginTop: '0.25rem', color: '#718096', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Cart</Link>
      </div>
    );
  }

  // Totals — no delivery fee
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Build and save order to admin dashboard
    const newOrder = {
      customer: `${formData.firstName} ${formData.lastName}`.trim() || 'Guest',
      email: formData.email,
      address: `${formData.address}, ${formData.city} ${formData.postalCode}`.trim(),
      phone: formData.phone,
      date: new Date().toISOString().slice(0, 10),
      items: cartItems.reduce((s, i) => s + i.quantity, 0),
      total: parseFloat(total.toFixed(2)),
      status: 'processing',
      delivery: 'Standard',
      products: cartItems.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price })),
      cartItems: cartItems.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
    };
    addOrder(newOrder);

    // 2. Decrement stock for each ordered item automatically
    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        updateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) });
      }
    });

    // 3. Clear the cart
    if (clearCart) clearCart();

    setOrderPlaced(true);
    // Redirect to My Orders so customer sees their live order status
    setTimeout(() => navigate('/orders'), 3500);
  };

  // ── Order Confirmed screen ────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${isManualConfirm ? 'bg-yellow-100' : 'bg-green-100'}`}>
            {isManualConfirm
              ? <FiAlertCircle className="h-8 w-8 text-yellow-600" />
              : <FiCheck className="h-8 w-8 text-green-600" />}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isManualConfirm ? 'Order Received!' : 'Order Confirmed!'}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {isManualConfirm
              ? 'Your order is pending admin approval. You will be notified once it is confirmed.'
              : 'Thank you for your order. You will receive a confirmation email shortly.'}
          </p>
          <p className="mt-2 text-sm text-gray-500">Redirecting you to the home page…</p>
          <Link to="/shop" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:bg-red-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty cart guard ──────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Add some items before checking out.</p>
          <Link to="/shop" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:bg-red-700">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  // ── Main checkout ─────────────────────────────────────────────────────────────
  return (
    <div className="py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/cart" className="inline-flex items-center text-red-600 hover:text-red-800 mb-6">
          <FiArrowLeft className="mr-2" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── LEFT column ── */}
          <div>
            {/* Contact */}
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500" required />
              </div>
            </div>

            {/* Shipping Address */}
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500" required />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500" required />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500" required />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500" required />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500" required />
              </div>
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div>
            {/* Apple Pay */}
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div style={{
                background: 'linear-gradient(135deg,#1c1c1e,#2c2c2e)',
                borderRadius: 16, padding: '1.5rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="34" height="34" viewBox="0 0 814 1000" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 663.9 0 541.8c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
                  </svg>
                  <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>Pay</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', textAlign: 'center', margin: 0 }}>
                  Complete your purchase quickly and securely with Touch ID or Face ID
                </p>
                <button type="button" onClick={() => setApplePayClicked(true)} style={{
                  width: '100%', background: applePayClicked ? '#1a1a1a' : 'black', color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
                  padding: '0.875rem 1.5rem', fontSize: '1rem',
                  fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}>
                  <svg width="18" height="22" viewBox="0 0 814 1000" fill="white">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 663.9 0 541.8c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
                  </svg>
                  Pay · £{total.toFixed(2)}
                </button>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  {['Touch ID', 'Face ID', '256-bit SSL'].map(b => (
                    <span key={b} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>✓</span> {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <ul className="mb-4 divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">£{(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>

              {/* Totals — no delivery row */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({Math.round(taxRate * 100)}%)</span><span>£{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span><span>£{total.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="mt-6 w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all shadow-md">
                Confirm &amp; Place Order · £{total.toFixed(2)}
              </button>

              <p className="mt-4 text-xs text-gray-500 text-center">
                By completing your purchase you agree to our{' '}
                <span className="underline cursor-pointer">Terms of Service</span> and{' '}
                <span className="underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;