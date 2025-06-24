import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, LoadingSpinner, usePatientAuth, patientBookingAPI, extractData, handleAPIError, toast } from '../../shared';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft,
  Stethoscope,
  Baby,
  CheckCircle,
  MapPin,
  Phone
} from 'lucide-react';
export default function PatientBookAppointment() {
  const navigate = useNavigate();
  const { patient, loading: authLoading } = usePatientAuth();
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [existingAppointment, setExistingAppointment] = useState(null);
  const [checkingAppointments, setCheckingAppointments] = useState(true);
  const [formData, setFormData] = useState({
    patientType: 'self',
    patientName: '',
    contactNumber: '',
    reason: '',
    dependentInfo: {
      relationship: '',
      age: ''
    }
  });

  useEffect(() => {
    if (!patient && !authLoading) {
      navigate('/patient/login');
      return;
    }

    if (patient) {
      checkExistingAppointments();
      fetchDoctors();
      // Pre-fill form with patient info for self appointment
      setFormData(prev => ({
        ...prev,
        patientName: patient.fullName,
        contactNumber: patient.phoneNumber
      }));
    }
  }, [patient, authLoading, navigate]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchAvailableDates();
    } else {
      setAvailableDates([]);
      setSelectedDate('');
      setSelectedSlot('');
    }
  }, [selectedDoctor]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot('');
    }
  }, [selectedDoctor, selectedDate]);

  const checkExistingAppointments = async () => {
    try {
      setCheckingAppointments(true);
      const response = await patientBookingAPI.getMyAppointments();
      const data = extractData(response);
      
      // Check for pending/scheduled appointments in the future
      const currentDate = new Date();
      const pendingAppointment = data.appointments?.find(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return (
          (appointment.status === 'scheduled' || 
           appointment.status === 'confirmed' ||
           appointment.status === 'cancellation_pending' ||
           appointment.status === 'reschedule_pending') &&
          appointmentDate >= currentDate
        );
      });
      
      setExistingAppointment(pendingAppointment || null);
    } catch (error) {
      console.error('Error checking existing appointments:', error);
      // Don't show error toast for this check, just log it
    } finally {
      setCheckingAppointments(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await patientBookingAPI.getDoctors();
      const data = extractData(response);
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDates = async () => {
    try {
      const response = await patientBookingAPI.getAvailableDates({
        doctorId: selectedDoctor
      });
      const data = extractData(response);
      setAvailableDates(data.availableDates || []);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      toast.error('Failed to load available dates');
      setAvailableDates([]);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await patientBookingAPI.getAvailableSlots({
        doctorId: selectedDoctor,
        date: selectedDate
      });
      const data = extractData(response);
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available time slots');
      setAvailableSlots([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePatientTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      patientType: type,
      patientName: type === 'self' ? patient.fullName : '',
      contactNumber: type === 'self' ? patient.phoneNumber : ''
    }));
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error('Please select doctor, date, and time slot');
      return;
    }

    if (!availableDates.includes(selectedDate)) {
      toast.error('Please select an available date for this doctor');
      return;
    }

    if (!formData.patientName.trim() || !formData.contactNumber.trim()) {
      toast.error('Patient name and contact number are required');
      return;
    }

    try {
      setBookingLoading(true);
      
      const bookingData = {
        doctorName: selectedDoctorInfo?.name,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        serviceType: selectedDoctorInfo?.specialty || 'General Consultation',
        patientType: formData.patientType,
        patientName: formData.patientName.trim(),
        contactNumber: formData.contactNumber.trim(),
        reasonForVisit: formData.reason.trim(),
        dependentInfo: formData.patientType === 'dependent' ? {
          name: formData.patientName.trim(),
          relationship: formData.dependentInfo.relationship.trim(),
          age: formData.dependentInfo.age
        } : undefined
      };

      await patientBookingAPI.bookAppointment(bookingData);
      
      toast.success('Appointment booked successfully!');
      navigate('/patient/dashboard');
      
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (authLoading || !patient) {
    return (
      <div className="min-h-screen clinic-gradient flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedDoctorInfo = doctors.find(d => d._id === selectedDoctor);

  return (
    <div className="min-h-screen clinic-gradient">
      {/* Header */}
      <header className="bg-off-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <Link to="/patient/dashboard" className="inline-flex items-center gap-2 text-warm-pink hover:text-warm-pink-700">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-warm-pink" />
              <h1 className="text-xl font-bold text-charcoal">Book Appointment</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-charcoal mb-2">Book New Appointment</h2>
          <p className="text-muted-gold">Schedule your appointment with our experienced doctors.</p>
        </div>

        {/* Check for existing appointments */}
        {checkingAppointments ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Checking existing appointments...</span>
          </div>
        ) : existingAppointment ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Calendar className="h-5 w-5" />
                Existing Appointment Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900 mb-2">
                      You already have a pending appointment
                    </h4>
                    <div className="text-sm text-orange-800 space-y-1">
                      <p><strong>Doctor:</strong> {existingAppointment.doctorName}</p>
                      <p><strong>Date:</strong> {new Date(existingAppointment.appointmentDate).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {existingAppointment.appointmentTime}</p>
                      <p><strong>Status:</strong> <span className="capitalize">{existingAppointment.status}</span></p>
                    </div>
                    <p className="text-sm text-orange-700 mt-3">
                      Please complete or cancel your current appointment before booking a new one.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/patient/appointments')}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        View My Appointments
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={checkExistingAppointments}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Refresh Status
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/patient/dashboard')}
                        className="border-gray-300"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Select Patient Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-clinic-600" />
                Step 1: Who is this appointment for?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.patientType === 'self' 
                      ? 'border-clinic-600 bg-clinic-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePatientTypeChange('self')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      formData.patientType === 'self' ? 'bg-clinic-600' : 'bg-gray-100'
                    }`}>
                      <User className={`h-5 w-5 ${
                        formData.patientType === 'self' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Myself</h3>
                      <p className="text-sm text-gray-600">Book appointment for yourself</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.patientType === 'dependent' 
                      ? 'border-clinic-600 bg-clinic-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePatientTypeChange('dependent')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      formData.patientType === 'dependent' ? 'bg-clinic-600' : 'bg-gray-100'
                    }`}>
                      <Heart className={`h-5 w-5 ${
                        formData.patientType === 'dependent' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Family Member</h3>
                      <p className="text-sm text-gray-600">Book for family member or dependent</p>
                    </div>
                  </div>
                </div>
              </div>

              {formData.patientType === 'dependent' && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <Input
                      name="dependentInfo.relationship"
                      value={formData.dependentInfo.relationship}
                      onChange={handleInputChange}
                      placeholder="e.g., Child, Spouse, Parent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <Input
                      type="number"
                      name="dependentInfo.age"
                      value={formData.dependentInfo.age}
                      onChange={handleInputChange}
                      placeholder="Age"
                      min="0"
                      max="120"
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <Input
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    placeholder="Enter patient name"
                    required
                    disabled={formData.patientType === 'self'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <Input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Brief description of the reason for visit (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:border-transparent"
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-clinic-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Clinic Location</h4>
                    <p className="text-sm text-gray-600 mt-1">San Nicolas Arayat Pampanga</p>
                    <p className="text-sm text-gray-500 mt-1">(Beside "Buff. It Up Auto Spa and Detailing" and In front of INC-San Nicolas)</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="h-4 w-4 text-clinic-600" />
                      <a href="tel:09626952050" className="text-sm text-clinic-600 hover:underline">
                        0962 695 2050
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Select Doctor */}
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Select Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDoctor === doctor._id
                          ? 'border-clinic-600 bg-clinic-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDoctor(doctor._id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${
                          doctor.specialty === 'OB-GYNE' ? 'bg-pink-100' : 'bg-blue-100'
                        }`}>
                          {doctor.specialty === 'OB-GYNE' ? (
                            <Heart className="h-6 w-6 text-pink-600" />
                          ) : (
                            <Baby className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">Dr. {doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="mt-2">
                            {doctor.schedule && typeof doctor.schedule === 'object' ? 
                              Object.entries(doctor.schedule).map(([day, hours], index) => (
                                <p key={index} className="text-xs text-gray-500">
                                  {day}: {hours}
                                </p>
                              )) : 
                              doctor.workingDays?.map((day, index) => (
                                <p key={index} className="text-xs text-gray-500">
                                  {day}
                                </p>
                              ))
                            }
                          </div>
                        </div>
                        {selectedDoctor === doctor._id && (
                          <CheckCircle className="h-6 w-6 text-clinic-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 4: Select Date and Time */}
          {selectedDoctor && (
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Select Date and Time</CardTitle>
                <CardDescription>
                  Choose your preferred appointment date and time slot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  {availableDates.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        📅 Available dates for Dr. {selectedDoctorInfo?.name}:
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {availableDates.length} dates available in the next 3 months
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      required
                      className={selectedDate && !availableDates.includes(selectedDate) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    
                    {selectedDate && !availableDates.includes(selectedDate) && availableDates.length > 0 && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        ⚠️ This doctor is not available on this date. Please select from the available dates below.
                      </div>
                    )}
                    
                    {availableDates.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Quick Select - Available Dates:
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                          {availableDates.slice(0, 15).map((date) => {
                            const dateObj = new Date(date);
                            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNumber = dateObj.getDate();
                            const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                            
                            return (
                              <button
                                key={date}
                                type="button"
                                onClick={() => setSelectedDate(date)}
                                className={`p-2 text-xs border rounded-lg transition-colors flex flex-col items-center ${
                                  selectedDate === date
                                    ? 'border-clinic-600 bg-clinic-50 text-clinic-600'
                                    : 'border-green-200 bg-green-50 hover:border-green-300 text-green-700'
                                }`}
                              >
                                <span className="font-medium">{dayName}</span>
                                <span className="text-lg font-bold">{dayNumber}</span>
                                <span>{monthName}</span>
                              </button>
                            );
                          })}
                        </div>
                        {availableDates.length > 15 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Showing first 15 available dates. Use the date picker above for more options.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 text-sm border rounded-lg transition-colors ${
                              selectedSlot === slot
                                ? 'border-clinic-600 bg-clinic-50 text-clinic-600'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No available slots for this date</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Booking Summary & Submit */}
          {selectedDoctor && selectedDate && selectedSlot && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">Dr. {selectedDoctorInfo?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialty:</span>
                    <span className="font-medium">{selectedDoctorInfo?.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">{formData.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedSlot}</span>
                  </div>
                  {formData.reason && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium">{formData.reason}</span>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Booking Appointment...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
        )}
      </main>
    </div>
  );
} 