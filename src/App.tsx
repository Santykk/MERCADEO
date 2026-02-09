import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Header from './components/common/Header';
import Footer from './components/common/Footer';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import ProfilePage from './pages/ProfilePage';
import CreateProductPage from './pages/CreateProductPage';
import EditProductPage from './pages/EditProductPage';
import CategoryPage from './pages/CategoryPage';
import WishlistPage from './pages/WishlistPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SearchPage from './pages/SearchPage';
import CategoryManagementPage from './pages/CategoryManagementPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/order/:id" element={<OrderDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/update-password" element={<UpdatePasswordPage />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/admin/create-product" element={<CreateProductPage />} />
                  <Route path="/admin/edit-product" element={<EditProductPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/categories" element={<CategoryManagementPage />} />
                </Routes>
              </main>
              <Footer />
              <Toaster position="top-right" />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;