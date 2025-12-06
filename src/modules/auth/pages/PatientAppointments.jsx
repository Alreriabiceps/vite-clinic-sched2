import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  LoadingSpinner,
  usePatientAuth,
  patientBookingAPI,
  settingsAPI,
  extractData,
  handleAPIError,
  toast,
  CancellationRequestModal,
  RescheduleRequestModal,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../shared";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Archive,
  RefreshCw,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";

// Set up the date localizer for the calendar
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function PatientAppointments() {
  const navigate = useNavigate();
  const { patient, loading: authLoading } = usePatientAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'calendar'
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all"); // 'week', 'month', 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [clinicSettings, setClinicSettings] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const [selectedModalDate, setSelectedModalDate] = useState(null);

  useEffect(() => {
    if (!patient && !authLoading) {
      navigate("/patient/login");
      return;
    }

    if (patient) {
      fetchAppointments();
      fetchClinicSettings();
    }
  }, [patient, authLoading, navigate]);

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

  const fetchClinicSettings = async () => {
    try {
      const response = await settingsAPI.getClinicSettings();
      const data = extractData(response);
      setClinicSettings(data);
    } catch (error) {
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

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await patientBookingAPI.getMyAppointments();
      const data = extractData(response);
      const appointments = data.appointments || [];
      // Debug: Log first appointment to check structure
      if (appointments.length > 0) {
        console.log("Sample appointment:", appointments[0]);
        console.log("Doctor name:", appointments[0].doctorName);
        console.log("Doctor type:", appointments[0].doctorType);
      }
      setAppointments(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    let date;
    if (typeof dateString === "string") {
      const [year, month, day] = dateString.split("T")[0].split("-");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(dateString);
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "cancellation_pending":
        return "bg-orange-100 text-orange-700";
      case "reschedule_pending":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "cancellation_pending":
        return <XCircle className="h-4 w-4" />;
      case "rescheduled":
        return <Clock className="h-4 w-4" />;
      case "reschedule_pending":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const parseAppointmentDateTime = (appointment) => {
    const date = new Date(appointment.appointmentDate);
    if (appointment.appointmentTime) {
      const [time, period] = appointment.appointmentTime.split(" ");
      const [rawHour, rawMinute] = time.split(":").map(Number);
      let hours = rawHour % 12;
      if (period === "PM") hours += 12;
      date.setHours(hours, rawMinute || 0, 0, 0);
    }
    return date.getTime();
  };

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

  const visibleAppointments = appointments.filter((appointment) => {
    const matchesStatus = (() => {
      if (statusFilter === "all") return true;
      if (statusFilter === "cancelled") {
        const status = appointment.status?.toLowerCase();
        return status === "cancelled" || status === "cancellation_pending";
      }
      return (
        appointment.status && appointment.status.toLowerCase() === statusFilter
      );
    })();

    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    const matchesDateRange = (() => {
      if (dateRange === "week") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return appointmentDate >= weekStart && appointmentDate <= weekEnd;
      } else if (dateRange === "month") {
        return (
          appointmentDate.getMonth() === today.getMonth() &&
          appointmentDate.getFullYear() === today.getFullYear()
        );
      }
      return true;
    })();

    return matchesStatus && matchesDateRange;
  });

  const sortedAppointments = [...visibleAppointments].sort(
    (a, b) => parseAppointmentDateTime(b) - parseAppointmentDateTime(a)
  );

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = sortedAppointments.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateRange]);

  const handleCancelAppointment = (appointment) => {
    console.log("Cancel button clicked for appointment:", appointment._id);
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
    console.log("Cancel modal should now be visible");
  };

  const handleRescheduleAppointment = (appointment) => {
    console.log("Reschedule button clicked for appointment:", appointment._id);
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    console.log("Reschedule modal should now be visible");
  };

  const handleShowReason = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReasonModal(true);
  };

  const handleRequestSuccess = () => {
    fetchAppointments();
  };

  // Calendar events
  const getCalendarEvents = () => {
    return visibleAppointments.map((appointment) => {
      const dateStr = appointment.appointmentDate.split("T")[0];
      const [year, month, day] = dateStr.split("-");
      const timeStr = appointment.appointmentTime;
      const [time, period] = timeStr.split(" ");
      const [hours, minutes] = time.split(":");
      let hour24 = parseInt(hours);
      if (period === "PM" && hour24 < 12) hour24 += 12;
      if (period === "AM" && hour24 === 12) hour24 = 0;

      const startDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        hour24,
        parseInt(minutes)
      );
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      return {
        id: appointment._id,
        title: `${formatTime(
          appointment.appointmentTime
        )} - ${appointment.serviceType?.replace(/_/g, " ")}`,
        start: startDate,
        end: endDate,
        appointment: appointment,
      };
    });
  };

  const handleEventSelect = (event) => {
    setSelectedAppointment(event.appointment);
  };

  const getAppointmentsForDate = (date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return appointments.filter((appointment) => {
      const appointmentDate = appointment.appointmentDate.split("T")[0];
      return appointmentDate === dateString;
    });
  };

  const handleSelectSlot = (slotInfo) => {
    // When user clicks a date, show appointments for that date in a modal
    const selectedDate = slotInfo.start;
    const dayAppointments = getAppointmentsForDate(selectedDate);

    setSelectedModalDate(selectedDate);
    setSelectedDateAppointments(dayAppointments);
    setShowDateModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen clinic-gradient flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen clinic-gradient">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/patient/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Appointments
                </h1>
                <p className="text-sm text-gray-600">
                  View and manage your appointments
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filters and View Tabs */}
          <Card className="bg-off-white border-soft-olive-200 sticky top-0 z-20">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* View Tabs */}
                <div className="flex items-center border border-soft-olive-300 rounded-md overflow-hidden bg-white">
                  <button
                    className={`flex items-center gap-2 h-9 px-3 text-sm font-medium transition-colors ${
                      viewMode === "table"
                        ? "bg-warm-pink text-white"
                        : "bg-white text-charcoal hover:bg-soft-olive-50"
                    }`}
                    onClick={() => setViewMode("table")}
                  >
                    <Archive className="h-4 w-4" />
                    Table
                  </button>
                  <button
                    className={`flex items-center gap-2 h-9 px-3 text-sm font-medium transition-colors ${
                      viewMode === "calendar"
                        ? "bg-warm-pink text-white"
                        : "bg-white text-charcoal hover:bg-soft-olive-50"
                    }`}
                    onClick={() => setViewMode("calendar")}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Calendar
                  </button>
                </div>

                {/* Date Range Filters */}
                <div className="flex gap-2">
                  <Button
                    className={`flex items-center gap-2 h-9 px-3 text-sm font-medium border-2 rounded-md transition-colors duration-150 ${
                      dateRange === "week"
                        ? "bg-gray-200 text-black border-black"
                        : "bg-white text-black border-black hover:bg-gray-100"
                    }`}
                    variant="ghost"
                    onClick={() => setDateRange("week")}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    This Week
                  </Button>
                  <Button
                    className={`flex items-center gap-2 h-9 px-3 text-sm font-medium border-2 rounded-md transition-colors duration-150 ${
                      dateRange === "month"
                        ? "bg-gray-200 text-black border-black"
                        : "bg-white text-black border-black hover:bg-gray-100"
                    }`}
                    variant="ghost"
                    onClick={() => setDateRange("month")}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    This Month
                  </Button>
                  <Button
                    className={`flex items-center gap-2 h-9 px-3 text-sm font-medium border-2 rounded-md transition-colors duration-150 ${
                      dateRange === "all"
                        ? "bg-gray-200 text-black border-black"
                        : "bg-white text-black border-black hover:bg-gray-100"
                    }`}
                    variant="ghost"
                    onClick={() => setDateRange("all")}
                  >
                    <Filter className="h-4 w-4" />
                    All Time
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Filter Tabs */}
          {viewMode === "table" && (
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200 w-fit">
              {[
                { label: "All", value: "all" },
                { label: "Scheduled", value: "scheduled" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-150 text-sm focus:outline-none ${
                    statusFilter === tab.value
                      ? "bg-warm-pink text-white shadow font-bold"
                      : "bg-transparent text-black hover:bg-gray-100"
                  }`}
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Calendar View */}
          {viewMode === "calendar" && (
            <Card className="overflow-hidden shadow-md">
              <div className="flex items-center justify-between bg-white px-6 py-4 border-b">
                <div className="flex items-center space-x-4">
                  <h3 className="font-medium text-lg text-gray-800">
                    Calendar
                  </h3>
                  <div className="bg-clinic-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {format(currentDate, "MMMM yyyy")}
                  </div>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Go to Today
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-0.5 text-sm"
                    value={format(currentDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      const timezoneOffset =
                        newDate.getTimezoneOffset() * 60000;
                      setCurrentDate(
                        new Date(newDate.getTime() + timezoneOffset)
                      );
                    }}
                  />
                  <button
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-1"
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setMonth(currentDate.getMonth() - 1);
                      setCurrentDate(newDate);
                    }}
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-1"
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setMonth(currentDate.getMonth() + 1);
                      setCurrentDate(newDate);
                    }}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex h-[700px]">
                <div className="flex-1 overflow-auto bg-white rounded-lg">
                  <div
                    className="px-4 pb-4"
                    style={{ height: "calc(100% - 120px)" }}
                  >
                    <Calendar
                      localizer={localizer}
                      events={getCalendarEvents()}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      view="month"
                      views={["month"]}
                      onView={() => {}}
                      date={currentDate}
                      onNavigate={setCurrentDate}
                      toolbar={false}
                      popup={true}
                      eventPropGetter={() => ({
                        style: {
                          backgroundColor: "#4f46e5",
                          color: "white",
                          border: "1px solid #3730a3",
                          borderRadius: "3px",
                          fontSize: "11px",
                          fontWeight: "bold",
                        },
                      })}
                      onSelectEvent={handleEventSelect}
                      onSelectSlot={handleSelectSlot}
                      selectable={true}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <Card className="bg-white border-soft-olive-200">
              <CardContent className="p-0 overflow-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-gray-50 text-charcoal">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Time</th>
                        <th className="px-4 py-3 text-left">Doctor</th>
                        <th className="px-4 py-3 text-left">Service</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAppointments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center text-gray-500"
                          >
                            No appointments found
                          </td>
                        </tr>
                      ) : (
                        paginatedAppointments.map((appointment) => (
                          <tr
                            key={appointment._id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              {formatDate(appointment.appointmentDate)}
                            </td>
                            <td className="px-4 py-3">
                              {formatTime(appointment.appointmentTime)}
                            </td>
                            <td className="px-4 py-3">
                              {getDoctorName(appointment)}
                            </td>
                            <td className="px-4 py-3">
                              {appointment.serviceType?.replace(/_/g, " ")}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusBadgeClass(
                                  appointment.status
                                )}`}
                              >
                                {getStatusIcon(appointment.status)}
                                {appointment.status === "cancellation_pending"
                                  ? "Cancellation Pending"
                                  : appointment.status === "reschedule_pending"
                                  ? "Reschedule Pending"
                                  : appointment.status
                                      ?.charAt(0)
                                      .toUpperCase() +
                                    appointment.status?.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div
                                className="flex gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Reason Button - Always visible */}
                                <button
                                  type="button"
                                  className="h-7 px-2 rounded border bg-blue-600 hover:bg-blue-700 text-white text-sm cursor-pointer relative z-10 flex items-center gap-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleShowReason(appointment);
                                  }}
                                >
                                  <Info className="h-3 w-3" />
                                  Reason
                                </button>
                                {(appointment.status === "scheduled" ||
                                  appointment.status === "confirmed") && (
                                  <>
                                    <button
                                      type="button"
                                      className="h-7 px-2 rounded border bg-white hover:bg-gray-100 text-sm cursor-pointer relative z-10"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log(
                                          "Reschedule button onClick fired"
                                        );
                                        handleRescheduleAppointment(
                                          appointment
                                        );
                                      }}
                                    >
                                      Reschedule
                                    </button>
                                    <button
                                      type="button"
                                      className="h-7 px-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm cursor-pointer relative z-10"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log(
                                          "Cancel button onClick fired"
                                        );
                                        handleCancelAppointment(appointment);
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {appointment.status ===
                                  "reschedule_pending" && (
                                  <>
                                    {/* Check if this is admin-initiated reschedule (no requestedBy) */}
                                    {!appointment.rescheduleRequest
                                      ?.requestedBy && (
                                      <>
                                        <button
                                          type="button"
                                          className="h-7 px-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                                          onClick={async () => {
                                            try {
                                              await patientBookingAPI.acceptReschedule(
                                                appointment._id
                                              );
                                              toast.success(
                                                "Reschedule confirmed"
                                              );
                                              fetchAppointments();
                                            } catch (error) {
                                              toast.error(
                                                handleAPIError(error)
                                              );
                                            }
                                          }}
                                        >
                                          Confirm Reschedule
                                        </button>
                                        <button
                                          type="button"
                                          className="h-7 px-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                                          onClick={async () => {
                                            if (
                                              window.confirm(
                                                "Are you sure you want to cancel this appointment? This action cannot be undone."
                                              )
                                            ) {
                                              try {
                                                await patientBookingAPI.cancelReschedule(
                                                  appointment._id
                                                );
                                                toast.success(
                                                  "Appointment cancelled"
                                                );
                                                fetchAppointments();
                                              } catch (error) {
                                                toast.error(
                                                  handleAPIError(error)
                                                );
                                              }
                                            }
                                          }}
                                        >
                                          Cancel Appointment
                                        </button>
                                      </>
                                    )}
                                    {/* Patient-initiated reschedule (waiting for admin approval) */}
                                    {appointment.rescheduleRequest
                                      ?.requestedBy && (
                                      <span className="text-xs text-gray-500">
                                        Waiting for admin approval
                                      </span>
                                    )}
                                  </>
                                )}
                                {/* Removed Accept Cancellation button - admin cancellations are now immediate */}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {viewMode === "table" && totalPages > 1 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, sortedAppointments.length)} of{" "}
                {sortedAppointments.length} appointments
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedAppointment && (
        <>
          <CancellationRequestModal
            isOpen={showCancelModal}
            appointment={selectedAppointment}
            onClose={() => {
              setShowCancelModal(false);
              setSelectedAppointment(null);
            }}
            onSuccess={handleRequestSuccess}
          />

          <RescheduleRequestModal
            isOpen={showRescheduleModal}
            appointment={selectedAppointment}
            onClose={() => {
              setShowRescheduleModal(false);
              setSelectedAppointment(null);
            }}
            onSuccess={handleRequestSuccess}
          />
        </>
      )}

      {/* Reason Modal - Shows appointment reason(s) */}
      {selectedAppointment && (
        <Dialog
          open={showReasonModal}
          onOpenChange={(open) => {
            setShowReasonModal(open);
            if (!open) {
              setSelectedAppointment(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-lg max-w-[95vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Reason
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 max-h-96 overflow-y-auto">
              {/* Reason for Visit */}
              {selectedAppointment.reasonForVisit && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Reason for Visit:
                  </p>
                  <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                    {selectedAppointment.reasonForVisit}
                  </p>
                </div>
              )}

              {/* Cancellation Reason */}
              {(selectedAppointment.cancellationReason ||
                selectedAppointment.cancellationRequest?.reason) && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-red-500 mb-1">
                    Cancellation Reason:
                  </p>
                  <p className="text-sm text-red-700 break-words whitespace-pre-wrap">
                    {selectedAppointment.cancellationReason ||
                      selectedAppointment.cancellationRequest?.reason}
                  </p>
                </div>
              )}

              {/* Reschedule Reason */}
              {selectedAppointment.rescheduleRequest?.reason && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-blue-500 mb-1">
                    Reschedule Reason:
                  </p>
                  <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                    {selectedAppointment.rescheduleRequest.reason}
                  </p>
                </div>
              )}

              {/* No reason message */}
              {!selectedAppointment.reasonForVisit &&
                !selectedAppointment.cancellationReason &&
                !selectedAppointment.cancellationRequest?.reason &&
                !selectedAppointment.rescheduleRequest?.reason && (
                  <p className="text-sm text-gray-500 text-center">
                    No reason available.
                  </p>
                )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Date Modal - Shows appointments for selected date */}
      <Dialog open={showDateModal} onOpenChange={setShowDateModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Appointments on{" "}
              {selectedModalDate &&
                format(selectedModalDate, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No appointments scheduled</p>
                <p className="text-sm">This date is free</p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    {selectedDateAppointments.length} appointment(s) scheduled
                  </p>
                </div>

                {selectedDateAppointments
                  .sort((a, b) => {
                    // Sort by time
                    const timeA = a.appointmentTime;
                    const timeB = b.appointmentTime;
                    return timeA.localeCompare(timeB);
                  })
                  .map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            {formatTime(appointment.appointmentTime)}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {getDoctorName(appointment)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-xs">
                                {appointment.serviceType?.replace(/_/g, " ")}
                              </span>
                            </span>
                          </div>
                          {appointment.reasonForVisit && (
                            <p className="text-sm text-gray-500 mt-2 break-words whitespace-pre-wrap">
                              <strong>Reason:</strong>{" "}
                              {appointment.reasonForVisit}
                            </p>
                          )}
                          {(appointment.status === "cancelled" ||
                            appointment.status === "cancellation_pending") &&
                            (appointment.cancellationReason ||
                              appointment.cancellationRequest?.reason) && (
                              <p className="text-sm text-red-600 mt-2 italic break-words whitespace-pre-wrap">
                                <strong>Cancellation Reason:</strong>{" "}
                                {appointment.cancellationReason ||
                                  appointment.cancellationRequest?.reason}
                              </p>
                            )}
                        </div>

                        <div className="text-right">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                              appointment.status
                            )}`}
                          >
                            {appointment.status === "cancellation_pending"
                              ? "Cancellation Pending"
                              : appointment.status === "reschedule_pending"
                              ? "Reschedule Pending"
                              : appointment.status?.charAt(0).toUpperCase() +
                                appointment.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDateModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
