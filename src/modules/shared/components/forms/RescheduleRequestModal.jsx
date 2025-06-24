import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button, LoadingSpinner, Input, toast } from '../../index';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { patientBookingAPI, handleAPIError } from '../../lib/api';

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

  const resetForm = () => {
    setReason('');
    setPreferredDate('');
    setPreferredTime('');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
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

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
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
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <Input
                    type="date"
                    id="preferredDate"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    id="preferredTime"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Select preferred time</option>
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
                  </select>
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