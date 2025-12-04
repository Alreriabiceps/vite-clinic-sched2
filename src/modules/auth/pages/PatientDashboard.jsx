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
  History,
  Bell,
  X,
  RefreshCw
} from 'lucide-react';
export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patient, logout, loading: authLoading } = usePatientAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPendingAppointment, setHasPendingAppointment] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!patient && !authLoading) {
      navigate('/patient/login');
      return;
    }

    if (patient) {
      fetchUpcomingAppointments();
      fetchNotifications();
    }
  }, [patient, authLoading, navigate]);

  // Refresh notifications periodically
  useEffect(() => {
    if (patient) {
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [patient]);

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

  const fetchNotifications = async () => {
    try {
      const response = await patientBookingAPI.getMyAppointments();
      const data = extractData(response);
      const appointments = data.appointments || [];
      
      // Filter for notifications (cancelled or rescheduled appointments)
      const notificationList = appointments
        .filter(apt => {
          const status = apt.status?.toLowerCase();
          return (
            status === 'cancellation_pending' ||
            status === 'reschedule_pending' ||
            (status === 'cancelled' && apt.cancellationRequest && !apt.cancellationRequest.requestedBy) ||
            (status === 'rescheduled' && apt.rescheduledFrom)
          );
        })
        .map(apt => {
          const status = apt.status?.toLowerCase();
          let type = 'info';
          let title = '';
          let message = '';
          let actionUrl = '/patient/appointments';

          if (status === 'cancellation_pending' && apt.cancellationRequest && !apt.cancellationRequest.requestedBy) {
            type = 'cancel';
            title = 'Appointment Cancellation Request';
            const timeStr = apt.appointmentTime || '';
            message = `Your appointment with ${apt.doctorName} on ${formatDate(apt.appointmentDate)}${timeStr ? ` at ${timeStr}` : ''} has been cancelled.`;
            if (apt.cancellationRequest?.reason) {
              message += ` Reason: ${apt.cancellationRequest.reason}`;
            }
          } else if (status === 'reschedule_pending' && (apt.rescheduledFrom || apt.rescheduleRequest)) {
            type = 'reschedule';
            title = 'Appointment Reschedule Request';
            if (apt.rescheduledFrom) {
              const originalTime = apt.rescheduledFrom.originalTime || '';
              const newTime = apt.appointmentTime || '';
              message = `Your appointment with ${apt.doctorName} has been rescheduled from ${formatDate(apt.rescheduledFrom.originalDate)}${originalTime ? ` at ${originalTime}` : ''} to ${formatDate(apt.appointmentDate)}${newTime ? ` at ${newTime}` : ''}.`;
              if (apt.rescheduledFrom.reason) {
                message += ` Reason: ${apt.rescheduledFrom.reason}`;
              }
            } else if (apt.rescheduleRequest) {
              message = `Your appointment with ${apt.doctorName} has been rescheduled. Please check your appointments for details.`;
            }
          }

          return {
            id: apt.appointmentId || apt._id,
            type,
            title,
            message,
            appointmentId: apt.appointmentId,
            appointment: apt,
            timestamp: apt.updatedAt || apt.createdAt || new Date().toISOString(),
            read: false,
            actionUrl
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(notificationList);
      setUnreadCount(notificationList.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
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
              
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Bell className="h-5 w-5 text-charcoal" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-charcoal">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-warm-pink hover:text-warm-pink-700"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.read ? 'bg-blue-50/50' : ''
                                }`}
                                onClick={() => {
                                  markNotificationAsRead(notification.id);
                                  navigate(notification.actionUrl);
                                  setShowNotifications(false);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-full ${
                                    notification.type === 'cancel' 
                                      ? 'bg-red-100' 
                                      : notification.type === 'reschedule'
                                      ? 'bg-blue-100'
                                      : 'bg-gray-100'
                                  }`}>
                                    {notification.type === 'cancel' ? (
                                      <X className="h-4 w-4 text-red-600" />
                                    ) : notification.type === 'reschedule' ? (
                                      <RefreshCw className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <Bell className="h-4 w-4 text-gray-600" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="font-medium text-sm text-charcoal">
                                        {notification.title}
                                      </p>
                                      {!notification.read && (
                                        <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-gold mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {new Date(notification.timestamp).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                          <Link
                            to="/patient/appointments"
                            onClick={() => setShowNotifications(false)}
                            className="text-sm text-warm-pink hover:text-warm-pink-700 font-medium"
                          >
                            View All Appointments
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
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