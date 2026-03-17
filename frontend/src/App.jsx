import { Routes, Route } from "react-router-dom";

// Placeholder components for all pages
const Home = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Home Page</h1>
    <p>Welcome to AutoCare Pro</p>
  </div>
);
const Login = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Login Page</h1>
  </div>
);
const Register = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Register Page</h1>
  </div>
);
const Dashboard = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Dashboard Page</h1>
  </div>
);
const Vehicles = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Vehicles List Page</h1>
  </div>
);
const VehicleRegister = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Vehicle Registration Page</h1>
  </div>
);
const VehicleDetails = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Vehicle Details Page</h1>
  </div>
);
const NewAppointment = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">New Appointment Page</h1>
  </div>
);
const Appointments = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Appointments List Page</h1>
  </div>
);
const AppointmentDetails = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Appointment Details Page</h1>
  </div>
);
const Payments = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Payments List Page</h1>
  </div>
);
const PaymentDetails = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Payment Details Page</h1>
  </div>
);
const Admin = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Admin Dashboard Page</h1>
  </div>
);
const AdminAppointments = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Admin Appointments Page</h1>
  </div>
);
const AdminJobs = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Admin Jobs List Page</h1>
  </div>
);
const AdminJobDetails = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Admin Job Details Page</h1>
  </div>
);
const AdminCustomers = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Admin Customers Page</h1>
  </div>
);
const AdminPayments = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Admin Payments Page</h1>
  </div>
);
const NotFound = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/register" element={<VehicleRegister />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/appointments/new" element={<NewAppointment />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/:id" element={<AppointmentDetails />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payments/:id" element={<PaymentDetails />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/jobs/:id" element={<AdminJobDetails />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/payments" element={<AdminPayments />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
