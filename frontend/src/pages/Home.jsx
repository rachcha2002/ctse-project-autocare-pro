import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📅', title: 'Easy Booking',      desc: 'Book service appointments online in minutes. Choose your time, service type and vehicle.' },
  { icon: '🔧', title: 'Live Job Tracking', desc: 'Follow your vehicle\'s repair progress in real-time — from job creation to completion.' },
  { icon: '💳', title: 'Digital Payments',  desc: 'Receive invoices and pay online securely. Download receipts anytime from your account.' },
  { icon: '🚗', title: 'Vehicle History',   desc: 'Complete service history for every vehicle. Never lose track of what was done and when.' },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const isStaff = user?.type === 'staff';

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-300 text-sm font-medium">Professional Vehicle Service Centre</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Your Car Deserves
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              Expert Care
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AutoCare Pro is a complete vehicle service management platform. Book appointments, track repairs,
            and manage payments — all in one place.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isAuthenticated ? (
              <Link
                to={isStaff ? '/admin' : '/dashboard'}
                className="btn-primary text-base !px-8 !py-3"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base !px-8 !py-3">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary text-base !px-8 !py-3">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-12 mt-16 flex-wrap">
            {[['99.9%', 'Uptime SLA'], ['< 2hrs', 'Avg Response Time'], ['4.9★', 'Customer Rating']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-orange-400">{val}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
          <p className="text-gray-500">A complete solution for both customers and service staff.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-hover p-6">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card p-8 lg:p-12 bg-gradient-to-br from-[#1a1a1e] to-[#141416]">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">How It Works</h2>
            <p className="text-gray-500 text-sm">From booking to receipt in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register & Add Vehicle',  icon: '🚗' },
              { step: '02', title: 'Book Appointment',         icon: '📅' },
              { step: '03', title: 'Track Your Repair',        icon: '🔧' },
              { step: '04', title: 'Pay & Get Receipt',        icon: '💳' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl mx-auto mb-3">
                  {s.icon}
                </div>
                <p className="text-orange-400 text-xs font-bold mb-1">STEP {s.step}</p>
                <p className="text-white text-sm font-medium">{s.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Create your free account and book your first service today.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base !px-8 !py-3">Create Free Account</Link>
            <Link to="/staff-login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Staff login →</Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#2a2a32] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <span className="text-gray-600 text-sm">© 2025 AutoCare Pro. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-black text-xs">AC</span>
            </div>
            <span className="text-gray-500 text-sm font-medium">AutoCare Pro</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
