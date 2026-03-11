import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/AdminLayout';
import VehiclesList from './pages/vehicles/VehiclesList';
import VehicleForm from './pages/vehicles/VehicleForm';
import AdminManagement from './pages/AdminManagement';
import SecretRegister from './pages/SecretRegister';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Clients from './pages/Clients';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Promotions from './pages/Promotions';
import Banners from './pages/Banners';
import DocumentExternalPreview from './components/DocumentExternalPreview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Route secrète pour la création de compte admin */}
        <Route path="/admin-register-secret-access" element={<SecretRegister />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<VehiclesList />} />
            <Route path="vehicles/new" element={<VehicleForm />} />
            <Route path="vehicles/edit/:id" element={<VehicleForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="clients" element={<Clients />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="banners" element={<Banners />} />
            <Route path="admins" element={<AdminManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/:tab" element={<Settings />} />
            {/* Autres routes admin protégées ici */}
          </Route>
          <Route path="settings/preview" element={<DocumentExternalPreview />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
