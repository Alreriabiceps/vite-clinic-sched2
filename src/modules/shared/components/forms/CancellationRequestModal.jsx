import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button, LoadingSpinner, toast } from '../../index';
import { X, AlertTriangle } from 'lucide-react';
import { patientBookingAPI, handleAPIError } from '../../lib/api';

export default function CancellationRequestModal({ 
  isOpen, 
  onClose, 
  appointment, 
  onSuccess 
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setLoading(true);
      await patientBookingAPI.requestCancellation(appointment.appointmentId, {
        reason: reason.trim()
      });
      
      toast.success('Cancellation request submitted successfully. Please wait for admin approval.');
      onSuccess?.();
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error requesting cancellation:', error);
      toast.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setReason('');
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Request Appointment Cancellation</DialogTitle>
              <DialogDescription>
                Submit a cancellation request for admin approval
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Appointment Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-900">Appointment Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Doctor:</strong> {appointment.doctorName}</p>
              <p><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {appointment.appointmentTime}</p>
              <p><strong>Patient:</strong> {appointment.patientName}</p>
            </div>
          </div>

          {/* Cancellation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need to cancel this appointment..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Important Notice:</p>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    <li>• Your cancellation request will be reviewed by clinic admin</li>
                    <li>• You will be notified once the request is approved or rejected</li>
                    <li>• Cancellations must be requested at least 2 hours in advance</li>
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
                variant="destructive"
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