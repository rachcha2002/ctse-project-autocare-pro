import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import Register from './pages/Register';

// Customer pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Vehicles from './pages/Vehicles';
import VehicleRegister from './pages/VehicleRegister';
import VehicleEdit from './pages/VehicleEdit';
import VehicleDetails from './pages/VehicleDetails';
import NewAppointment from './pages/NewAppointment';
import Appointments from './pages/Appointments';
import AppointmentDetails from './pages/AppointmentDetails';
import Payments from './pages/Payments';
import PaymentDetails from './pages/PaymentDetails';
import StripePaymentPage from './pages/StripePaymentPage';

// Admin pages
import Admin from './pages/Admin';
import AdminAppointments from './pages/AdminAppointments';
import AdminJobs from './pages/AdminJobs';
import AdminJobDetails from './pages/AdminJobDetails';
import AdminCustomers from './pages/AdminCustomers';
import AdminPayments from './pages/AdminPayments';
import AdminStaff from './pages/AdminStaff';

const NotFound = () => (
  <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
    <div className="text-center">
      <p className="text-8xl font-black text-orange-500 mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary inline-flex">Go Home</a>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes — requires auth */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
        <Route path="/vehicles/register" element={<ProtectedRoute><VehicleRegister /></ProtectedRoute>} />
        <Route path="/vehicles/:id/edit" element={<ProtectedRoute><VehicleEdit /></ProtectedRoute>} />
        <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetails /></ProtectedRoute>} />
        <Route path="/appointments/new" element={<ProtectedRoute><NewAppointment /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetails /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/payments/:id/pay" element={<ProtectedRoute><StripePaymentPage /></ProtectedRoute>} />
        <Route path="/payments/:id" element={<ProtectedRoute><PaymentDetails /></ProtectedRoute>} />

        {/* Admin Routes — requires auth + staff role */}
        <Route path="/admin" element={<ProtectedRoute superAdminOnly><Admin /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute superAdminOnly><AdminAppointments /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute adminOnly><AdminJobs /></ProtectedRoute>} />
        <Route path="/admin/jobs/:id" element={<ProtectedRoute adminOnly><AdminJobDetails /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute superAdminOnly><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute superAdminOnly><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute superAdminOnly><AdminStaff /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
