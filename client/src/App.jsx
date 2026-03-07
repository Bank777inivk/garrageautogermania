import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@shared/store/useAuthStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import VehicleDetails from './pages/VehicleDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardOrders from './pages/dashboard/Orders';
import DashboardOrderDetails from './pages/dashboard/OrderDetails';
import DashboardProfile from './pages/dashboard/Profile';
import DashboardBilling from './pages/dashboard/Billing';
import DashboardPayment from './pages/dashboard/Payment';
import DashboardOrderTracking from './pages/dashboard/OrderTracking';
import DashboardTrackingList from './pages/dashboard/TrackingList';
import About from './pages/About';
import Contact from './pages/Contact';
import PublicTracking from './pages/PublicTracking';
import './i18n';

import DashboardLayout from './components/dashboard/DashboardLayout';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialise l'écouteur d'état d'authentification
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="vehicule/:id" element={<VehicleDetails />} />
          <Route path="panier" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="commande-confirmee/:orderId" element={<OrderSuccess />} />
          <Route path="connexion" element={<Login />} />
          <Route path="inscription" element={<Register />} />
          <Route path="a-propos" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="suivi-livraison" element={<PublicTracking />} />
        </Route>

        {/* Dashboard Client Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<DashboardOrders />} />
          <Route path="orders/track/:orderId" element={<DashboardOrderTracking />} />
          <Route path="orders/:orderId" element={<DashboardOrderDetails />} />
          <Route path="tracking" element={<DashboardTrackingList />} />
          <Route path="billing" element={<DashboardBilling />} />
          <Route path="payment/:orderId" element={<DashboardPayment />} />
          <Route path="profile" element={<DashboardProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
