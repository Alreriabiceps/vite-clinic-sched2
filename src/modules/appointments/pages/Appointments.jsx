import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, LoadingSpinner, appointmentsAPI, extractData, handleAPIError, useAuth, toast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../shared';
import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Plus, Search, Filter, Clock, User, Phone, CheckCircle, AlertTriangle, XCircle, X, List, CalendarDays, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

// Set up the date localizer for the calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// List of Philippine holidays for the calendar
const holidays = [
  // 2023 PH Holidays
  { title: "New Year's Day", start: new Date(2023, 0, 1), end: new Date(2023, 0, 1), allDay: true, isHoliday: true },
  { title: 'Araw ng Kagitingan', start: new Date(2023, 3, 9), end: new Date(2023, 3, 9), allDay: true, isHoliday: true },
  { title: 'Maundy Thursday', start: new Date(2023, 3, 6), end: new Date(2023, 3, 6), allDay: true, isHoliday: true },
  { title: 'Good Friday', start: new Date(2023, 3, 7), end: new Date(2023, 3, 7), allDay: true, isHoliday: true },
  { title: 'Labor Day', start: new Date(2023, 4, 1), end: new Date(2023, 4, 1), allDay: true, isHoliday: true },
  { title: 'Independence Day', start: new Date(2023, 5, 12), end: new Date(2023, 5, 12), allDay: true, isHoliday: true },
  { title: 'Ninoy Aquino Day', start: new Date(2023, 7, 21), end: new Date(2023, 7, 21), allDay: true, isHoliday: true },
  { title: 'National Heroes Day', start: new Date(2023, 7, 28), end: new Date(2023, 7, 28), allDay: true, isHoliday: true },
  { title: 'Bonifacio Day', start: new Date(2023, 10, 30), end: new Date(2023, 10, 30), allDay: true, isHoliday: true },
  { title: 'Christmas Day', start: new Date(2023, 11, 25), end: new Date(2023, 11, 25), allDay: true, isHoliday: true },
  { title: 'Rizal Day', start: new Date(2023, 11, 30), end: new Date(2023, 11, 30), allDay: true, isHoliday: true },
  
  // 2024 PH Holidays
  { title: "New Year's Day", start: new Date(2024, 0, 1), end: new Date(2024, 0, 1), allDay: true, isHoliday: true },
  { title: 'Araw ng Kagitingan', start: new Date(2024, 3, 9), end: new Date(2024, 3, 9), allDay: true, isHoliday: true },
  { title: 'Maundy Thursday', start: new Date(2024, 2, 28), end: new Date(2024, 2, 28), allDay: true, isHoliday: true },
  { title: 'Good Friday', start: new Date(2024, 2, 29), end: new Date(2024, 2, 29), allDay: true, isHoliday: true },
  { title: 'Labor Day', start: new Date(2024, 4, 1), end: new Date(2024, 4, 1), allDay: true, isHoliday: true },
  { title: 'Independence Day', start: new Date(2024, 5, 12), end: new Date(2024, 5, 12), allDay: true, isHoliday: true },
  { title: 'Ninoy Aquino Day', start: new Date(2024, 7, 21), end: new Date(2024, 7, 21), allDay: true, isHoliday: true },
  { title: 'National Heroes Day', start: new Date(2024, 7, 26), end: new Date(2024, 7, 26), allDay: true, isHoliday: true },
  { title: 'Bonifacio Day', start: new Date(2024, 10, 30), end: new Date(2024, 10, 30), allDay: true, isHoliday: true },
  { title: 'Christmas Day', start: new Date(2024, 11, 25), end: new Date(2024, 11, 25), allDay: true, isHoliday: true },
  { title: 'Rizal Day', start: new Date(2024, 11, 30), end: new Date(2024, 11, 30), allDay: true, isHoliday: true },
];

