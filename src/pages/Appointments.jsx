import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { appointmentsAPI, extractData, handleAPIError } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Plus, Search, Filter, Clock, User, Phone, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from '../components/ui/toast';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      let params = {};
      if (filter === 'today') {
        params.date = today;
      }
      
      const response = await appointmentsAPI.getAll(params);
      const data = extractData(response);
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (appointment) => {
    // For patient portal bookings
    if (appointment.patientUserId) {
      return appointment.patientName || appointment.patientUserId.fullName;
    }
    // For staff bookings with Patient model
    if (appointment.patient) {
      if (appointment.patient.patientType === 'pediatric') {
        return appointment.patient.pediatricRecord?.nameOfChildren || 'Pediatric Patient';
      } else {
        return appointment.patient.obGyneRecord?.patientName || 'OB-GYNE Patient';
      }
    }
    return 'Unknown Patient';
  };

  const getContactInfo = (appointment) => {
    if (appointment.patientUserId) {
      return appointment.patientUserId.phoneNumber || appointment.contactNumber;
    }
    return appointment.contactInfo?.primaryPhone || 'No contact';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatTime = (timeString) => {
    return timeString; // Already in AM/PM format
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBookingSource = (appointment) => {
    return appointment.bookingSource === 'patient_portal' ? 'Patient Portal' : 'Staff';
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const patientName = getPatientName(appointment).toLowerCase();
    return patientName.includes(searchTerm.toLowerCase());
  });

  // Group appointments by doctor
  const appointmentsByDoctor = filteredAppointments.reduce((acc, appointment) => {
    const doctor = appointment.doctorName;
    if (!acc[doctor]) {
      acc[doctor] = [];
    }
    acc[doctor].push(appointment);
    return acc;
  }, {});

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, { status: newStatus });
      toast.success(`Appointment ${newStatus} successfully`);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(handleAPIError(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage patient appointments and schedules</p>
        </div>
        <Button variant="clinic" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'today' ? 'clinic' : 'outline'} 
                onClick={() => setFilter('today')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Today
              </Button>
              <Button 
                variant={filter === 'all' ? 'clinic' : 'outline'} 
                onClick={() => setFilter('all')}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Appointments by Doctor */}
          {Object.keys(appointmentsByDoctor).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(appointmentsByDoctor).map(([doctorName, doctorAppointments]) => (
                <Card key={doctorName}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        doctorName.includes('Maria') ? 'bg-blue-500' : 'bg-sky-500'
                      }`}></div>
                      {doctorName}
                    </CardTitle>
                    <CardDescription>
                      {doctorName.includes('Maria') ? 'OB-GYNE' : 'Pediatrician'} - 
                      {filter === 'today' ? " Today's Schedule" : ` ${doctorAppointments.length} appointment(s)`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {doctorAppointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No appointments {filter === 'today' ? 'today' : 'found'}</p>
                      </div>
                    ) : (
                      doctorAppointments.map((appointment) => (
                        <div 
                          key={appointment._id} 
                          className={`p-4 border rounded-lg ${getStatusColor(appointment.status)}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4" />
                                <p className="font-medium">{getPatientName(appointment)}</p>
                                {getStatusIcon(appointment.status)}
                              </div>
                              <p className="text-sm mb-1">{appointment.serviceType.replace(/_/g, ' ')}</p>
                              {appointment.reasonForVisit && (
                                <p className="text-sm italic">"{appointment.reasonForVisit}"</p>
                              )}
                              <div className="flex items-center gap-2 text-sm mt-2">
                                <Phone className="h-3 w-3" />
                                <span>{getContactInfo(appointment)}</span>
                                <span className="text-xs px-2 py-1 bg-white/50 rounded">
                                  {getBookingSource(appointment)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{formatTime(appointment.appointmentTime)}</span>
                              {filter !== 'today' && (
                                <p className="text-xs mt-1">{formatDate(appointment.appointmentDate)}</p>
                              )}
                              <div className="mt-2 space-y-1">
                                {appointment.status === 'scheduled' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                                    className="text-xs"
                                  >
                                    Confirm
                                  </Button>
                                )}
                                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                                    className="text-xs ml-1"
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-4">
                  {filter === 'today' 
                    ? 'No appointments scheduled for today' 
                    : searchTerm 
                      ? `No appointments found matching "${searchTerm}"`
                      : 'No appointments found'
                  }
                </p>
                <Button variant="clinic">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Appointment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          {appointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Appointment statistics {filter === 'today' ? 'for today' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {appointments.filter(a => a.status === 'scheduled').length}
                    </div>
                    <div className="text-sm text-gray-600">Scheduled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {appointments.filter(a => a.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-gray-600">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {appointments.filter(a => a.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {appointments.filter(a => a.status === 'cancelled').length}
                    </div>
                    <div className="text-sm text-gray-600">Cancelled</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 