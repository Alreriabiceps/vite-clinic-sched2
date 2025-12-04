import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  LoadingSpinner,
  usePatientAuth,
  patientBookingAPI,
  extractData,
  handleAPIError,
  toast,
  CancellationRequestModal,
  RescheduleRequestModal,
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
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (!patient && !authLoading) {
      navigate("/patient/login");
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
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
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
                              {appointment.doctorName}
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
                              <div className="flex gap-2">
                                {(appointment.status === "scheduled" ||
                                  appointment.status === "confirmed") && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2"
                                      onClick={() =>
                                        handleRescheduleAppointment(appointment)
                                      }
                                    >
                                      Reschedule
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 px-2"
                                      onClick={() =>
                                        handleCancelAppointment(appointment)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                {appointment.status ===
                                  "reschedule_pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 bg-green-50 text-green-700 hover:bg-green-100"
                                    onClick={async () => {
                                      try {
                                        await patientBookingAPI.acceptReschedule(
                                          appointment._id
                                        );
                                        toast.success("Reschedule accepted");
                                        fetchAppointments();
                                      } catch (error) {
                                        toast.error(handleAPIError(error));
                                      }
                                    }}
                                  >
                                    Accept Reschedule
                                  </Button>
                                )}
                                {appointment.status ===
                                  "cancellation_pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 bg-green-50 text-green-700 hover:bg-green-100"
                                    onClick={async () => {
                                      try {
                                        await patientBookingAPI.acceptCancellation(
                                          appointment._id
                                        );
                                        toast.success("Cancellation accepted");
                                        fetchAppointments();
                                      } catch (error) {
                                        toast.error(handleAPIError(error));
                                      }
                                    }}
                                  >
                                    Accept Cancellation
                                  </Button>
                                )}
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
      {showCancelModal && selectedAppointment && (
        <CancellationRequestModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleRequestSuccess}
        />
      )}

      {showRescheduleModal && selectedAppointment && (
        <RescheduleRequestModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
}
