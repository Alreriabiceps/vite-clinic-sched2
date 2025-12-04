import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import "./debug-api.js"; // Debug API configuration (uncomment for local debugging)

// Shared components and utilities
import {
  useAuth,
  Toaster,
  DashboardLayout,
  LoadingSpinner,
  PrivacyPolicy,
  TermsOfService,
} from "./modules/shared";

// Module imports
import {
  LoginPage,
  PatientPortal,
  PatientLogin,
  PatientRegister,
  PatientDashboard,
  PatientBookAppointment,
  PatientAppointments,
  PatientProfile,
} from "./modules/auth";

import { Dashboard } from "./modules/dashboard";
import { Appointments } from "./modules/appointments";
import { Patients, PatientDetail } from "./modules/patients";
import { Reports } from "./modules/reports";
import { Settings } from "./modules/settings";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center clinic-gradient">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-muted-foreground">
            Loading clinic system...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <Routes>
          {/* Admin Login Route */}
          <Route
            path="/login"
            element={
              !user ? <LoginPage /> : <Navigate to="/dashboard" replace />
            }
          />

          {/* Patient Portal Routes */}
          <Route path="/patient" element={<PatientPortal />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route
            path="/patient/book-appointment"
            element={<PatientBookAppointment />}
          />
          <Route
            path="/patient/appointments"
            element={<PatientAppointments />}
          />
          <Route path="/patient/profile" element={<PatientProfile />} />

          {/* Protected Staff Routes */}
          <Route
            path="/"
            element={
              user ? <DashboardLayout /> : <Navigate to="/login" replace />
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:patientId" element={<PatientDetail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Privacy Policy and Terms of Service Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Default route - redirect to patient portal */}
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>

        <Toaster />
      </div>
    </Router>
  );
}

export default App;
