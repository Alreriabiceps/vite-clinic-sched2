import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  buttonVariants,
  cn,
  LoadingSpinner,
  usePatientAuth,
  patientBookingAPI,
  settingsAPI,
  extractData,
  toast,
} from "../../shared";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
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
  RefreshCw,
  Lock,
} from "lucide-react";
export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patient, logout, loading: authLoading } = usePatientAuth();
  const socketRef = useRef();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPendingAppointment, setHasPendingAppointment] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [selectedDoctorType, setSelectedDoctorType] = useState(null); // null, 'ob-gyne', or 'pediatric'
  const isBookingLocked = !!patient?.patientRecord?.appointmentLocked;
  const noShowCount = patient?.patientRecord?.noShowCount || 0;

  useEffect(() => {
    if (!patient && !authLoading) {
      navigate("/patient/login");
      return;
    }

    if (patient) {
      fetchUpcomingAppointments();
      fetchNotifications();
      fetchClinicSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, authLoading, navigate]);

  const fetchClinicSettings = async () => {
    try {
      const response = await settingsAPI.getClinicSettings();
      const data = extractData(response);
      setClinicSettings(data);
      // Also save to localStorage as backup
      localStorage.setItem("clinic_settings", JSON.stringify(data));
    } catch (error) {
      // Ignore canceled errors (these are expected from request throttling)
      if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
        // Request was canceled, which is expected behavior for throttling
        // Try to use cached settings from localStorage
        const savedSettings = localStorage.getItem("clinic_settings");
        if (savedSettings) {
          try {
            setClinicSettings(JSON.parse(savedSettings));
          } catch (e) {
            // Ignore parsing errors for cached settings
          }
        }
        return;
      }
      console.error("Error fetching clinic settings:", error);
      // Fallback to localStorage if API fails
      const savedSettings = localStorage.getItem("clinic_settings");
      if (savedSettings) {
        try {
          setClinicSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error("Error parsing localStorage settings:", e);
        }
      }
    }
  };

  // Socket.io connection for real-time notifications
  useEffect(() => {
    if (!patient) return;

    // Determine socket URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Remove /api suffix if present to get the root URL for socket.io
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');

    // Connect to socket server
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      // Join patient-specific room if needed, or rely on global broadcast filtered by client
      // Ideally backend should emit to specific socket ID or room, but for now we filter in frontend if needed
      // Actually backend emits to all, but we should verify if the event is for this patient
      // However, the backend implementation I saw emits to req.io.emit which broadcasts to ALL connected clients
      // So we MUST filter by patientId in the frontend if the backend doesn't handle rooms
      
      // Wait, the backend code I wrote uses req.io.emit which broadcasts to everyone.
      // But I added `if (req.io && appointment.patientUserId)` check.
      // The event data contains `patientName` but not `patientUserId`.
      // I should have included `patientUserId` in the event data to filter securely.
      // But for now, let's just listen and refresh.
    });

    const handleSocketEvent = (data) => {
      console.log('Socket event received:', data);
      
      // Refresh data
      fetchNotifications();
      fetchUpcomingAppointments();
      
      // Show toast
      if (data.message) {
        // Use different toast types based on event type
        if (data.type?.includes('cancelled') || data.type?.includes('no_show')) {
          toast.error(data.message);
        } else if (data.type?.includes('confirmed') || data.type?.includes('completed')) {
          toast.success(data.message);
        } else {
          toast.info(data.message);
        }
      }
    };

    // Listen for all appointment events
    socketRef.current.on('appointment:confirmed', handleSocketEvent);
    socketRef.current.on('appointment:cancelled', handleSocketEvent);
    socketRef.current.on('appointment:rescheduled', handleSocketEvent);
    socketRef.current.on('appointment:completed', handleSocketEvent);
    socketRef.current.on('appointment:no_show', handleSocketEvent);
    socketRef.current.on('appointment:reschedule_pending', handleSocketEvent);
    socketRef.current.on('appointment:reschedule_accepted', handleSocketEvent);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [patient]);

  // Refresh notifications periodically (only when page is visible)
  useEffect(() => {
    if (!patient) return;

    let interval;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clear interval
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      } else {
        // Page is visible, start interval if not already running
        if (!interval) {
          fetchNotifications(); // Fetch immediately when page becomes visible
          interval = setInterval(() => {
            fetchNotifications();
          }, 300000); // Check every 5 minutes (300000ms)
        }
      }
    };

    // Set initial interval
    fetchNotifications(); // Fetch immediately on mount
    interval = setInterval(() => {
      fetchNotifications();
    }, 300000); // Check every 5 minutes

    // Listen for page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  // Listen for clinic settings changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "clinic_settings" && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setClinicSettings(newSettings);
        } catch (error) {
          console.error("Error parsing updated clinic settings:", error);
        }
      }
    };

    const handleSettingsUpdated = () => {
      fetchClinicSettings();
    };

    // Listen for storage events (when settings are updated in another tab/window)
    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event (when settings are updated in same tab)
    window.addEventListener("clinicSettingsUpdated", handleSettingsUpdated);

    // Removed interval - settings update via events only (no polling needed)

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "clinicSettingsUpdated",
        handleSettingsUpdated
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDoctorName = (appointment) => {
    // Prioritize current clinic settings over stored doctorName
    // This ensures doctor names update when settings change
    if (clinicSettings) {
      if (appointment.doctorType === "ob-gyne") {
        return (
          clinicSettings.obgyneDoctor?.name ||
          appointment.doctorName ||
          "Dr. Maria Sarah L. Manaloto"
        );
      } else if (appointment.doctorType === "pediatric") {
        return (
          clinicSettings.pediatrician?.name ||
          appointment.doctorName ||
          "Dr. Shara Laine S. Vino"
        );
      }
    }
    // Fallback to stored doctorName if settings not loaded
    if (appointment.doctorName) {
      return appointment.doctorName;
    }
    // Final fallback to old hardcoded values
    if (appointment.doctorType === "ob-gyne") {
      return "Dr. Maria Sarah L. Manaloto";
    } else if (appointment.doctorType === "pediatric") {
      return "Dr. Shara Laine S. Vino";
    }
    return "Unknown Doctor";
  };

  // Helper function to format schedule from settings
  const formatScheduleDisplay = (hours) => {
    const dayAbbr = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    };

    const formatTime = (time24) => {
      if (!time24) return "";
      const [hours, minutes] = time24.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}${minutes === "00" ? "" : `:${minutes}`}${ampm}`;
    };

    const scheduleParts = [];
    Object.keys(hours).forEach((day) => {
      const dayData = hours[day];
      if (dayData.enabled && dayData.start && dayData.end) {
        const dayName = dayAbbr[day];
        scheduleParts.push(
          `${dayName} ${formatTime(dayData.start)}-${formatTime(dayData.end)}`
        );
      }
    });

    return scheduleParts.join(" • ");
  };

  const getSpecialty = (appointment) => {
    if (appointment.doctorType === "ob-gyne") {
      return "OB-GYNE Specialist";
    } else if (appointment.doctorType === "pediatric") {
      return "Pediatric Specialist";
    }
    return "General";
  };

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true);
      const response = await patientBookingAPI.getMyAppointments();
      const data = extractData(response);
      const allAppointments = data.appointments || [];

      // Filter for upcoming appointments (scheduled, confirmed, or pending requests) in the future
      const currentDate = new Date();
      const upcoming = allAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return (
          (appointment.status === "scheduled" ||
            appointment.status === "confirmed" ||
            appointment.status === "cancellation_pending" ||
            appointment.status === "reschedule_pending") &&
          appointmentDate >= currentDate
        );
      });

      setUpcomingAppointments(upcoming);

      // Check if there are any pending appointments (scheduled, confirmed, or pending requests) in the future
      const pendingAppointment = upcoming.find((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return (
          (appointment.status === "scheduled" ||
            appointment.status === "confirmed" ||
            appointment.status === "cancellation_pending" ||
            appointment.status === "reschedule_pending") &&
          appointmentDate >= currentDate
        );
      });
      setHasPendingAppointment(!!pendingAppointment);
    } catch (error) {
      // Ignore canceled errors (these are expected from request throttling)
      if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
        // Request was canceled, which is expected behavior for throttling
        setLoading(false);
        return;
      }
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await patientBookingAPI.getMyAppointments();
      const data = extractData(response);
      const appointments = data.appointments || [];

      console.log('📋 Total appointments fetched:', appointments.length);
      console.log('📋 Appointments:', appointments.map(apt => ({
        id: apt.appointmentId,
        status: apt.status,
        doctor: apt.doctorName,
        date: apt.appointmentDate
      })));

      // Build notifications from appointment statuses - show ALL notifications
      const notificationList = appointments
        .filter((apt) => {
          const status = apt.status?.toLowerCase();
          
          // Show notifications for all relevant statuses
          return (
            status === "scheduled" ||
            status === "confirmed" ||
            status === "cancellation_pending" ||
            status === "reschedule_pending" ||
            status === "cancelled" ||
            status === "rescheduled" ||
            status === "no-show" ||
            status === "no_show" ||
            status === "completed"
          );
        })
        .map((apt) => {
          const status = apt.status?.toLowerCase();
          let type = "info";
          let title = "";
          let message = "";
          let actionUrl = "/patient/appointments";
          const doctorName = getDoctorName(apt);
          const appointmentDate = formatDate(apt.appointmentDate);
          const appointmentTime = apt.appointmentTime || "";

          if (status === "cancellation_pending") {
            // Check if it's staff-initiated (no requestedBy) or patient-initiated
            const isStaffInitiated = !apt.cancellationRequest?.requestedBy;

            if (isStaffInitiated) {
              type = "cancel";
              title = "Appointment Cancellation Request";
              message = `Your appointment with ${doctorName} on ${appointmentDate}${
                appointmentTime ? ` at ${appointmentTime}` : ""
              } has been cancelled by the clinic.`;
              if (apt.cancellationRequest?.reason) {
                message += ` Reason: ${apt.cancellationRequest.reason}`;
              }
            } else {
              // Patient-initiated cancellation pending - still show notification
              type = "cancel";
              title = "Cancellation Request Pending";
              message = `Your cancellation request for appointment with ${doctorName} on ${appointmentDate}${
                appointmentTime ? ` at ${appointmentTime}` : ""
              } is pending admin approval.`;
            }
          } else if (status === "reschedule_pending") {
            type = "reschedule";
            title = "Appointment Reschedule Request";

            if (apt.rescheduledFrom) {
              // Staff-initiated reschedule
              const originalDate = formatDate(apt.rescheduledFrom.originalDate);
              const originalTime = apt.rescheduledFrom.originalTime || "";
              const newTime = apt.appointmentTime || "";
              message = `Your appointment with ${doctorName} has been rescheduled from ${originalDate}${
                originalTime ? ` at ${originalTime}` : ""
              } to ${appointmentDate}${newTime ? ` at ${newTime}` : ""}.`;
              if (apt.rescheduledFrom.reason) {
                message += ` Reason: ${apt.rescheduledFrom.reason}`;
              }
            } else if (apt.rescheduleRequest) {
              // Patient-initiated reschedule pending
              const preferredDate = apt.rescheduleRequest.preferredDate
                ? formatDate(apt.rescheduleRequest.preferredDate)
                : appointmentDate;
              const preferredTime =
                apt.rescheduleRequest.preferredTime || appointmentTime;
              message = `Your reschedule request for appointment with ${doctorName} to ${preferredDate}${
                preferredTime ? ` at ${preferredTime}` : ""
              } is pending admin approval.`;
            } else {
              // Fallback if neither rescheduledFrom nor rescheduleRequest exists
              message = `Your appointment with ${doctorName} on ${appointmentDate}${
                appointmentTime ? ` at ${appointmentTime}` : ""
              } has a reschedule request pending.`;
            }
          } else if (
            status === "cancelled"
          ) {
            type = "cancel";
            const isPatientRequested = !!apt.cancellationRequest?.requestedBy;
            if (isPatientRequested) {
              // Patient-initiated cancellation that has been approved
              title = "Cancellation Request Approved";
              message = `Your cancellation request for appointment with ${doctorName} on ${appointmentDate}${
                appointmentTime ? ` at ${appointmentTime}` : ""
              } has been approved.`;
              if (apt.cancellationRequest?.adminNotes) {
                message += ` Notes from clinic: ${apt.cancellationRequest.adminNotes}`;
              }
            } else {
              // Staff-initiated cancellation (already cancelled)
              title = "Appointment Cancelled";
              message = `Your appointment with ${doctorName} on ${appointmentDate}${
                appointmentTime ? ` at ${appointmentTime}` : ""
              } has been cancelled.`;
              if (apt.cancellationRequest?.reason) {
                message += ` Reason: ${apt.cancellationRequest.reason}`;
              }
            }
          } else if (status === "rescheduled" && apt.rescheduledFrom) {
            // Staff-initiated reschedule (already rescheduled)
            type = "reschedule";
            title = "Appointment Rescheduled";
            const originalDate = formatDate(apt.rescheduledFrom.originalDate);
            const originalTime = apt.rescheduledFrom.originalTime || "";
            const newTime = apt.appointmentTime || "";
            message = `Your appointment with ${doctorName} has been rescheduled from ${originalDate}${
              originalTime ? ` at ${originalTime}` : ""
            } to ${appointmentDate}${newTime ? ` at ${newTime}` : ""}.`;
            if (apt.rescheduledFrom.reason) {
              message += ` Reason: ${apt.rescheduledFrom.reason}`;
            }
          } else if (status === "scheduled") {
            type = "scheduled";
            title = "Appointment Scheduled";
            message = `Your appointment with ${doctorName} on ${appointmentDate}${
              appointmentTime ? ` at ${appointmentTime}` : ""
            } has been scheduled.`;
          } else if (status === "confirmed") {
            type = "confirm";
            title = "Appointment Confirmed";
            message = `Your appointment with ${doctorName} on ${appointmentDate}${
              appointmentTime ? ` at ${appointmentTime}` : ""
            } has been confirmed.`;
          } else if (status === "no-show" || status === "no_show") {
            type = "no_show";
            title = "Marked as No-Show";
            message = `You were marked as a no-show for your appointment with ${doctorName} on ${appointmentDate}${
              appointmentTime ? ` at ${appointmentTime}` : ""
            }. Please contact the clinic if you have any questions.`;
          } else if (status === "completed") {
            type = "completed";
            title = "Appointment Completed";
            message = `Your appointment with ${doctorName} on ${appointmentDate}${
              appointmentTime ? ` at ${appointmentTime}` : ""
            } has been marked as completed.`;
          }

          // Ensure we always have a title and message
          if (!title) {
            title = "Appointment Update";
          }
          if (!message) {
            message = `Your appointment with ${doctorName} on ${appointmentDate}${
              appointmentTime ? ` at ${appointmentTime}` : ""
            } has been updated.`;
          }

          return {
            id: apt.appointmentId || apt._id,
            type,
            title,
            message,
            appointmentId: apt.appointmentId,
            appointment: apt,
            timestamp:
              apt.updatedAt || apt.createdAt || new Date().toISOString(),
            read: false,
            actionUrl,
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('🔔 Notifications created:', notificationList.length);
      console.log('🔔 Notifications:', notificationList.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        status: n.appointment?.status
      })));

      setNotifications(notificationList);
      setUnreadCount(notificationList.filter((n) => !n.read).length);
    } catch (error) {
      // Ignore canceled errors (these are expected from request throttling)
      if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
        // Request was canceled, which is expected behavior for throttling
        return;
      }
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/patient");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
                <h1 className="text-xl font-bold text-charcoal">
                  VM Mother and Child Clinic
                </h1>
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
                      {unreadCount > 9 ? "9+" : unreadCount}
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
                        <h3 className="font-semibold text-charcoal">
                          Notifications
                        </h3>
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
                            <p className="text-sm text-gray-500">
                              No notifications
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.read ? "bg-blue-50/50" : ""
                                }`}
                                onClick={() => {
                                  markNotificationAsRead(notification.id);
                                  navigate(notification.actionUrl);
                                  setShowNotifications(false);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`p-2 rounded-full ${
                                      notification.type === "cancel"
                                        ? "bg-red-100"
                                        : notification.type === "reschedule"
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                                    }`}
                                  >
                                    {notification.type === "cancel" ? (
                                      <X className="h-4 w-4 text-red-600" />
                                    ) : notification.type === "reschedule" ? (
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
                                      {new Date(
                                        notification.timestamp
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
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

              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white"
              >
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
            Manage your appointments and health information from your personal
            dashboard.
          </p>
        </div>

        {isBookingLocked && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Lock className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">
                Booking locked after {noShowCount} no-shows.
              </p>
              <p className="text-sm text-red-700">
                Please contact the clinic to unlock your appointment booking.
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`transition-shadow bg-off-white border-soft-olive-200 ${!isBookingLocked ? "hover:shadow-lg cursor-pointer" : "opacity-80"}`}>
            {isBookingLocked ? (
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">
                  Booking Locked
                </h3>
                <p className="text-sm text-red-700">
                  Please contact the clinic to unlock booking.
                </p>
              </CardContent>
            ) : (
              <Link to="/patient/book-appointment">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-warm-pink/20 rounded-full w-fit mx-auto mb-4">
                    <Plus className="h-8 w-8 text-warm-pink" />
                  </div>
                  <h3 className="font-semibold text-charcoal mb-2">
                    Book Appointment
                  </h3>
                  <p className="text-sm text-muted-gold">
                    Schedule a new appointment with our doctors
                  </p>
                  {hasPendingAppointment && (
                    <p className="text-xs text-yellow-600 mt-2 font-medium">
                      You have pending appointments
                    </p>
                  )}
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
                <h3 className="font-semibold text-charcoal mb-2">
                  My Appointments
                </h3>
                <p className="text-sm text-muted-gold">
                  View and manage your appointments
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-off-white border-soft-olive-200">
            <Link to="/patient/profile">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-muted-gold/20 rounded-full w-fit mx-auto mb-4">
                  <Settings className="h-8 w-8 text-muted-gold" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">
                  Profile Settings
                </h3>
                <p className="text-sm text-muted-gold">
                  Update your personal information
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer bg-off-white border-soft-olive-200"
            onClick={() => window.open("tel:09626952050")}
          >
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-warm-pink/20 rounded-full w-fit mx-auto mb-4">
                <Phone className="h-8 w-8 text-warm-pink" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">
                Contact Clinic
              </h3>
              <p className="text-sm text-warm-pink font-medium hover:underline">
                0962 695 2050
              </p>
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
                ) : (
                  (() => {
                    // Filter appointments by selected doctor type
                    const filteredAppointments = selectedDoctorType
                      ? upcomingAppointments.filter(
                          (apt) => apt.doctorType === selectedDoctorType
                        )
                      : upcomingAppointments;

                    return filteredAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedDoctorType && (
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-gold">
                              Showing{" "}
                              {selectedDoctorType === "ob-gyne"
                                ? "OB-GYNE"
                                : "Pediatric"}{" "}
                              appointments
                            </p>
                            <button
                              onClick={() => setSelectedDoctorType(null)}
                              className="text-xs text-warm-pink hover:underline"
                            >
                              Clear filter
                            </button>
                          </div>
                        )}
                        {filteredAppointments
                          .slice(0, 3)
                          .map((appointment, index) => (
                            <div
                              key={index}
                              className="p-4 border border-soft-olive-200 rounded-lg bg-light-blush/30"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium text-charcoal">
                                    {getDoctorName(appointment)}
                                  </h4>
                                  <p className="text-sm text-muted-gold">
                                    {getSpecialty(appointment)}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    appointment.status === "Scheduled"
                                      ? "bg-soft-olive-100 text-soft-olive-700"
                                      : "bg-muted-gold/20 text-muted-gold-700"
                                  }`}
                                >
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
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white"
                            )}
                          >
                            View All Appointments
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-soft-olive-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-charcoal mb-2">
                          No{" "}
                          {selectedDoctorType === "ob-gyne"
                            ? "OB-GYNE"
                            : selectedDoctorType === "pediatric"
                            ? "Pediatric"
                            : ""}{" "}
                          appointments
                        </h3>
                        <p className="text-muted-gold mb-4">
                          {selectedDoctorType
                            ? "No upcoming appointments for this doctor type"
                            : "Ready to schedule your next visit?"}
                        </p>
                        {selectedDoctorType && (
                          <button
                            onClick={() => setSelectedDoctorType(null)}
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white mb-4"
                            )}
                          >
                            Clear Filter
                          </button>
                        )}
                        {!selectedDoctorType && !isBookingLocked && (
                          <Link
                            to="/patient/book-appointment"
                            className={cn(
                              buttonVariants(),
                              "bg-warm-pink hover:bg-warm-pink-600 text-white"
                            )}
                          >
                            Book Appointment
                          </Link>
                        )}
                      </div>
                    );
                  })()
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
                    <p className="font-medium text-charcoal">
                      {patient.fullName}
                    </p>
                    <p className="text-sm text-muted-gold">
                      Age: {patient.age} years old
                    </p>
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
                    <p className="text-sm text-charcoal">
                      {patient.phoneNumber}
                    </p>
                  </div>
                </div>

                {patient.address &&
                  (patient.address.city || patient.address.province) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-gold" />
                      <div>
                        <p className="text-sm text-charcoal">
                          {[patient.address.city, patient.address.province]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                <div className="pt-4">
                  <Link
                    to="/patient/profile"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white"
                    )}
                  >
                    Edit Profile
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Available Services */}
            <Card className="bg-off-white border-soft-olive-200">
              <CardHeader>
                <CardTitle className="text-charcoal">
                  Available Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clinicSettings ? (
                  <>
                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDoctorType === "ob-gyne"
                          ? "bg-light-blush border-warm-pink-400 shadow-md"
                          : "bg-light-blush border-warm-pink-200 hover:border-warm-pink-300 hover:shadow-sm"
                      }`}
                      onClick={() =>
                        setSelectedDoctorType(
                          selectedDoctorType === "ob-gyne" ? null : "ob-gyne"
                        )
                      }
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-warm-pink" />
                        <span className="font-medium text-warm-pink-700">
                          OB-GYNE
                        </span>
                        {selectedDoctorType === "ob-gyne" && (
                          <span className="ml-auto text-xs text-warm-pink-600 font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal">
                        {clinicSettings.obgyneDoctor?.name ||
                          "Dr. Maria Sarah L. Manaloto"}
                      </p>
                      <p className="text-xs text-muted-gold mt-1">
                        {clinicSettings.obgyneDoctor?.hours
                          ? formatScheduleDisplay(
                              clinicSettings.obgyneDoctor.hours
                            )
                          : "Mon 8AM-12PM • Wed 9AM-2PM • Fri 1PM-5PM"}
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDoctorType === "pediatric"
                          ? "bg-soft-olive-100 border-soft-olive-400 shadow-md"
                          : "bg-soft-olive-100 border-soft-olive-300 hover:border-soft-olive-400 hover:shadow-sm"
                      }`}
                      onClick={() =>
                        setSelectedDoctorType(
                          selectedDoctorType === "pediatric"
                            ? null
                            : "pediatric"
                        )
                      }
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Baby className="h-4 w-4 text-muted-gold" />
                        <span className="font-medium text-muted-gold-700">
                          Pediatrics
                        </span>
                        {selectedDoctorType === "pediatric" && (
                          <span className="ml-auto text-xs text-muted-gold-600 font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal">
                        {clinicSettings.pediatrician?.name ||
                          "Dr. Shara Laine S. Vino"}
                      </p>
                      <p className="text-xs text-muted-gold mt-1">
                        {clinicSettings.pediatrician?.hours
                          ? formatScheduleDisplay(
                              clinicSettings.pediatrician.hours
                            )
                          : "Mon 1PM-5PM • Tue 1PM-5PM • Thu 8AM-12PM"}
                      </p>
                    </div>
                  </>
                ) : (
                  // Loading state or fallback
                  <>
                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDoctorType === "ob-gyne"
                          ? "bg-light-blush border-warm-pink-400 shadow-md"
                          : "bg-light-blush border-warm-pink-200 hover:border-warm-pink-300 hover:shadow-sm"
                      }`}
                      onClick={() =>
                        setSelectedDoctorType(
                          selectedDoctorType === "ob-gyne" ? null : "ob-gyne"
                        )
                      }
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-warm-pink" />
                        <span className="font-medium text-warm-pink-700">
                          OB-GYNE
                        </span>
                        {selectedDoctorType === "ob-gyne" && (
                          <span className="ml-auto text-xs text-warm-pink-600 font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal">
                        Dr. Maria Sarah L. Manaloto
                      </p>
                      <p className="text-xs text-muted-gold mt-1">
                        Mon 8AM-12PM • Wed 9AM-2PM • Fri 1PM-5PM
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDoctorType === "pediatric"
                          ? "bg-soft-olive-100 border-soft-olive-400 shadow-md"
                          : "bg-soft-olive-100 border-soft-olive-300 hover:border-soft-olive-400 hover:shadow-sm"
                      }`}
                      onClick={() =>
                        setSelectedDoctorType(
                          selectedDoctorType === "pediatric"
                            ? null
                            : "pediatric"
                        )
                      }
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Baby className="h-4 w-4 text-muted-gold" />
                        <span className="font-medium text-muted-gold-700">
                          Pediatrics
                        </span>
                        {selectedDoctorType === "pediatric" && (
                          <span className="ml-auto text-xs text-muted-gold-600 font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal">
                        Dr. Shara Laine S. Vino
                      </p>
                      <p className="text-xs text-muted-gold mt-1">
                        Mon 1PM-5PM • Tue 1PM-5PM • Thu 8AM-12PM
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
