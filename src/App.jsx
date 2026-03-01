import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import CategoryDetailPage from './pages/CategoryDetailPage';
import DealsPage from './pages/DealsPage';
import About from './pages/About';
import NotFound from './pages/NotFound';
import CategoriesPage from './pages/CategoriesPage';
import ContactUsPage from './pages/ContactUsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Signout from './pages/Signout';
import OrdersPage from './pages/OrdersPage';
import DeliveryInfoPage from './pages/DeliveryInfoPage';
import ReturnsPolicyPage from './pages/ReturnsPolicyPage';
import FAQsPage from './pages/FAQsPage';
import SearchPage from './pages/SearchPage';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { UserDataProvider } from './context/UserDataContext';

import { isFirebaseConfigured } from './firebase';

// Layout wrapper — hides Navbar/Footer on admin pages
const StoreLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ flexGrow: 1 }}>{children}</main>
    <Footer />
  </>
);

import { useAdmin } from './context/AdminContext';
import MaintenancePage from './pages/MaintenancePage';

function AppContent({ cartCount, toggleCart, addToCart, removeFromCart, updateQuantity, clearCart, cartItems }) {
  const { settings, adminUser } = useAdmin();

  // If maintenance mode is ON and user is NOT an admin, show MaintenancePage
  if (settings.maintenanceMode && !adminUser) {
    return <MaintenancePage />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isFirebaseConfigured && (
        <div style={{ backgroundColor: '#ffcccc', color: '#cc0000', padding: '15px', textAlign: 'center', fontWeight: 'bold' }}>
          ⚠️ Firebase Environment Variables are missing! If you deployed this website via Vercel or Netlify, please add the VITE_FIREBASE_* variables to your Environment Variables setting in the dashboard, and redeploy! ⚠️
        </div>
      )}
      <Routes>
        {/* ── Admin routes (no store navbar/footer) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />

        {/* ── Store routes ── */}
        <Route path="/*" element={
          <>
            <Navbar toggleCart={toggleCart} cartCount={cartCount} />
            <main style={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home addToCart={addToCart} />} />
                <Route path="/shop" element={<Shop addToCart={addToCart} />} />
                <Route path="/cart" element={
                  <CartPage
                    cartItems={cartItems}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                    addToCart={addToCart}
                  />}
                />
                <Route path="/checkout" element={<Checkout cartItems={cartItems} clearCart={clearCart} />} />
                <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
                <Route path="/category/:id" element={<CategoryDetailPage addToCart={addToCart} />} />
                <Route path="/deals" element={<DealsPage addToCart={addToCart} />} />
                <Route path="/about" element={<About />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist addToCart={addToCart} />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/delivery-info" element={<DeliveryInfoPage />} />
                <Route path="/returns" element={<ReturnsPolicyPage />} />
                <Route path="/faqs" element={<FAQsPage />} />
                <Route path="/signout" element={<Signout />} />
                <Route path="/search" element={<SearchPage addToCart={addToCart} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}

function App() {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kelty_cart')) || []; }
    catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart across page refreshes
  React.useEffect(() => {
    localStorage.setItem('kelty_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) { removeFromCart(productId); return; }
    setCartItems(prevItems =>
      prevItems.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)
    );
  };

  const clearCart = () => setCartItems([]);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <AdminProvider>
      <AuthProvider>
        <UserDataProvider>
          <Router>
            <AppContent
              cartCount={cartCount}
              toggleCart={toggleCart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
              clearCart={clearCart}
              cartItems={cartItems}
            />
          </Router>
        </UserDataProvider>
      </AuthProvider>
    </AdminProvider>
  );
}

export default App;