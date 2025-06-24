import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, LoadingSpinner, usePatientAuth, patientBookingAPI, extractData, handleAPIError, toast, CancellationRequestModal, RescheduleRequestModal } from '../../shared';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Stethoscope,
  Baby,
  Filter,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock as ClockIcon
} from 'lucide-react';
export default function PatientAppointments() {
  const navigate = useNavigate();
  const { patient, loading: authLoading } = usePatientAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (!patient && !authLoading) {
      navigate('/patient/login');
      return;
    }

    if (patient) {
      fetchAppointments();
    }
  }, [patient, authLoading, navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await patientBookingAPI.getMyAppointments();
      const data = extractData(response);
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleRequestSuccess = () => {
    fetchAppointments(); // Refresh the list
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

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'cancellation_pending':
        return <ClockIcon className="h-4 w-4 text-orange-500" />;
      case 'reschedule_pending':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancellation_pending':
        return 'bg-orange-100 text-orange-800';
      case 'reschedule_pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const isUpcoming = (appointmentDate, appointmentTime) => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    return appointmentDateTime > now;
  };

  const canCancelAppointment = (appointment) => {
    const status = appointment.status.toLowerCase();
    if (status === 'cancelled' || 
        status === 'completed' || 
        status === 'cancellation_pending' ||
        status === 'reschedule_pending') {
      return false;
    }
    
    // Check if appointment is at least 2 hours in the future
    const now = new Date();
    
    // Handle different time formats
    let appointmentDateTime;
    try {
      // Try parsing the appointment date and time
      const appointmentDate = new Date(appointment.appointmentDate);
      const timeString = appointment.appointmentTime;
      
      // Convert 12-hour format to 24-hour format for proper parsing
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);
      
    } catch (error) {
      console.error('Error parsing appointment date/time:', error);
      // If parsing fails, allow the action (safer approach)
      return true;
    }
    
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    console.log('Appointment:', appointment.appointmentId, 'Hours difference:', hoursDifference);
    
    return hoursDifference >= 2;
  };

  const canRescheduleAppointment = (appointment) => {
    const status = appointment.status.toLowerCase();
    if (status === 'cancelled' || 
        status === 'completed' || 
        status === 'cancellation_pending' ||
        status === 'reschedule_pending') {
      return false;
    }
    
    // Check if appointment is at least 2 hours in the future
    const now = new Date();
    
    // Handle different time formats
    let appointmentDateTime;
    try {
      // Try parsing the appointment date and time
      const appointmentDate = new Date(appointment.appointmentDate);
      const timeString = appointment.appointmentTime;
      
      // Convert 12-hour format to 24-hour format for proper parsing
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);
      
    } catch (error) {
      console.error('Error parsing appointment date/time:', error);
      // If parsing fails, allow the action (safer approach)
      return true;
    }
    
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    return hoursDifference >= 2;
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'Scheduled';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'cancellation_pending':
        return 'Cancellation Pending';
      case 'reschedule_pending':
        return 'Reschedule Pending';
      default:
        return status;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    
    switch (filter) {
      case 'upcoming':
        return appointmentDateTime > now && appointment.status.toLowerCase() !== 'cancelled';
      case 'past':
        return appointmentDateTime <= now || appointment.status.toLowerCase() === 'completed';
      case 'cancelled':
        return appointment.status.toLowerCase() === 'cancelled';
      default:
        return true;
    }
  });

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
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="text-warm-pink hover:bg-warm-pink/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
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
                  <h1 className="text-xl font-bold text-charcoal">My Appointments</h1>
                  <p className="text-sm text-muted-gold">VM Mother and Child Clinic</p>
                </div>
              </div>
            </div>
            <Button asChild className="bg-warm-pink hover:bg-warm-pink-600 text-white">
              <Link to="/patient/book-appointment">
                <Plus className="h-4 w-4 mr-2" />
                Book New Appointment
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Appointments', count: appointments.length },
              { key: 'upcoming', label: 'Upcoming', count: appointments.filter(apt => isUpcoming(apt.appointmentDate, apt.appointmentTime) && apt.status.toLowerCase() !== 'cancelled').length },
              { key: 'past', label: 'Past', count: appointments.filter(apt => !isUpcoming(apt.appointmentDate, apt.appointmentTime) || apt.status.toLowerCase() === 'completed').length },
              { key: 'cancelled', label: 'Cancelled', count: appointments.filter(apt => apt.status.toLowerCase() === 'cancelled').length }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                onClick={() => setFilter(tab.key)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {tab.label}
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.appointmentId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.doctorName}
                        </h3>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(appointment.status)}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{appointment.serviceType}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(appointment.appointmentTime)}
                        </div>
                      </div>
                      {appointment.reasonForVisit && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Reason:</strong> {appointment.reasonForVisit}
                        </p>
                      )}
                      {appointment.patientType === 'dependent' && appointment.dependentInfo && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Patient:</strong> {appointment.dependentInfo.name} ({appointment.dependentInfo.relationship})
                        </p>
                      )}
                      
                      {/* Pending Request Information */}
                      {appointment.status === 'cancellation_pending' && appointment.cancellationRequest && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <ClockIcon className="h-4 w-4 text-orange-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-orange-800">Cancellation Request Pending</p>
                              <p className="text-orange-700 mt-1">
                                <strong>Reason:</strong> {appointment.cancellationRequest.reason}
                              </p>
                              <p className="text-orange-600 text-xs mt-1">
                                Requested on {new Date(appointment.cancellationRequest.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {appointment.status === 'reschedule_pending' && appointment.rescheduleRequest && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-blue-800">Reschedule Request Pending</p>
                              <p className="text-blue-700 mt-1">
                                <strong>Reason:</strong> {appointment.rescheduleRequest.reason}
                              </p>
                              {appointment.rescheduleRequest.preferredDate && (
                                <p className="text-blue-700 mt-1">
                                  <strong>Preferred Date:</strong> {new Date(appointment.rescheduleRequest.preferredDate).toLocaleDateString()}
                                  {appointment.rescheduleRequest.preferredTime && ` at ${appointment.rescheduleRequest.preferredTime}`}
                                </p>
                              )}
                              <p className="text-blue-600 text-xs mt-1">
                                Requested on {new Date(appointment.rescheduleRequest.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {canRescheduleAppointment(appointment) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRescheduleAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                      )}
                      {canCancelAppointment(appointment) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t pt-2">
                    Appointment ID: {appointment.appointmentId}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No appointments yet' : `No ${filter} appointments`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't booked any appointments yet. Ready to schedule your first visit?"
                  : `You don't have any ${filter} appointments.`
                }
              </p>
              {filter === 'all' && (
                <Button asChild>
                  <Link to="/patient/book-appointment">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modals */}
      <CancellationRequestModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        appointment={selectedAppointment}
        onSuccess={handleRequestSuccess}
      />
      
      <RescheduleRequestModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        appointment={selectedAppointment}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
} 