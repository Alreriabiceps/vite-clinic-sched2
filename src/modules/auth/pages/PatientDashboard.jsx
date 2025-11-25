import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, buttonVariants, cn, LoadingSpinner, usePatientAuth, patientBookingAPI, extractData, handleAPIError, toast } from '../../shared';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patient, logout, loading: authLoading } = usePatientAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPendingAppointment, setHasPendingAppointment] = useState(false);

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
      const appointments = data.appointments || [];
      setUpcomingAppointments(appointments);
      
      // Check if there are any pending appointments (scheduled, confirmed, or pending requests) in the future
      const currentDate = new Date();
      const pendingAppointment = appointments.find(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return (
          (appointment.status === 'scheduled' || 
           appointment.status === 'confirmed' ||
           appointment.status === 'cancellation_pending' ||
           appointment.status === 'reschedule_pending') &&
          appointmentDate >= currentDate
        );
      });
      setHasPendingAppointment(!!pendingAppointment);
      
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
      <header className="bg-off-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-warm-pink rounded-full">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="p-2 bg-muted-gold rounded-full">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div className="p-2 bg-soft-olive-500 rounded-full">
                  <Baby className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">VM Mother and Child Clinic</h1>
                <p className="text-sm text-muted-gold">Patient Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-charcoal">{patient.fullName}</p>
                <p className="text-sm text-muted-gold">{patient.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white">
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
          <h2 className="text-3xl font-bold text-charcoal mb-2">
            Welcome back, {patient.firstName}!
          </h2>
          <p className="text-muted-gold">
            Manage your appointments and health information from your personal dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`transition-shadow bg-off-white border-soft-olive-200 ${hasPendingAppointment ? 'opacity-75' : 'hover:shadow-lg cursor-pointer'}`}>
            {hasPendingAppointment ? (
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-muted-gold/20 rounded-full w-fit mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-gold" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">Appointment Pending</h3>
                <p className="text-sm text-muted-gold mb-2">You have a pending appointment</p>
                <p className="text-xs text-muted-gold/70">Complete your current appointment to book a new one</p>
              </CardContent>
            ) : (
              <Link to="/patient/book-appointment">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-warm-pink/20 rounded-full w-fit mx-auto mb-4">
                    <Plus className="h-8 w-8 text-warm-pink" />
                  </div>
                  <h3 className="font-semibold text-charcoal mb-2">Book Appointment</h3>
                  <p className="text-sm text-muted-gold">Schedule a new appointment with our doctors</p>
                </CardContent>
              </Link>
            )}
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-off-white border-soft-olive-200">
            <Link to="/patient/appointments">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-soft-olive-100 rounded-full w-fit mx-auto mb-4">
                  <History className="h-8 w-8 text-soft-olive-600" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">My Appointments</h3>
                <p className="text-sm text-muted-gold">View and manage your appointments</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-off-white border-soft-olive-200">
            <Link to="/patient/profile">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-muted-gold/20 rounded-full w-fit mx-auto mb-4">
                  <Settings className="h-8 w-8 text-muted-gold" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">Profile Settings</h3>
                <p className="text-sm text-muted-gold">Update your personal information</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-off-white border-soft-olive-200" onClick={() => window.open('tel:09626952050')}>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-warm-pink/20 rounded-full w-fit mx-auto mb-4">
                <Phone className="h-8 w-8 text-warm-pink" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Contact Clinic</h3>
              <p className="text-sm text-warm-pink font-medium hover:underline">0962 695 2050</p>
              <p className="text-xs text-muted-gold/70 mt-1">Click to call</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card className="bg-off-white border-soft-olive-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-charcoal">
                  <Calendar className="h-5 w-5 text-warm-pink" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription className="text-muted-gold">
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
                      <div key={index} className="p-4 border border-soft-olive-200 rounded-lg bg-light-blush/30">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-charcoal">
                              {appointment.doctor?.startsWith('Dr.') ? appointment.doctor : `Dr. ${appointment.doctor}`}
                            </h4>
                            <p className="text-sm text-muted-gold">
                              {appointment.specialty}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'Scheduled' 
                              ? 'bg-soft-olive-100 text-soft-olive-700'
                              : 'bg-muted-gold/20 text-muted-gold-700'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-gold">
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
                          <p className="text-sm text-muted-gold mt-2">
                            <strong>Reason:</strong> {appointment.reason}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Link 
                        to="/patient/appointments" 
                        className={cn(buttonVariants({ variant: "outline" }), "border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white")}
                      >
                        View All Appointments
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-soft-olive-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">No upcoming appointments</h3>
                    <p className="text-muted-gold mb-4">Ready to schedule your next visit?</p>
                    <Link 
                      to="/patient/book-appointment" 
                      className={cn(buttonVariants(), "bg-warm-pink hover:bg-warm-pink-600 text-white")}
                    >
                      Book Appointment
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Overview */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="bg-off-white border-soft-olive-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-charcoal">
                  <User className="h-5 w-5 text-warm-pink" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-gold" />
                  <div>
                    <p className="font-medium text-charcoal">{patient.fullName}</p>
                    <p className="text-sm text-muted-gold">Age: {patient.age} years old</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-gold" />
                  <div>
                    <p className="text-sm text-charcoal">{patient.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-gold" />
                  <div>
                    <p className="text-sm text-charcoal">{patient.phoneNumber}</p>
                  </div>
                </div>

                {patient.address && (patient.address.city || patient.address.province) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-gold" />
                    <div>
                      <p className="text-sm text-charcoal">
                        {[patient.address.city, patient.address.province].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Link 
                    to="/patient/profile" 
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white")}
                  >
                    Edit Profile
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Available Services */}
            <Card className="bg-off-white border-soft-olive-200">
              <CardHeader>
                <CardTitle className="text-charcoal">Available Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-light-blush rounded-lg border border-warm-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-warm-pink" />
                    <span className="font-medium text-warm-pink-700">OB-GYNE</span>
                  </div>
                  <p className="text-sm text-charcoal">
                    Dr. Maria Sarah L. Manaloto
                  </p>
                  <p className="text-xs text-muted-gold mt-1">
                    Mon 8AM-12PM • Wed 9AM-2PM • Fri 1PM-5PM
                  </p>
                </div>

                <div className="p-3 bg-soft-olive-100 rounded-lg border border-soft-olive-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Baby className="h-4 w-4 text-muted-gold" />
                    <span className="font-medium text-muted-gold-700">Pediatrics</span>
                  </div>
                  <p className="text-sm text-charcoal">
                    Dr. Shara Laine S. Vino
                  </p>
                  <p className="text-xs text-muted-gold mt-1">
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