import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button, LoadingSpinner, Input, toast } from '../../index';
import { Calendar, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { patientBookingAPI, handleAPIError, extractData } from '../../lib/api';

export default function RescheduleRequestModal({ 
  isOpen, 
  onClose, 
  appointment, 
  onSuccess 
}) {
  const [reason, setReason] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [fetchingDates, setFetchingDates] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for rescheduling');
      return;
    }

    try {
      setLoading(true);
      await patientBookingAPI.requestReschedule(appointment.appointmentId, {
        reason: reason.trim(),
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null
      });
      
      toast.success('Reschedule request submitted successfully. Please wait for admin approval.');
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      toast.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors to map doctorName to doctorId
  useEffect(() => {
    if (isOpen && appointment) {
      fetchDoctorId();
    }
  }, [isOpen, appointment]);

  // Fetch available dates when doctorId is determined
  useEffect(() => {
    if (isOpen && doctorId) {
      fetchAvailableDates();
    } else {
      setAvailableDates([]);
      setPreferredDate('');
      setPreferredTime('');
      setAvailableSlots([]);
    }
  }, [isOpen, doctorId]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (isOpen && doctorId && preferredDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setPreferredTime('');
    }
  }, [isOpen, doctorId, preferredDate]);

  const fetchDoctorId = async () => {
    try {
      const response = await patientBookingAPI.getDoctors();
      const data = extractData(response);
      const doctors = data.doctors || [];
      
      // Find the doctor that matches the appointment's doctorName
      const matchedDoctor = doctors.find(d => 
        d.name === appointment.doctorName || 
        d.name === `Dr. ${appointment.doctorName}` ||
        `Dr. ${d.name}` === appointment.doctorName
      );
      
      if (matchedDoctor) {
        setDoctorId(matchedDoctor._id);
      } else {
        // Fallback: try to determine from doctor type in appointment
        // If appointment has doctorType, map accordingly
        if (appointment.doctorType === 'ob-gyne') {
          const obgyneDoctor = doctors.find(d => d.specialty === 'OB-GYNE');
          if (obgyneDoctor) setDoctorId(obgyneDoctor._id);
        } else if (appointment.doctorType === 'pediatric') {
          const pediatricDoctor = doctors.find(d => d.specialty === 'PEDIATRIC');
          if (pediatricDoctor) setDoctorId(pediatricDoctor._id);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Continue without doctorId - user can still select dates manually
    }
  };

  const fetchAvailableDates = async () => {
    if (!doctorId) return;
    
    try {
      setFetchingDates(true);
      const response = await patientBookingAPI.getAvailableDates({
        doctorId: doctorId
      });
      const data = extractData(response);
      setAvailableDates(data.availableDates || []);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      toast.error('Failed to load available dates. You can still select a date manually.');
      setAvailableDates([]);
    } finally {
      setFetchingDates(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!doctorId || !preferredDate) return;
    
    try {
      setFetchingSlots(true);
      const response = await patientBookingAPI.getAvailableSlots({
        doctorId: doctorId,
        date: preferredDate
      });
      const data = extractData(response);
      setAvailableSlots(data.slots || []);
      
      // Clear selected time if it's no longer available
      if (preferredTime && !data.slots?.includes(preferredTime)) {
        setPreferredTime('');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots.');
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setPreferredDate('');
    setPreferredTime('');
    setAvailableDates([]);
    setAvailableSlots([]);
    setDoctorId(null);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setPreferredDate(newDate);
    // Reset time when date changes
    setPreferredTime('');
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

  // Check if a date is available
  const isDateAvailable = (dateString) => {
    if (availableDates.length === 0) return true; // If we couldn't fetch dates, allow any date
    return availableDates.includes(dateString);
  };

  // Calendar component state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  // Format date to YYYY-MM-DD
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get days in month for calendar view
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Navigate calendar month
  const navigateMonth = (direction) => {
    setCalendarMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is in the past
  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle calendar date click
  const handleCalendarDateClick = (date) => {
    if (!date) return;
    const dateString = formatDateString(date);
    
    // Only allow selection if date is not in the past
    if (!isPastDate(date)) {
      setPreferredDate(dateString);
    }
  };

  // Get calendar days
  const calendarDays = getDaysInMonth(calendarMonth);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Update calendar month when preferred date changes
  useEffect(() => {
    if (preferredDate) {
      const selectedDate = new Date(preferredDate + 'T12:00:00');
      if (selectedDate.getMonth() !== calendarMonth.getMonth() || 
          selectedDate.getFullYear() !== calendarMonth.getFullYear()) {
        setCalendarMonth(selectedDate);
      }
    }
  }, [preferredDate]);

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Request Appointment Reschedule</DialogTitle>
              <DialogDescription>
                Submit a reschedule request for admin approval
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Appointment Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-900">Current Appointment</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Doctor:</strong> {appointment.doctorName}</p>
              <p><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {appointment.appointmentTime}</p>
              <p><strong>Patient:</strong> {appointment.patientName}</p>
            </div>
          </div>

          {/* Reschedule Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rescheduling *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need to reschedule this appointment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Preferred New Schedule (Optional) */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Preferred New Schedule (Optional)</h5>
              <p className="text-sm text-gray-600">
                You can suggest a preferred date and time. The admin will consider your preferences when rescheduling.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Input and Calendar */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                      {fetchingDates && <span className="ml-2 text-xs text-gray-500">(Loading...)</span>}
                    </label>
                    <Input
                      type="date"
                      id="preferredDate"
                      value={preferredDate}
                      onChange={handleDateChange}
                      min={getMinDate()}
                      max={getMaxDate()}
                      disabled={loading || fetchingDates}
                      className={preferredDate && !isDateAvailable(preferredDate) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {preferredDate && !isDateAvailable(preferredDate) && availableDates.length > 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        ⚠️ This doctor is not available on this date
                      </p>
                    )}
                  </div>

                  {/* Calendar View with Availability Indicators - Collapsible */}
                  {availableDates.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full text-left text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-between py-2"
                      >
                        <span>{showCalendar ? 'Hide' : 'Show'} Calendar View</span>
                        <Calendar className={`h-4 w-4 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showCalendar && (
                        <div className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <button
                              type="button"
                              onClick={() => navigateMonth(-1)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              disabled={fetchingDates}
                            >
                              <ChevronLeft className="h-4 w-4 text-gray-600" />
                            </button>
                            <h6 className="text-xs font-semibold text-gray-700">
                              {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h6>
                            <button
                              type="button"
                              onClick={() => navigateMonth(1)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              disabled={fetchingDates}
                            >
                              <ChevronRight className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                          
                          {/* Day headers */}
                          <div className="grid grid-cols-7 gap-0.5 mb-1">
                            {dayNames.map(day => (
                              <div key={day} className="text-center text-[10px] font-medium text-gray-600 py-0.5">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar grid - smaller */}
                          <div className="grid grid-cols-7 gap-0.5">
                            {calendarDays.map((date, index) => {
                              if (!date) {
                                return <div key={`empty-${index}`} className="aspect-square"></div>;
                              }
                              
                              const dateString = formatDateString(date);
                              const available = isDateAvailable(dateString);
                              const isSelected = preferredDate === dateString;
                              const isDateToday = isToday(date);
                              const isPast = isPastDate(date);
                              
                              return (
                                <button
                                  key={dateString}
                                  type="button"
                                  onClick={() => handleCalendarDateClick(date)}
                                  disabled={isPast || fetchingDates}
                                  className={`
                                    aspect-square text-[10px] font-medium rounded transition-colors
                                    ${isPast 
                                      ? 'text-gray-300 cursor-not-allowed' 
                                      : isSelected
                                        ? available
                                          ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-400'
                                          : 'bg-red-500 text-white font-bold ring-1 ring-red-400'
                                        : available
                                          ? isDateToday
                                            ? 'bg-green-100 text-green-700 border border-green-500 hover:bg-green-200'
                                            : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                                          : 'bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                                    }
                                  `}
                                  title={isPast ? 'Cannot select past dates' : available ? 'Available' : 'Not available'}
                                >
                                  {date.getDate()}
                                </button>
                              );
                            })}
                          </div>
                          
                          {/* Compact Legend */}
                          <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-2 text-[10px]">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-50 border border-green-300 rounded"></div>
                              <span className="text-gray-600">Available</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-gray-100 rounded line-through"></div>
                              <span className="text-gray-600">Not Available</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-600 rounded"></div>
                              <span className="text-gray-600">Selected</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Time Selection */}
                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                    {fetchingSlots && <span className="ml-2 text-xs text-gray-500">(Loading...)</span>}
                  </label>
                  <select
                    id="preferredTime"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading || fetchingSlots || !preferredDate || !isDateAvailable(preferredDate)}
                  >
                    <option value="">
                      {!preferredDate 
                        ? 'Select a date first' 
                        : !isDateAvailable(preferredDate) 
                          ? 'Date not available' 
                          : availableSlots.length === 0 
                            ? fetchingSlots ? 'Loading slots...' : 'No slots available' 
                            : 'Select preferred time'}
                    </option>
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))
                    ) : preferredDate && isDateAvailable(preferredDate) && !fetchingSlots && (
                      // Fallback: show default time slots if we couldn't fetch specific slots
                      <>
                        <option value="8:00 AM">8:00 AM</option>
                        <option value="8:30 AM">8:30 AM</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="9:30 AM">9:30 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="1:30 PM">1:30 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="2:30 PM">2:30 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="3:30 PM">3:30 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="4:30 PM">4:30 PM</option>
                        <option value="5:00 PM">5:00 PM</option>
                      </>
                    )}
                  </select>
                  {preferredDate && isDateAvailable(preferredDate) && availableSlots.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {availableSlots.length} available slot{availableSlots.length !== 1 ? 's' : ''} on this date
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Important Notice:</p>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    <li>• Your reschedule request will be reviewed by clinic admin</li>
                    <li>• Admin will contact you to confirm the new appointment time</li>
                    <li>• Reschedule requests must be made at least 2 hours in advance</li>
                    <li>• Your preferred date/time may not be available</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 