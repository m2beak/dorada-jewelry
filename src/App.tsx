import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { isAdminLoggedIn, isAdminSetup } from '@/services/database';
import { hasAdminAccess } from '@/services/security';

// Components (Static)
import ToastContainer from '@/components/ToastContainer';

// Lazy Load Pages
const Shop = React.lazy(() => import('@/pages/shop/Shop'));
const ProductDetail = React.lazy(() => import('@/pages/shop/ProductDetail'));
const Cart = React.lazy(() => import('@/pages/shop/Cart'));
const Checkout = React.lazy(() => import('@/pages/shop/Checkout'));
const Wishlist = React.lazy(() => import('@/pages/shop/Wishlist'));

// Lazy Load Admin Pages
const HiddenAdminAccess = React.lazy(() => import('@/pages/admin/HiddenAdminAccess'));
const AdminLogin = React.lazy(() => import('@/pages/admin/AdminLogin'));
const AdminSetup = React.lazy(() => import('@/pages/admin/AdminSetup'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));

// Protected Admin Route - Requires both secret key AND admin login
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAdmin } = useApp();

  useEffect(() => {
    if (isAdminLoggedIn() && hasAdminAccess()) {
      setAdmin(true);
    }
  }, [setAdmin]);

  // Check both admin login AND secret key access
  if (!hasAdminAccess() || !isAdminLoggedIn()) {
    return <Navigate to="/secure-access" replace />;
  }

  return <>{children}</>;
};

// Admin Login Route - Only accessible if admin is set up and has secret key
const AdminLoginRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // If no secret key access, go to secure access first
  if (!hasAdminAccess()) {
    return <Navigate to="/secure-access" replace />;
  }

  // If admin not set up, go to setup
  if (!isAdminSetup()) {
    return <Navigate to="/admin/setup" replace />;
  }

  // If already logged in, go to dashboard
  if (isAdminLoggedIn()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// Admin Setup Route - Only accessible if admin not set up and has secret key
const AdminSetupRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // If no secret key access, go to secure access first
  if (!hasAdminAccess()) {
    return <Navigate to="/secure-access" replace />;
  }

  // If admin already set up, go to login
  if (isAdminSetup()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  return (
    <>
      <ToastContainer />
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-dorada-blue">
          <div className="w-10 h-10 border-4 border-dorada-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          {/* Public Routes - Shop */}
          <Route path="/" element={<Shop />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Hidden Admin Access - Secret entry point */}
          <Route path="/secure-access" element={<HiddenAdminAccess />} />

          {/* Admin Login Route */}
          <Route
            path="/admin/login"
            element={
              <AdminLoginRoute>
                <AdminLogin />
              </AdminLoginRoute>
            }
          />

          {/* Admin Setup Route - Only for first time */}
          <Route
            path="/admin/setup"
            element={
              <AdminSetupRoute>
                <AdminSetup />
              </AdminSetupRoute>
            }
          />

          {/* Protected Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          {/* Redirect old admin paths */}
          <Route path="/admin" element={<Navigate to="/secure-access" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;
