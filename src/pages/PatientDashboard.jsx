import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { LoadingSpinner } from '../components/ui/loading-spinner.jsx';
import { usePatientAuth } from '../hooks/usePatientAuth.js';
import { patientBookingAPI, extractData, handleAPIError } from '../lib/api.js';
import { 
  Heart, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Stethoscope,
  Baby,
  LogOut,
  Settings,
  Plus,
  History
} from 'lucide-react';
import { toast } from '../components/ui/toast';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patient, logout, loading: authLoading } = usePatientAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient && !authLoading) {
      navigate('/patient/login');
      return;
    }

    if (patient) {
      fetchUpcomingAppointments();
    }
  }, [patient, authLoading, navigate]);

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true);
      const response = await patientBookingAPI.getMyAppointments({ 
        status: 'Scheduled', 
        limit: 3 
      });
      const data = extractData(response);
      setUpcomingAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/patient');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (authLoading || !patient) {
    return (
      <div className="min-h-screen clinic-gradient flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen clinic-gradient">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-clinic-600 rounded-full">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="p-2 bg-medical-600 rounded-full">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div className="p-2 bg-pink-500 rounded-full">
                  <Baby className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VM Mother and Child Clinic</h1>
                <p className="text-sm text-gray-600">Patient Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{patient.fullName}</p>
                <p className="text-sm text-gray-600">{patient.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {patient.firstName}!
          </h2>
          <p className="text-gray-600">
            Manage your appointments and health information from your personal dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/patient/book-appointment">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-clinic-100 rounded-full w-fit mx-auto mb-4">
                  <Plus className="h-8 w-8 text-clinic-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule a new appointment with our doctors</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/patient/appointments">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <History className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">My Appointments</h3>
                <p className="text-sm text-gray-600">View and manage your appointments</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/patient/profile">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <Settings className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Profile Settings</h3>
                <p className="text-sm text-gray-600">Update your personal information</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('tel:+639123456789')}>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Clinic</h3>
              <p className="text-sm text-purple-600 font-medium hover:underline">+63 912 345 6789</p>
              <p className="text-xs text-gray-500 mt-1">Click to call</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-clinic-600" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>
                  Your next scheduled appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Dr. {appointment.doctor}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {appointment.specialty}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'Scheduled' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(appointment.appointmentDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(appointment.appointmentTime)}
                          </div>
                        </div>
                        {appointment.reason && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Reason:</strong> {appointment.reason}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Button asChild variant="outline">
                        <Link to="/patient/appointments">View All Appointments</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                    <p className="text-gray-600 mb-4">Ready to schedule your next visit?</p>
                    <Button asChild>
                      <Link to="/patient/book-appointment">Book Appointment</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Overview */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-clinic-600" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{patient.fullName}</p>
                    <p className="text-sm text-gray-600">Age: {patient.age} years old</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{patient.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{patient.phoneNumber}</p>
                  </div>
                </div>

                {patient.address && (patient.address.city || patient.address.province) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {[patient.address.city, patient.address.province].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/patient/profile">Edit Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Services */}
            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-pink-600" />
                    <span className="font-medium text-pink-900">OB-GYNE</span>
                  </div>
                  <p className="text-sm text-pink-700">
                    Dr. Maria Sarah L. Manaloto
                  </p>
                  <p className="text-xs text-pink-600 mt-1">
                    Mon 8AM-12PM • Wed 9AM-2PM • Fri 1PM-5PM
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Baby className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Pediatrics</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Dr. Shara Laine S. Vino
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Mon 1PM-5PM • Tue 1PM-5PM • Thu 8AM-12PM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 