const allDoctorNames = ['Dr. Maria Sarah L. Manaloto', 'Dr. Shara Laine S. Vino'];

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [filter, setFilter] = useState('all'); // Removed - using statusTab and dateRange instead
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [statusTab, setStatusTab] = useState('all'); // 'active', 'completed', 'all'
  const [dateRange, setDateRange] = useState('all'); // 'today', 'week', 'month', 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Fixed items per page
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [doctorFilter, setDoctorFilter] = useState(allDoctorNames);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    contactNumber: '',
    doctorName: allDoctorNames[0],
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00 AM',
    serviceType: '',
    reasonForVisit: '',
  });
  const [creating, setCreating] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);
  
  // Confirmation modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionAppointment, setActionAppointment] = useState(null);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM'
  ];

  const obgyneServices = [
    'PRENATAL_CHECKUP',
    'POSTNATAL_CHECKUP',
    'CHILDBIRTH_CONSULTATION',
    'DILATATION_CURETTAGE',
    'FAMILY_PLANNING',
    'PAP_SMEAR',
    'WOMEN_VACCINATION',
    'PCOS_CONSULTATION',
    'STI_CONSULTATION',
    'INFERTILITY_CONSULTATION',
    'MENOPAUSE_CONSULTATION',
  ];
  const pediatricServices = [
    'NEWBORN_CONSULTATION',
    'WELL_BABY_CHECKUP',
    'WELL_CHILD_CHECKUP',
    'PEDIATRIC_EVALUATION',
    'CHILD_VACCINATION',
    'EAR_PIERCING',
    'PEDIATRIC_REFERRAL',
  ];

  const getDoctorType = (doctorName) => {
    if (doctorName.includes('Maria')) return 'ob-gyne';
    return 'pediatric';
  };

  const getServiceOptions = (doctorType) => {
    return doctorType === 'ob-gyne' ? obgyneServices : pediatricServices;
  };

  useEffect(() => {
    fetchAppointments();
  }, [viewMode]); // Only refetch when view mode changes

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      let params = {
        // Fetch all appointments and filter on frontend
        limit: 1000 
      };
      
      const response = await appointmentsAPI.getAll(params);
      const data = extractData(response);
      console.log('Fetched appointments:', data.appointments);
      if (data.appointments && data.appointments.length > 0) {
        console.log('Sample appointment structure:', data.appointments[0]);
      }
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

  const handleDoctorFilterChange = (doctor) => {
    setDoctorFilter(prev =>
      prev.includes(doctor)
        ? prev.filter(d => d !== doctor)
        : [...prev, doctor]
    );
  };

  const visibleAppointments = appointments.filter(appointment => {
    const searchMatch = !searchTerm || getPatientName(appointment).toLowerCase().includes(searchTerm.toLowerCase());
    const doctorMatch = doctorFilter.includes(appointment.doctorName);
    
    // Status tab filtering
    const matchesStatusTab = (() => {
      if (statusTab === 'active') {
        return ['scheduled', 'confirmed', 'in-progress'].includes(appointment.status);
      } else if (statusTab === 'completed') {
        return ['completed', 'cancelled', 'no-show'].includes(appointment.status);
      }
      return true; // 'all' tab
    })();
    
    // Date range filtering
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    const matchesDateRange = (() => {
      if (dateRange === 'today') {
        return appointmentDate.toDateString() === today.toDateString();
      } else if (dateRange === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return appointmentDate >= weekStart && appointmentDate <= weekEnd;
      } else if (dateRange === 'month') {
        return appointmentDate.getMonth() === today.getMonth() && 
               appointmentDate.getFullYear() === today.getFullYear();
      }
      return true; // 'all' date range
    })();
    
    return searchMatch && doctorMatch && matchesStatusTab && matchesDateRange;
  });

  // Debug logging
  console.log('Filtering results:', {
    totalAppointments: appointments.length,
    visibleAppointments: visibleAppointments.length,
    statusTab,
    dateRange,
    doctorFilter
  });
  
  // Pagination logic
  const totalPages = Math.ceil(visibleAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = visibleAppointments.slice(startIndex, endIndex);
  
  // Group appointments by doctor for the list view
  const appointmentsByDoctor = paginatedAppointments.reduce((acc, appointment) => {
    const doctor = appointment.doctorName;
    if (!acc[doctor]) {
      acc[doctor] = [];
    }
    acc[doctor].push(appointment);
    return acc;
  }, {});

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, dateRange, searchTerm]);

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
  
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };
  
  const cancelAppointment = async (appointmentId) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, { status: 'cancelled' });
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(handleAPIError(error));
    }
  };

  // Confirmation modal handlers
  const handleConfirmClick = (appointment) => {
    setActionAppointment(appointment);
    setShowConfirmModal(true);
  };

  const handleCompleteClick = (appointment) => {
    setActionAppointment(appointment);
    setShowCompleteModal(true);
  };

  const handleCancelClickModal = (appointment) => {
    setActionAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmAppointment = async () => {
    if (actionAppointment) {
      await updateAppointmentStatus(actionAppointment._id, 'confirmed');
      setShowConfirmModal(false);
      setActionAppointment(null);
    }
  };

  const completeAppointment = async () => {
    if (actionAppointment) {
      await updateAppointmentStatus(actionAppointment._id, 'completed');
      setShowCompleteModal(false);
      setActionAppointment(null);
    }
  };

  const cancelAppointmentConfirmed = async () => {
    if (actionAppointment) {
      await cancelAppointment(actionAppointment._id);
      setShowCancelModal(false);
      setActionAppointment(null);
    }
  };
  
  // Convert appointments to calendar events
  const getCalendarEvents = () => {
    const events = visibleAppointments.map(appointment => {
      // Parse appointment date and time to create start and end Date objects
      const dateStr = appointment.appointmentDate.split('T')[0];
      const timeStr = appointment.appointmentTime;
      
      // Convert 12-hour format to 24-hour for date parsing
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      
      if (period === 'PM' && hour24 < 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      const startDate = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes}:00`);
      const endDate = new Date(startDate);
      endDate.setMinutes(startDate.getMinutes() + 30); // Assuming 30-minute appointments
      
      // Enhanced color scheme based on clinic palette
      let backgroundColor, borderColor, textColor;
      
      // Status-based colors first
      if (appointment.status === 'cancelled') {
        backgroundColor = '#fecaca'; // red-200
        borderColor = '#ef4444'; // red-500
        textColor = '#991b1b'; // red-800
      } else if (appointment.status === 'completed') {
        backgroundColor = '#d1fae5'; // green-200
        borderColor = '#10b981'; // green-500
        textColor = '#064e3b'; // green-900
      } else {
        // Doctor-based colors for active appointments
        if (appointment.doctorName.includes('Maria')) {
          backgroundColor = '#fce7f3'; // pink-100 (OB-GYNE)
          borderColor = '#d6457a'; // warm-pink
          textColor = '#881337'; // pink-900
        } else {
          backgroundColor = '#dce3d5'; // soft-olive-200 (Pediatric)
          borderColor = '#84cc16'; // lime-500
          textColor = '#365314'; // lime-900
        }
        
        // Status variations for active appointments
        if (appointment.status === 'confirmed') {
          backgroundColor = appointment.doctorName.includes('Maria') ? '#fbcfe8' : '#bef264'; // More saturated
          borderColor = appointment.doctorName.includes('Maria') ? '#d6457a' : '#65a30d';
        }
      }
      
      return {
        id: appointment._id,
        title: getPatientName(appointment),
        start: startDate,
        end: endDate,
        backgroundColor,
        borderColor,
        textColor,
        appointment: appointment,
        resource: {
          doctorType: appointment.doctorName.includes('Maria') ? 'ob-gyne' : 'pediatric',
          status: appointment.status,
          serviceType: appointment.serviceType,
          patientName: getPatientName(appointment),
          time: appointment.appointmentTime
        }
      };
    });
    
    // Enhanced holiday events
    const holidayEvents = holidays.map(holiday => ({
      ...holiday,
      backgroundColor: '#fef2f2', // red-50
      borderColor: '#ef4444', // red-500
      textColor: '#7f1d1d', // red-900
      isHoliday: true
    }));
    
    // Combine appointments with holidays
    return [...events, ...holidayEvents];
  };

  // Enhanced Google Calendar-like event component
  const EventComponent = ({ event }) => {
    if (event.isHoliday) {
      return (
        <div 
          className="px-2 py-1 text-xs rounded-md border-l-4 overflow-hidden shadow-sm"
          style={{ 
            backgroundColor: event.backgroundColor,
            borderLeftColor: event.borderColor,
            color: event.textColor
          }}
        >
          <div className="font-semibold truncate">{event.title}</div>
          <div className="text-xs opacity-75">🎉 Holiday</div>
        </div>
      );
    }
    
    const { appointment, resource } = event;
    const statusIcon = appointment?.status === 'confirmed' ? '✓' : 
                      appointment?.status === 'completed' ? '✅' : 
                      appointment?.status === 'cancelled' ? '❌' : '📅';
    
    return (
      <div 
        className="px-2 py-1 text-xs rounded-md border-l-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        style={{ 
          backgroundColor: event.backgroundColor,
          borderLeftColor: event.borderColor,
          color: event.textColor
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold truncate flex-1">{resource?.patientName}</div>
          <div className="text-xs ml-1">{statusIcon}</div>
        </div>
        
        <div className="flex items-center gap-1 mb-1">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="text-xs font-medium">{resource?.time}</span>
        </div>
        
        <div className="text-xs opacity-90 truncate">
          {resource?.serviceType?.replace(/_/g, ' ') || 'Consultation'}
        </div>
        
        {appointment?.status && appointment.status !== 'scheduled' && (
          <div className="text-xs capitalize mt-1 font-semibold opacity-75">
            {appointment.status}
          </div>
        )}
      </div>
    );
  };
  
  // Handle calendar event selection
  const handleEventSelect = (event) => {
    if (event.isHoliday) return; // Do nothing for holidays
    
    if (event.appointment) {
      setSelectedAppointment(event.appointment);
      setShowDetailsModal(true);
    }
  };

  const handleRescheduleClick = () => {
    setShowDetailsModal(false);
    setShowRescheduleModal(true);
  };
  
  const handleCancelClick = () => {
    if (selectedAppointment) {
      cancelAppointment(selectedAppointment._id);
      setShowDetailsModal(false);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    if (viewMode === 'calendar') {
      const selectedDate = format(slotInfo.start, 'yyyy-MM-dd');
      const selectedTime = format(slotInfo.start, 'h:mm a');
      
      setNewAppointment(prev => ({
        ...prev,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime
      }));
      
      setShowNewAppointmentModal(true);
      toast.info(`Creating appointment for ${format(slotInfo.start, 'MMM d, yyyy')} at ${selectedTime}`);
    }
  };

  // Custom calendar toolbar component
  const CustomToolbar = ({ date, view, onNavigate, onView }) => {
    const navigate = (action) => {
      onNavigate(action);
    };

    const viewNamesGroup = {
      month: 'Month',
      week: 'Week', 
      day: 'Day',
      agenda: 'Agenda'
    };

    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-gradient-to-r from-off-white to-light-blush-50 rounded-lg border border-soft-olive-200">
        {/* Navigation and Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('PREV')}
              className="border-soft-olive-300 hover:bg-soft-olive-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('TODAY')}
              className="border-soft-olive-300 hover:bg-soft-olive-100 px-4"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('NEXT')}
              className="border-soft-olive-300 hover:bg-soft-olive-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xl font-semibold text-charcoal">
            {format(date, view === 'month' ? 'MMMM yyyy' : 
                         view === 'week' ? 'MMM d, yyyy' : 
                         'EEEE, MMM d, yyyy')}
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          {Object.entries(viewNamesGroup).map(([key, label]) => (
            <Button
              key={key}
              variant={view === key ? "default" : "outline"}
              size="sm"
              onClick={() => onView(key)}
              className={view === key ? 
                "bg-warm-pink hover:bg-warm-pink-600 text-white" : 
                "border-soft-olive-300 hover:bg-soft-olive-100"
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const handleNewAppointmentChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatientSearch = (e) => {
    const value = e.target.value;
    setPatientSearch(value);
    setSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!value.trim()) {
        setPatientResults([]);
        setSearching(false);
        return;
      }
      try {
        const res = await patientsAPI.search({ q: value });
        setPatientResults(res.data.data.patients || []);
      } catch (err) {
        setPatientResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.patientId + ' - ' + (patient.obGyneRecord?.patientName || patient.pediatricRecord?.nameOfChildren || ''));
    setPatientResults([]);
    setNewAppointment((prev) => ({
      ...prev,
      patientName: patient.obGyneRecord?.patientName || patient.pediatricRecord?.nameOfChildren || '',
      contactNumber: patient.contactInfo?.primaryPhone || '',
    }));
  };

  const handleCreateAppointment = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    const doctorType = getDoctorType(newAppointment.doctorName);
    const serviceOptions = getServiceOptions(doctorType);
    if (!serviceOptions.includes(newAppointment.serviceType)) {
      toast.error('Please select a valid service type');
      return;
    }
    if (!newAppointment.patientName.trim() || !newAppointment.contactNumber.trim()) {
      toast.error('Patient name and contact number are required');
      return;
    }
    if (!newAppointment.doctorName || !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      await appointmentsAPI.create({
        patientId: selectedPatient.patientId,
        doctorType,
        doctorName: newAppointment.doctorName,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        serviceType: newAppointment.serviceType,
        contactInfo: { primaryPhone: newAppointment.contactNumber },
        patientName: newAppointment.patientName.trim(),
        contactNumber: newAppointment.contactNumber.trim(),
        reasonForVisit: newAppointment.reasonForVisit.trim(),
        bookingSource: 'staff',
      });
      toast.success('Appointment created successfully');
      setShowNewAppointmentModal(false);
      setSelectedPatient(null);
      setPatientSearch('');
      setNewAppointment({
        patientName: '',
        contactNumber: '',
        doctorName: allDoctorNames[0],
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '09:00 AM',
        serviceType: '',
        reasonForVisit: '',
      });
      fetchAppointments();
    } catch (error) {
      toast.error(handleAPIError(error) || 'Failed to create appointment');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-warm-pink/5 to-soft-olive-100/50 p-4 rounded-lg border border-soft-olive-200">
        <div>
          <h1 className="text-2xl font-bold text-charcoal mb-1">Appointments</h1>
          <p className="text-muted-gold">Manage patient appointments and schedules</p>
        </div>
        <Button 
          className="bg-warm-pink hover:bg-warm-pink-600 text-white font-medium px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200" 
          onClick={() => setShowNewAppointmentModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters and View Tabs */}
      <Card className="bg-off-white border-soft-olive-200">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-gold" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-soft-olive-300 rounded-md focus:ring-2 focus:ring-warm-pink focus:border-warm-pink text-charcoal placeholder-muted-gold bg-white"
                />
              </div>
            </div>
            
            {/* View Tabs */}
            <div className="flex items-center border border-soft-olive-300 rounded-md overflow-hidden bg-white">
              <button
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-warm-pink text-white' 
                    : 'bg-white text-charcoal hover:bg-soft-olive-50'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-warm-pink text-white' 
                    : 'bg-white text-charcoal hover:bg-soft-olive-50'
                }`}
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="h-4 w-4" />
                Calendar
              </button>
            </div>
            
            {/* Date Range Filters */}
            <div className="flex gap-2">
              <Button 
                className={`flex items-center gap-2 px-3 py-2 font-medium ${
                  dateRange === 'today' 
                    ? 'bg-soft-olive-500 hover:bg-soft-olive-600 text-white' 
                    : 'border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50'
                }`}
                variant={dateRange === 'today' ? 'default' : 'outline'}
                onClick={() => setDateRange('today')}
              >
                <CalendarIcon className="h-4 w-4" />
                Today
              </Button>
              <Button 
                className={`flex items-center gap-2 px-3 py-2 font-medium ${
                  dateRange === 'week' 
                    ? 'bg-soft-olive-500 hover:bg-soft-olive-600 text-white' 
                    : 'border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50'
                }`}
                variant={dateRange === 'week' ? 'default' : 'outline'}
                onClick={() => setDateRange('week')}
              >
                <CalendarIcon className="h-4 w-4" />
                Week
              </Button>
              <Button 
                className={`flex items-center gap-2 px-3 py-2 font-medium ${
                  dateRange === 'month' 
                    ? 'bg-soft-olive-500 hover:bg-soft-olive-600 text-white' 
                    : 'border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50'
                }`}
                variant={dateRange === 'month' ? 'default' : 'outline'}
                onClick={() => setDateRange('month')}
              >
                <CalendarIcon className="h-4 w-4" />
                Month
              </Button>
              <Button 
                className={`flex items-center gap-2 px-3 py-2 font-medium ${
                  dateRange === 'all' 
                    ? 'bg-muted-gold hover:bg-muted-gold-600 text-white' 
                    : 'border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50'
                }`}
                variant={dateRange === 'all' ? 'default' : 'outline'}
                onClick={() => setDateRange('all')}
              >
                <Filter className="h-4 w-4" />
                All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs - Only show for list view */}
      {viewMode === 'list' && (
        <Card className="bg-off-white border border-soft-olive-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-soft-olive-200">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    statusTab === 'active'
                      ? 'bg-warm-pink text-white shadow-sm'
                      : 'text-charcoal hover:bg-soft-olive-50'
                  }`}
                  onClick={() => setStatusTab('active')}
                >
                  Active Appointments
                  <span className="ml-2 px-2 py-1 text-xs bg-soft-olive-100 text-muted-gold rounded-full">
                    {visibleAppointments.filter(apt => ['scheduled', 'confirmed', 'in-progress'].includes(apt.status)).length}
                  </span>
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    statusTab === 'completed'
                      ? 'bg-warm-pink text-white shadow-sm'
                      : 'text-charcoal hover:bg-soft-olive-50'
                  }`}
                  onClick={() => setStatusTab('completed')}
                >
                  Completed & Cancelled
                  <span className="ml-2 px-2 py-1 text-xs bg-soft-olive-100 text-muted-gold rounded-full">
                    {visibleAppointments.filter(apt => ['completed', 'cancelled', 'no-show'].includes(apt.status)).length}
                  </span>
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    statusTab === 'all'
                      ? 'bg-warm-pink text-white shadow-sm'
                      : 'text-charcoal hover:bg-soft-olive-50'
                  }`}
                  onClick={() => setStatusTab('all')}
                >
                  All Appointments
                  <span className="ml-2 px-2 py-1 text-xs bg-soft-olive-100 text-muted-gold rounded-full">
                    {visibleAppointments.length}
                  </span>
                </button>
              </div>
              
              {/* Archive Button */}
              {statusTab === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-muted-gold text-muted-gold hover:bg-muted-gold hover:text-white"
                  onClick={() => {
                    // TODO: Implement archive functionality
                    toast.info('Archive feature coming soon!');
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Old
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Statistics - Only show for list view */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">
              {appointments.filter(apt => apt.status === 'scheduled').length}
            </div>
            <div className="text-sm text-blue-600">Scheduled</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {appointments.filter(apt => apt.status === 'confirmed').length}
            </div>
            <div className="text-sm text-green-600">Confirmed</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">
              {appointments.filter(apt => apt.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {appointments.filter(apt => apt.status === 'cancelled').length}
            </div>
            <div className="text-sm text-red-600">Cancelled</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Calendar View - Google Calendar Style */}
          {viewMode === 'calendar' && (
            <Card className="overflow-hidden shadow-md">
              <div className="flex items-center justify-between bg-white px-6 py-4 border-b">
                <div className="flex items-center space-x-4">
                  <h3 className="font-medium text-lg text-gray-800">Calendar</h3>
                  <div className="bg-clinic-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {format(currentDate, 'MMMM yyyy')}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-0.5 text-sm"
                    value={format(currentDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      const timezoneOffset = newDate.getTimezoneOffset() * 60000;
                      setCurrentDate(new Date(newDate.getTime() + timezoneOffset));
                    }}
                  />
                  <button 
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-1"
                    onClick={() => {
                      // Navigate to previous view
                      const calendarRef = document.querySelector('.rbc-calendar');
                      if (calendarRef) {
                        const navigateButtons = calendarRef.querySelectorAll('.rbc-btn-group button');
                        if (navigateButtons && navigateButtons.length >= 2) {
                          navigateButtons[0].click(); // Navigate back button
                        }
                      }
                      setCurrentDate(prev => {
                        const newDate = new Date(prev);
                        newDate.setMonth(prev.getMonth() - 1);
                        return newDate;
                      });
                    }}
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button 
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-1"
                    onClick={() => {
                      // Navigate to next view
                      const calendarRef = document.querySelector('.rbc-calendar');
                      if (calendarRef) {
                        const navigateButtons = calendarRef.querySelectorAll('.rbc-btn-group button');
                        if (navigateButtons && navigateButtons.length >= 3) {
                          navigateButtons[2].click(); // Navigate next button
                        }
                      }
                      setCurrentDate(prev => {
                        const newDate = new Date(prev);
                        newDate.setMonth(prev.getMonth() + 1);
                        return newDate;
                      });
                    }}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                  <button 
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-sm"
                    onClick={() => {
                      // Navigate to today
                      setCurrentDate(new Date());
                      
                      // Also click the today button to keep the calendar in sync
                      const calendarRef = document.querySelector('.rbc-calendar');
                      if (calendarRef) {
                        const todayButton = calendarRef.querySelector('.rbc-btn-group button:first-child');
                        if (todayButton) todayButton.click();
                      }
                    }}
                  >
                    Today
                  </button>
                </div>
              </div>
              
              <div className="flex border-b">
                {['month', 'week', 'day', 'agenda'].map((view) => {
                  const viewName = view.charAt(0).toUpperCase() + view.slice(1);
                  return (
                    <button
                      key={view}
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        currentView === view
                          ? 'border-clinic-600 text-clinic-600'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentView(view)}
                    >
                      {viewName}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex h-[700px]">
                <div className="hidden md:block w-60 border-r p-4 bg-white overflow-y-auto">
                  <div className="mb-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Doctors</div>
                    <div className="space-y-2">
                      {allDoctorNames.map(doctor => (
                        <div key={doctor} className="flex items-center">
                          <input
                            type="checkbox"
                            id={doctor}
                            name="doctorFilter"
                            checked={doctorFilter.includes(doctor)}
                            onChange={() => handleDoctorFilterChange(doctor)}
                            className="h-4 w-4 rounded border-gray-300 text-clinic-600 focus:ring-clinic-500 cursor-pointer"
                          />
                          <label htmlFor={doctor} className="ml-2 text-sm text-gray-700 cursor-pointer">
                            {doctor.replace('Dr. ', '').split(' ').slice(0, 2).join(' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-gold mb-3">
                      Calendar Legend
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-3 rounded-sm mr-3 border-l-4 border-warm-pink" style={{ backgroundColor: '#fce7f3' }}></div>
                        <span className="text-charcoal">OB-GYNE (Dr. Maria)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-3 rounded-sm mr-3 border-l-4 border-lime-500" style={{ backgroundColor: '#dce3d5' }}></div>
                        <span className="text-charcoal">Pediatrics (Dr. Shara)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-3 rounded-sm mr-3 border-l-4 border-green-500" style={{ backgroundColor: '#d1fae5' }}></div>
                        <span className="text-charcoal">Completed</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-3 rounded-sm mr-3 border-l-4 border-red-500" style={{ backgroundColor: '#fecaca' }}></div>
                        <span className="text-charcoal">Cancelled</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-3 rounded-sm mr-3 border-l-4 border-red-500" style={{ backgroundColor: '#fef2f2' }}></div>
                        <span className="text-charcoal">🎉 Holidays</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                      Upcoming Holidays
                    </div>
                    <div className="space-y-2 text-sm">
                      {holidays
                        .filter(h => new Date(h.start) >= new Date())
                        .slice(0, 5)
                        .map((holiday, idx) => (
                          <div key={idx} className="flex items-center text-xs py-1 border-b border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                            <div className="flex flex-col">
                              <span className="font-medium">{holiday.title}</span>
                              <span className="text-gray-500">{format(new Date(holiday.start), 'EEE, MMM d')}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                      Quick Actions
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-left"
                        onClick={() => setShowNewAppointmentModal(true)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        New Appointment
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-left"
                        onClick={() => {
                          // Toggle to show today's appointments only
                          if (dateRange === 'all') {
                            setDateRange('today');
                          } else {
                            setDateRange('all');
                          }
                          toast.info(dateRange === 'today' ? "Showing all appointments" : "Showing today's appointments");
                        }}
                      >
                        <Filter className="h-3.5 w-3.5 mr-2" />
                        {dateRange === 'all' ? "Today Only" : "All Appointments"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto bg-white rounded-lg">
                  {/* Custom Toolbar */}
                  <CustomToolbar
                    date={currentDate}
                    view={currentView}
                    onNavigate={(action) => {
                      let newDate = new Date(currentDate);
                      if (action === 'PREV') {
                        newDate = currentView === 'month' ? 
                          new Date(newDate.getFullYear(), newDate.getMonth() - 1) :
                          currentView === 'week' ?
                          new Date(newDate.getTime() - 7 * 24 * 60 * 60 * 1000) :
                          new Date(newDate.getTime() - 24 * 60 * 60 * 1000);
                      } else if (action === 'NEXT') {
                        newDate = currentView === 'month' ? 
                          new Date(newDate.getFullYear(), newDate.getMonth() + 1) :
                          currentView === 'week' ?
                          new Date(newDate.getTime() + 7 * 24 * 60 * 60 * 1000) :
                          new Date(newDate.getTime() + 24 * 60 * 60 * 1000);
                      } else if (action === 'TODAY') {
                        newDate = new Date();
                      }
                      setCurrentDate(newDate);
                    }}
                    onView={setCurrentView}
                  />
                  
                  {/* Calendar */}
                  <div className="px-4 pb-4" style={{ height: 'calc(100% - 120px)' }}>
                    <Calendar
                      localizer={localizer}
                      events={getCalendarEvents()}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: '100%' }}
                      view={currentView}
                      onView={setCurrentView}
                      date={currentDate}
                      onNavigate={setCurrentDate}
                      views={['month', 'week', 'day', 'agenda']}
                      toolbar={false} // Use our custom toolbar
                      components={{
                        event: EventComponent
                      }}
                      onSelectEvent={handleEventSelect}
                      onSelectSlot={handleSelectSlot}
                      selectable
                      step={30}
                      timeslots={2}
                      eventPropGetter={(event) => ({
                        style: {
                          backgroundColor: 'transparent', // Let the EventComponent handle colors
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0',
                          boxShadow: 'none'
                        }
                      })}
                      dayPropGetter={(date) => {
                        const today = new Date();
                        const isToday = date.getDate() === today.getDate() && 
                                      date.getMonth() === today.getMonth() &&
                                      date.getFullYear() === today.getFullYear();
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        const isPast = date < today.setHours(0, 0, 0, 0);
                        
                        let className = '';
                        let style = {};
                        
                        if (isToday) {
                          className = 'google-today';
                          style = {
                            backgroundColor: '#e8f0fe',
                            fontWeight: '600'
                          };
                        } else if (isWeekend) {
                          className = 'google-weekend';
                          style = {
                            backgroundColor: '#fafafa'
                          };
                        } else if (isPast) {
                          style = {
                            backgroundColor: '#f8f9fa',
                            color: '#9aa0a6'
                          };
                        }
                        
                        return {
                          className,
                          style: {
                            ...style,
                            borderRadius: '4px',
                            margin: '1px'
                          }
                        };
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (visibleAppointments.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {Object.entries(appointmentsByDoctor).map(([doctorName, doctorAppointments]) => (
                <Card key={doctorName} className="bg-off-white border-soft-olive-200">
                  <CardHeader className="bg-gradient-to-r from-warm-pink/10 to-soft-olive-100 border-b border-soft-olive-200">
                    <CardTitle className="flex items-center gap-2 text-charcoal">
                      <div className={`h-3 w-3 rounded-full ${
                        doctorName.includes('Maria') ? 'bg-warm-pink' : 'bg-muted-gold'
                      }`}></div>
                      <span className="font-semibold">{doctorName}</span>
                    </CardTitle>
                    <CardDescription className="text-muted-gold text-sm">
                      {doctorName.includes('Maria') ? 'OB-GYNE Specialist' : 'Pediatric Specialist'} • 
                      {dateRange === 'today' ? " Today's Schedule" : ` ${doctorAppointments.length} appointment(s)`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    {doctorAppointments.length === 0 ? (
                      <div className="text-center py-12 text-muted-gold">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-soft-olive-400" />
                        <p className="text-lg">No appointments {dateRange === 'today' ? 'today' : 'found'}</p>
                      </div>
                    ) : (
                      doctorAppointments.map((appointment) => (
                        <div 
                          key={appointment._id} 
                          className="bg-white border border-soft-olive-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Patient Info Header */}
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-warm-pink/10 rounded-md">
                                  <User className="h-4 w-4 text-warm-pink" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-charcoal">{getPatientName(appointment)}</h3>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(appointment.status)}
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                      appointment.status === 'scheduled' ? 'bg-soft-olive-100 text-soft-olive-700' :
                                      appointment.status === 'confirmed' ? 'bg-warm-pink/10 text-warm-pink-700' :
                                      appointment.status === 'completed' ? 'bg-muted-gold/20 text-muted-gold-700' :
                                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-1 text-sm text-muted-gold">
                                <p className="font-medium text-charcoal">{appointment.serviceType.replace(/_/g, ' ')}</p>
                                {appointment.reasonForVisit && (
                                  <p className="italic bg-soft-olive-50 p-2 rounded text-xs">"{appointment.reasonForVisit}"</p>
                                )}
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span className="text-xs">{getContactInfo(appointment)}</span>
                                  <span className="text-xs px-2 py-0.5 bg-light-blush rounded-full">
                                    {getBookingSource(appointment)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Time Info */}
                            <div className="text-center lg:text-right bg-gradient-to-br from-soft-olive-50 to-light-blush/30 p-3 rounded-md border border-soft-olive-200">
                              <div className="text-lg font-bold text-warm-pink">{formatTime(appointment.appointmentTime)}</div>
                              {dateRange !== 'today' && (
                                <p className="text-xs text-muted-gold mt-1">{formatDate(appointment.appointmentDate)}</p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="border-t border-soft-olive-100 pt-3">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                              {appointment.status === 'scheduled' && (
                                <Button
                                  size="sm"
                                  className="bg-soft-olive-500 hover:bg-soft-olive-600 text-white"
                                  onClick={() => handleConfirmClick(appointment)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Confirm
                                </Button>
                              )}
                              {appointment.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  className="bg-warm-pink hover:bg-warm-pink-600 text-white"
                                  onClick={() => handleCompleteClick(appointment)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Complete
                                </Button>
                              )}
                              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-muted-gold text-muted-gold hover:bg-muted-gold hover:text-white"
                                  onClick={() => handleReschedule(appointment)}
                                >
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  Reschedule
                                </Button>
                              )}
                              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                  onClick={() => handleCancelClickModal(appointment)}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <Card className="bg-off-white border-soft-olive-200">
              <CardContent className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-soft-olive-50 to-light-blush/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-muted-gold" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">No appointments found</h3>
                <p className="text-muted-gold mb-4 max-w-md mx-auto">
                  {searchTerm 
                      ? `No appointments found matching "${searchTerm}"`
                      : doctorFilter.length === 0
                        ? 'Select a doctor to view appointments'
                        : 'No appointments found for the selected criteria'
                  }
                </p>
                <Button 
                  className="bg-warm-pink hover:bg-warm-pink-600 text-white font-medium px-4 py-2"
                  onClick={() => setShowNewAppointmentModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Appointment
                </Button>
              </CardContent>
            </Card>
          ) : null)}

          {/* Summary Stats */}
          {visibleAppointments.length > 0 && (
            <Card className="bg-gradient-to-r from-soft-olive-50 to-light-blush/30 border-soft-olive-200">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-charcoal">Appointment Summary</CardTitle>
                <CardDescription className="text-muted-gold">
                  Statistics {dateRange === 'today' ? 'for today' : 'overview'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-soft-olive-200">
                    <div className="w-12 h-12 bg-soft-olive-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-soft-olive-600" />
                    </div>
                    <div className="text-2xl font-bold text-soft-olive-600 mb-1">
                      {visibleAppointments.filter(a => a.status === 'scheduled').length}
                    </div>
                    <div className="text-sm font-medium text-muted-gold">Scheduled</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-soft-olive-200">
                    <div className="w-12 h-12 bg-warm-pink/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-warm-pink" />
                    </div>
                    <div className="text-2xl font-bold text-warm-pink mb-1">
                      {visibleAppointments.filter(a => a.status === 'confirmed').length}
                    </div>
                    <div className="text-sm font-medium text-muted-gold">Confirmed</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-soft-olive-200">
                    <div className="w-12 h-12 bg-muted-gold/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-muted-gold" />
                    </div>
                    <div className="text-2xl font-bold text-muted-gold mb-1">
                      {visibleAppointments.filter(a => a.status === 'completed').length}
                    </div>
                    <div className="text-sm font-medium text-muted-gold">Completed</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-soft-olive-200">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-red-500 mb-1">
                      {visibleAppointments.filter(a => a.status === 'cancelled').length}
                    </div>
                    <div className="text-sm font-medium text-muted-gold">Cancelled</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination Controls - Only show for list view */}
          {viewMode === 'list' && visibleAppointments.length > itemsPerPage && (
            <Card className="bg-off-white border border-soft-olive-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-gold">
                    Showing {startIndex + 1}-{Math.min(endIndex, visibleAppointments.length)} of {visibleAppointments.length} appointments
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and 1 page before/after current
                          return page === 1 || page === totalPages || 
                                 Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const prevPage = array[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;
                          
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-2 text-muted-gold">...</span>
                              )}
                              <Button
                                size="sm"
                                variant={currentPage === page ? "default" : "outline"}
                                className={currentPage === page 
                                  ? "bg-warm-pink text-white" 
                                  : "border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50"
                                }
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })
                      }
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && showDetailsModal && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Appointment Details</span>
                </DialogTitle>
                <div className={`text-sm font-semibold capitalize px-2.5 py-1 rounded-full text-white ${
                  {
                    scheduled: 'bg-blue-500',
                    confirmed: 'bg-green-500',
                    completed: 'bg-gray-500',
                    cancelled: 'bg-red-500',
                  }[selectedAppointment.status] || 'bg-yellow-500'
                }`}>
                  {selectedAppointment.status}
                </div>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-x-4 gap-y-3 py-4 text-sm">
              <div className="col-span-1 font-semibold text-gray-500">Patient</div>
              <div className="col-span-2">{getPatientName(selectedAppointment)}</div>

              <div className="col-span-1 font-semibold text-gray-500">Contact</div>
              <div className="col-span-2">{getContactInfo(selectedAppointment)}</div>

              <div className="col-span-1 font-semibold text-gray-500">Doctor</div>
              <div className="col-span-2">{selectedAppointment.doctorName}</div>

              <div className="col-span-1 font-semibold text-gray-500">Service</div>
              <div className="col-span-2">{selectedAppointment.serviceType.replace(/_/g, ' ')}</div>

              <div className="col-span-1 font-semibold text-gray-500">Schedule</div>
              <div className="col-span-2">{format(new Date(selectedAppointment.appointmentDate), 'EEE, MMM d, yyyy')} at {selectedAppointment.appointmentTime}</div>

              {selectedAppointment.reasonForVisit && (
                <>
                  <div className="col-span-1 font-semibold text-gray-500 pt-1">Reason</div>
                  <div className="col-span-2 bg-gray-50 p-2 rounded-md italic">"{selectedAppointment.reasonForVisit}"</div>
                </>
              )}
            </div>
            
            <DialogFooter className="mt-2 flex justify-between w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              {(selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') && (
                <div className="flex space-x-2">
                  <Button 
                    variant="destructive"
                    onClick={handleCancelClick}
                  >
                    Cancel Appointment
                  </Button>
                  <Button 
                    variant="clinic"
                    onClick={handleRescheduleClick}
                  >
                    Reschedule
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reschedule Modal */}
      {selectedAppointment && (
        <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Reschedule
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 bg-blue-50 p-2 rounded-md text-sm">
                <div className="font-medium">{getPatientName(selectedAppointment)}</div>
                <div className="text-xs text-gray-600">
                  {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.appointmentTime)}
                </div>
                <div className="text-xs">
                  {selectedAppointment.doctorName} · {selectedAppointment.serviceType.replace(/_/g, ' ')}
                </div>
              </div>
              
              <div>
                <label htmlFor="newDate" className="block text-xs font-medium mb-1">New Date</label>
                <input 
                  type="date" 
                  id="newDate" 
                  defaultValue={selectedAppointment.appointmentDate.split('T')[0]}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="newTime" className="block text-xs font-medium mb-1">New Time</label>
                <select 
                  id="newTime" 
                  defaultValue={selectedAppointment.appointmentTime}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                >
                  {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
                    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', 
                    '04:00 PM', '04:30 PM'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <DialogFooter className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="clinic"
                size="sm"
                onClick={() => {
                  const newDate = document.getElementById('newDate').value;
                  const newTime = document.getElementById('newTime').value;
                  
                  if (!newDate || !newTime) {
                    toast.error('Please select both date and time');
                    return;
                  }
                  
                  appointmentsAPI.reschedule(selectedAppointment._id, {
                    newDate: newDate,
                    newTime: newTime,
                    reason: 'Rescheduled by staff'
                  })
                    .then(() => {
                      toast.success('Appointment rescheduled successfully');
                      setShowRescheduleModal(false);
                      fetchAppointments();
                    })
                    .catch((error) => {
                      toast.error(handleAPIError(error) || 'Failed to reschedule appointment');
                      console.error(error);
                    })
                }}
              >
                Reschedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Appointment Modal */}
      <Dialog open={showNewAppointmentModal} onOpenChange={setShowNewAppointmentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleCreateAppointment();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium mb-1">Search Patient *</label>
              <input
                type="text"
                value={patientSearch}
                onChange={handlePatientSearch}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Type name, ID, or contact..."
                required
              />
              {searching && <div className="text-xs text-gray-500">Searching...</div>}
              {patientResults.length > 0 && (
                <div className="border rounded bg-white shadow max-h-40 overflow-y-auto mt-1 z-10">
                  {patientResults.map((p) => (
                    <div
                      key={p._id}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      onClick={() => handleSelectPatient(p)}
                    >
                      {p.patientId} - {p.obGyneRecord?.patientName || p.pediatricRecord?.nameOfChildren || ''} ({p.patientType})
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedPatient && (
              <div className="p-2 bg-blue-50 rounded text-xs mb-2">
                <div><b>Patient ID:</b> {selectedPatient.patientId}</div>
                <div><b>Type:</b> {selectedPatient.patientType}</div>
                <div><b>Contact:</b> {selectedPatient.contactInfo?.primaryPhone}</div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1">Patient Name *</label>
              <input
                type="text"
                name="patientName"
                value={newAppointment.patientName}
                onChange={handleNewAppointmentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Contact Number *</label>
              <input
                type="text"
                name="contactNumber"
                value={newAppointment.contactNumber}
                onChange={handleNewAppointmentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Doctor *</label>
              <select
                name="doctorName"
                value={newAppointment.doctorName}
                onChange={e => {
                  handleNewAppointmentChange(e);
                  setNewAppointment(prev => ({ ...prev, serviceType: '' }));
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                {allDoctorNames.map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date *</label>
              <input
                type="date"
                name="appointmentDate"
                value={newAppointment.appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleNewAppointmentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Time *</label>
              <select
                name="appointmentTime"
                value={newAppointment.appointmentTime}
                onChange={handleNewAppointmentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Service Type *</label>
              <select
                name="serviceType"
                value={newAppointment.serviceType}
                onChange={handleNewAppointmentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select service</option>
                {getServiceOptions(getDoctorType(newAppointment.doctorName)).map((svc) => (
                  <option key={svc} value={svc}>{svc.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Reason for Visit</label>
              <textarea
                name="reasonForVisit"
                value={newAppointment.reasonForVisit}
                onChange={handleNewAppointmentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
            <DialogFooter className="mt-2 flex justify-between w-full">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowNewAppointmentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="clinic"
                type="submit"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Appointment Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-soft-olive-600" />
              Confirm Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-charcoal mb-4">
              Are you sure you want to confirm this appointment?
            </p>
            {actionAppointment && (
              <div className="bg-soft-olive-50 p-3 rounded-lg border border-soft-olive-200">
                <div className="text-sm">
                  <div className="font-semibold text-charcoal">{getPatientName(actionAppointment)}</div>
                  <div className="text-muted-gold">
                    {formatDate(actionAppointment.appointmentDate)} at {formatTime(actionAppointment.appointmentTime)}
                  </div>
                  <div className="text-muted-gold">
                    {actionAppointment.doctorName} • {actionAppointment.serviceType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-soft-olive-500 hover:bg-soft-olive-600 text-white"
              onClick={confirmAppointment}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Appointment Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-warm-pink" />
              Complete Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-charcoal mb-4">
              Are you sure you want to mark this appointment as completed?
            </p>
            {actionAppointment && (
              <div className="bg-warm-pink/10 p-3 rounded-lg border border-warm-pink/20">
                <div className="text-sm">
                  <div className="font-semibold text-charcoal">{getPatientName(actionAppointment)}</div>
                  <div className="text-muted-gold">
                    {formatDate(actionAppointment.appointmentDate)} at {formatTime(actionAppointment.appointmentTime)}
                  </div>
                  <div className="text-muted-gold">
                    {actionAppointment.doctorName} • {actionAppointment.serviceType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-warm-pink hover:bg-warm-pink-600 text-white"
              onClick={completeAppointment}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              Cancel Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-charcoal mb-4">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            {actionAppointment && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="text-sm">
                  <div className="font-semibold text-charcoal">{getPatientName(actionAppointment)}</div>
                  <div className="text-muted-gold">
                    {formatDate(actionAppointment.appointmentDate)} at {formatTime(actionAppointment.appointmentTime)}
                  </div>
                  <div className="text-muted-gold">
                    {actionAppointment.doctorName} • {actionAppointment.serviceType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Appointment
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={cancelAppointmentConfirmed}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 