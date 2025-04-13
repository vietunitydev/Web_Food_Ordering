import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout/Layout.tsx';
import FoodPage from './pages/food/FoodPage.tsx';
import CartPage from './pages/cart/CartPage.tsx';
import LoginForm from './pages/login/LoginForm.tsx';
import RegisterForm from './pages/login/RegisterForm.tsx';
import Home from './pages/home/Home.tsx';
import ProfilePage from './pages/profile/ProfilePage.tsx';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage.tsx';
import OrderHistoryPage from './pages/OderHistoryPage/OrderHistoryPage.tsx';
import AddItemPage from './pages/admin/AddItemPage.tsx';
import ListItemsPage from './pages/admin/AdminListFood.tsx';
import AdminOrdersPage from './pages/admin/AdminOrderPage.tsx';
import { AppProvider, useAppContext } from './components/AppContext/AppContext.tsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx';
import ResetPasswordForm from './pages/login/ResetPasswordForm.tsx';
import ForgotPassword from './pages/login/ForgotPassword.tsx';
import AdminCouponsPage from './pages/admin/AdminCouponsPage.tsx';

const ProtectedRoute: React.FC<{ children: JSX.Element; allowedRole: string }> = ({ children, allowedRole }) => {
    const { state } = useAppContext();
    if (state.isLoading) {
        return <div>Đang xác thực...</div>;
    }
    if (!state.token) {
        return <Navigate to="/login" replace />;
    }
    if (state.role !== allowedRole) {
        return <Navigate to="/home" replace />;
    }
    return children;
};

const App: React.FC = () => {
    return (
        <Router>
            <AppProvider>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/food" element={<FoodPage />} />
                        <Route path="/cart" element={<ProtectedRoute allowedRole="user"><CartPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute allowedRole="user"><ProfilePage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute allowedRole="user"><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/checkout/success" element={<ProtectedRoute allowedRole="user"><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/order-history" element={<ProtectedRoute allowedRole="user"><OrderHistoryPage /></ProtectedRoute>} />
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/register" element={<RegisterForm />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>

                    <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AddItemPage /></ProtectedRoute>} />
                    <Route path="/admin/add-item" element={<ProtectedRoute allowedRole="admin"><AddItemPage /></ProtectedRoute>} />
                    <Route path="/admin/list-items" element={<ProtectedRoute allowedRole="admin"><ListItemsPage /></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute allowedRole="admin"><AdminOrdersPage /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsersPage /></ProtectedRoute>} />
                    <Route path="/admin/coupons" element={<ProtectedRoute allowedRole="admin"><AdminCouponsPage /></ProtectedRoute>} />

                    <Route path="/reset-password/:resettoken" element={<ResetPasswordForm />} />
                </Routes>
            </AppProvider>
        </Router>
    );
};

export default App;