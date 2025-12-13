import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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

// Inner component that can use hooks
function AppRoutes() {
  const location = useLocation();
  // More specific check: match /patient routes but not /patients (admin route)
  // Patient routes: /patient, /patient/login, /patient/register, etc.
  // Admin routes: /patients, /patients/:id
  // Check for exact match or path starting with /patient/ (with trailing slash)
  // This ensures /patients doesn't match since it doesn't have the trailing slash
  const isPatientRoute = location.pathname === '/patient' || 
                         location.pathname.startsWith('/patient/');
  
  // Always call useAuth (hooks must be called unconditionally)
  // But we'll ignore it for patient routes to prevent interference
  const adminAuth = useAuth();

  // Show loading only for admin routes
  if (!isPatientRoute && adminAuth.loading) {
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
    <Routes>
      {/* Patient Portal Routes - Must be first to ensure proper matching */}
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

      {/* Admin Login Route - only rendered when not on patient route */}
      {!isPatientRoute && (
        <Route
          path="/login"
          element={
            !adminAuth.user ? <LoginPage /> : <Navigate to="/dashboard" replace />
          }
        />
      )}

      {/* Protected Staff Routes - only rendered when not on patient route */}
      {!isPatientRoute && (
        <Route
          path="/"
          element={
            adminAuth.user ? <DashboardLayout /> : <Navigate to="/login" replace />
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
      )}

      {/* Privacy Policy and Terms of Service Routes */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />

      {/* Default route - redirect to patient portal */}
      <Route path="*" element={<Navigate to="/patient" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <AppRoutes />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
