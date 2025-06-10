import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import { ToastContainer } from './components/ui/toast';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { LoadingSpinner } from './components/ui/loading-spinner';

// Patient Portal Components
import PatientPortal from './pages/PatientPortal';
import PatientLogin from './pages/PatientLogin';
import PatientRegister from './pages/PatientRegister';
import PatientDashboard from './pages/PatientDashboard';
import PatientBookAppointment from './pages/PatientBookAppointment';
import PatientAppointments from './pages/PatientAppointments';
import PatientProfile from './pages/PatientProfile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center clinic-gradient">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-muted-foreground">Loading clinic system...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Staff Login Route */}
          <Route 
            path="/login" 
            element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Patient Portal Routes */}
          <Route path="/patient" element={<PatientPortal />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/book-appointment" element={<PatientBookAppointment />} />
          <Route path="/patient/appointments" element={<PatientAppointments />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          
          {/* Protected Staff Routes */}
          <Route 
            path="/" 
            element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
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
          <Route 
            path="*" 
            element={<Navigate to="/patient" replace />} 
          />
        </Routes>
        
        <Toaster />
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
