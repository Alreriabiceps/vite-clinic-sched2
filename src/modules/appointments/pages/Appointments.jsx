import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  LoadingSpinner,
  appointmentsAPI,
  patientsAPI,
  extractData,
  handleAPIError,
  toast,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
} from "../../shared";
import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Phone,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Archive,
  RefreshCw,
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

// List of Philippine holidays for the calendar
const holidays = [
  // 2023 PH Holidays
  {
    title: "New Year's Day",
    start: new Date(2023, 0, 1),
    end: new Date(2023, 0, 1),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Araw ng Kagitingan",
    start: new Date(2023, 3, 9),
    end: new Date(2023, 3, 9),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Maundy Thursday",
    start: new Date(2023, 3, 6),
    end: new Date(2023, 3, 6),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Good Friday",
    start: new Date(2023, 3, 7),
    end: new Date(2023, 3, 7),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Labor Day",
    start: new Date(2023, 4, 1),
    end: new Date(2023, 4, 1),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Independence Day",
    start: new Date(2023, 5, 12),
    end: new Date(2023, 5, 12),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Ninoy Aquino Day",
    start: new Date(2023, 7, 21),
    end: new Date(2023, 7, 21),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "National Heroes Day",
    start: new Date(2023, 7, 28),
    end: new Date(2023, 7, 28),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Bonifacio Day",
    start: new Date(2023, 10, 30),
    end: new Date(2023, 10, 30),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Christmas Day",
    start: new Date(2023, 11, 25),
    end: new Date(2023, 11, 25),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Rizal Day",
    start: new Date(2023, 11, 30),
    end: new Date(2023, 11, 30),
    allDay: true,
    isHoliday: true,
  },

  // 2024 PH Holidays
  {
    title: "New Year's Day",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 1),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Araw ng Kagitingan",
    start: new Date(2024, 3, 9),
    end: new Date(2024, 3, 9),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Maundy Thursday",
    start: new Date(2024, 2, 28),
    end: new Date(2024, 2, 28),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Good Friday",
    start: new Date(2024, 2, 29),
    end: new Date(2024, 2, 29),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Labor Day",
    start: new Date(2024, 4, 1),
    end: new Date(2024, 4, 1),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Independence Day",
    start: new Date(2024, 5, 12),
    end: new Date(2024, 5, 12),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Ninoy Aquino Day",
    start: new Date(2024, 7, 21),
    end: new Date(2024, 7, 21),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "National Heroes Day",
    start: new Date(2024, 7, 26),
    end: new Date(2024, 7, 26),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Bonifacio Day",
    start: new Date(2024, 10, 30),
    end: new Date(2024, 10, 30),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Christmas Day",
    start: new Date(2024, 11, 25),
    end: new Date(2024, 11, 25),
    allDay: true,
    isHoliday: true,
  },
  {
    title: "Rizal Day",
    start: new Date(2024, 11, 30),
    end: new Date(2024, 11, 30),
    allDay: true,
    isHoliday: true,
  },
];

const allDoctorNames = [
  "Dr. Maria Sarah L. Manaloto",
  "Dr. Shara Laine S. Vino",
];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  // Add custom styles for calendar to handle multiple events better
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Increase calendar cell height to accommodate more events */
      .rbc-month-view .rbc-row {
        min-height: 100px !important;
      }
      
      /* Improve popup appearance */
      .rbc-overlay {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        max-height: 400px !important;
        overflow-y: auto !important;
        z-index: 1000 !important;
      }
      
      .rbc-overlay-header {
        background: #f9fafb !important;
        border-bottom: 1px solid #e5e7eb !important;
        padding: 12px 16px !important;
        font-weight: 600 !important;
        color: #374151 !important;
      }
      
      /* Style for show more link */
      .rbc-show-more {
        background: #f3f4f6 !important;
        border: 1px solid #d1d5db !important;
        border-radius: 4px !important;
        color: #6b7280 !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        padding: 2px 6px !important;
        margin: 1px !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
      }
      
      .rbc-show-more:hover {
        background: #e5e7eb !important;
        color: #374151 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // const [filter, setFilter] = useState('all'); // Removed - using statusTab and dateRange instead
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'calendar'
  const [statusFilter, setStatusFilter] = useState("all"); // 'active', 'completed', 'all' (removed 'today')
  const [dateRange, setDateRange] = useState("all"); // 'week', 'month', 'all' (removed redundant 'today')
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Fixed items per page
  // Calendar current view (kept for calendar mode)
  // Removed unused currentView state (calendar is fixed to month)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [doctorFilter, setDoctorFilter] = useState(allDoctorNames);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    contactNumber: "",
    doctorName: allDoctorNames[0],
    appointmentDate: new Date().toISOString().split("T")[0],
    appointmentTime: "09:00 AM",
    endTime: "",
    estimatedWaitTime: "",
    serviceType: "",
    reasonForVisit: "",
  });
  const [creating, setCreating] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  // Confirmation modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionAppointment, setActionAppointment] = useState(null);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState("");
  const [rescheduleCalendarMonth, setRescheduleCalendarMonth] = useState(new Date());

  // Modal for showing appointments on a specific date
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const [selectedModalDate, setSelectedModalDate] = useState(null);

  // Table column resizing
  const [columnWidths, setColumnWidths] = useState({
    0: 80, 1: 100, 2: 180, 3: 200, 4: 180, 5: 90, 6: 100, 7: 110, 8: 140
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeColumn, setResizeColumn] = useState(null);

  const handleResize = (e, columnIndex) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeColumn(columnIndex);
    const startX = e.pageX;
    const startWidth = columnWidths[columnIndex];

    const handleMouseMove = (e) => {
      const diff = e.pageX - startX;
      const newWidth = Math.max(60, startWidth + diff);
      setColumnWidths(prev => ({
        ...prev,
        [columnIndex]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Helper function to add 30 minutes to a time string
  const add30Minutes = (timeString) => {
    // Parse time string like "01:00 PM" or "09:30 AM"
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
    
    // Add 30 minutes
    totalMinutes += 30;
    
    // Convert back to 12-hour format
    let newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    
    let newPeriod = 'AM';
    if (newHours >= 12) {
      newPeriod = 'PM';
      if (newHours > 12) newHours -= 12;
    }
    if (newHours === 0) newHours = 12;
    
    return `${newHours}:${String(newMinutes).padStart(2, '0')} ${newPeriod}`;
  };

  const timeSlots = [
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const obgyneServices = [
    "PRENATAL_CHECKUP",
    "POSTNATAL_CHECKUP",
    "CHILDBIRTH_CONSULTATION",
    "DILATATION_CURETTAGE",
    "FAMILY_PLANNING",
    "PAP_SMEAR",
    "WOMEN_VACCINATION",
    "PCOS_CONSULTATION",
    "STI_CONSULTATION",
    "INFERTILITY_CONSULTATION",
    "MENOPAUSE_CONSULTATION",
  ];
  const pediatricServices = [
    "NEWBORN_CONSULTATION",
    "WELL_BABY_CHECKUP",
    "WELL_CHILD_CHECKUP",
    "PEDIATRIC_EVALUATION",
    "CHILD_VACCINATION",
    "EAR_PIERCING",
    "PEDIATRIC_REFERRAL",
  ];

  const getDoctorType = (doctorName) => {
    if (doctorName.includes("Maria")) return "ob-gyne";
    return "pediatric";
  };

  const getServiceOptions = (doctorType) => {
    return doctorType === "ob-gyne" ? obgyneServices : pediatricServices;
  };

  useEffect(() => {
    fetchAppointments();
  }, [viewMode]); // Only refetch when view mode changes

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const _today = new Date().toISOString().split("T")[0];

      let params = {
        // Fetch all appointments and filter on frontend
        limit: 1000,
      };

      const response = await appointmentsAPI.getAll(params);
      const data = extractData(response);
      console.log("Fetched appointments:", data.appointments);
      if (data.appointments && data.appointments.length > 0) {
        console.log("Sample appointment structure:", data.appointments[0]);
      }
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
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
      if (appointment.patient.patientType === "pediatric") {
        return (
          appointment.patient.pediatricRecord?.nameOfChildren ||
          "Pediatric Patient"
        );
      } else {
        return (
          appointment.patient.obGyneRecord?.patientName || "OB-GYNE Patient"
        );
      }
    }
    return "Unknown Patient";
  };

  const getContactInfo = (appointment) => {
    if (appointment.patientUserId) {
      return appointment.patientUserId.phoneNumber || appointment.contactNumber;
    }
    return appointment.contactInfo?.primaryPhone || "No contact";
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
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
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
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

  const printHtml = (html) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const buildPrintHtml = (rangeLabel, groupedByDoctor) => {
    const styles = `
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        h2 { font-size: 16px; margin: 16px 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 12px; }
        th { background: #f9fafb; text-align: left; }
        .muted { color: #6b7280; }
        .summary { margin-top: 6px; font-size: 12px; }
        .no-show { color: #7c3aed; font-weight: 600; }
      </style>`;

    const sections = Object.entries(groupedByDoctor)
      .map(([doctor, rows]) => {
        const noShows = rows.filter(
          (r) => (r.status || "").toLowerCase() === "no-show"
        );
        const noShowNames = noShows.map(
          (r) => r.patientName || r._patientName || ""
        );
        return `
        <section>
          <h2>${doctor}</h2>
          <div class="summary">
            Total: ${rows.length} &nbsp; • &nbsp;
            <span class="no-show">No-show: ${noShows.length}${
          noShows.length > 0 ? ` (${noShowNames.join(", ")})` : ""
        }</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Status</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r) => `
                <tr>
                  <td>${
                    (r.appointmentDate &&
                      new Date(r.appointmentDate).toLocaleDateString()) ||
                    ""
                  }</td>
                  <td>${r.appointmentTime || ""}</td>
                  <td>${r.patientName || r._patientName || ""}</td>
                  <td>${(r.serviceType || "").replace(/_/g, " ")}</td>
                  <td>${r.status || ""}</td>
                  <td>${
                    (r.contactInfo && r.contactInfo.primaryPhone) ||
                    r.contactNumber ||
                    ""
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </section>`;
      })
      .join("");

    const now = new Date();
    const header = `<h1>Appointments (${rangeLabel}) — Printed ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</h1>`;
    return `<!doctype html><html><head><meta charset="utf-8"/>${styles}</head><body>${header}${sections}</body></html>`;
  };

  const handlePrint = (mode) => {
    // Determine date window independent of on-screen date filter
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );
    const weekStart = new Date(startOfToday);
    weekStart.setDate(startOfToday.getDate() - startOfToday.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Start from full dataset then apply doctor/status/search filters, then date window for print
    const base = appointments
      .filter((a) => {
        const nameMatch =
          !searchTerm ||
          getPatientName(a).toLowerCase().includes(searchTerm.toLowerCase());
        const doctorMatch = doctorFilter.includes(a.doctorName);
        const statusMatch =
          statusFilter === "all" ||
          (a.status && a.status.toLowerCase() === statusFilter);
        return nameMatch && doctorMatch && statusMatch;
      })
      .filter((a) => {
        const d = new Date(a.appointmentDate);
        if (mode === "day") return d >= startOfToday && d <= endOfToday;
        if (mode === "week") return d >= weekStart && d <= weekEnd;
        return true;
      });

    const rows = base.map((a) => ({
      appointmentTime: a.appointmentTime,
      appointmentDate: a.appointmentDate,
      patientName: getPatientName(a),
      _patientName:
        a.patient?.obGyneRecord?.patientName ||
        a.patient?.pediatricRecord?.nameOfChildren,
      serviceType: a.serviceType,
      status: a.status,
      contactInfo: a.contactInfo,
      contactNumber: a.contactNumber,
      doctorName: a.doctorName,
    }));

    // Group by doctor
    const grouped = rows.reduce((acc, r) => {
      acc[r.doctorName] = acc[r.doctorName] || [];
      acc[r.doctorName].push(r);
      return acc;
    }, {});

    // Range label
    const label = mode === "week" ? "This Week" : "Today";
    const html = buildPrintHtml(label, grouped);
    printHtml(html);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // If already in AM/PM format, return as-is
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }
    // Otherwise, assume it's in HH:MM format and convert
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Handle both Date objects and date strings
    let date;
    if (typeof dateString === 'string') {
      // If it's a date string like "2025-12-09", parse it as local date to avoid timezone issues
      const [year, month, day] = dateString.split('T')[0].split('-');
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

  const getBookingSource = (appointment) => {
    return appointment.bookingSource === "patient_portal"
      ? "Patient Portal"
      : "Staff";
  };

  const handleDoctorFilterChange = (doctor) => {
    setDoctorFilter((prev) =>
      prev.includes(doctor)
        ? prev.filter((d) => d !== doctor)
        : [...prev, doctor]
    );
  };

  const visibleAppointments = appointments.filter((appointment) => {
    const searchMatch =
      !searchTerm ||
      getPatientName(appointment)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const doctorMatch = doctorFilter.includes(appointment.doctorName);

    // Status filtering (exact match for segmented control)
    const matchesStatus = (() => {
      if (statusFilter === "all") return true;
      if (statusFilter === "cancelled") {
        // Show both cancelled and cancellation_pending in cancelled filter
        const status = appointment.status?.toLowerCase();
        return status === "cancelled" || status === "cancellation_pending";
      }
      return (
        appointment.status && appointment.status.toLowerCase() === statusFilter
      );
    })();

    // Date range filtering (removed redundant 'today')
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
      return true; // 'all' date range
    })();

    return searchMatch && doctorMatch && matchesStatus && matchesDateRange;
  });

  const sortedAppointments = [...visibleAppointments].sort(
    (a, b) => parseAppointmentDateTime(b) - parseAppointmentDateTime(a)
  );

  // Debug logging
  console.log("Filtering results:", {
    totalAppointments: appointments.length,
    visibleAppointments: sortedAppointments.length,
    statusFilter,
    dateRange,
    doctorFilter,
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = sortedAppointments.slice(
    startIndex,
    endIndex
  );

  // Group appointments by doctor for the list view
  const appointmentsByDoctor = paginatedAppointments.reduce(
    (acc, appointment) => {
      const doctor = appointment.doctorName;
      if (!acc[doctor]) {
        acc[doctor] = [];
      }
      acc[doctor].push(appointment);
      return acc;
    },
    {}
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateRange, searchTerm]);

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, { status: newStatus });
      toast.success(`Appointment ${newStatus} successfully`);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(handleAPIError(error));
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    const currentDate = appointment.appointmentDate.split("T")[0];
    setSelectedRescheduleDate(currentDate);
    setRescheduleCalendarMonth(new Date(currentDate));
    setShowRescheduleModal(true);
  };

  // Get available dates for a doctor based on their schedule
  const getAvailableDatesForDoctor = (doctorName, startDate, endDate) => {
    const schedules = {
      "Dr. Maria Sarah L. Manaloto": [1, 3, 5], // Monday, Wednesday, Friday
      "Dr. Shara Laine S. Vino": [1, 2, 4], // Monday, Tuesday, Thursday
    };

    const availableDays = schedules[doctorName] || [];
    const availableDates = [];
    const currentDate = new Date(startDate);
    const maxDate = new Date(endDate);

    while (currentDate <= maxDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (availableDays.includes(dayOfWeek)) {
        availableDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableDates;
  };

  // Check if a date is available for the doctor
  const isDateAvailableForDoctor = (doctorName, dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();

    const schedules = {
      "Dr. Maria Sarah L. Manaloto": [1, 3, 5], // Monday, Wednesday, Friday
      "Dr. Shara Laine S. Vino": [1, 2, 4], // Monday, Tuesday, Thursday
    };

    const availableDays = schedules[doctorName] || [];
    return availableDays.includes(dayOfWeek);
  };

  const cancelAppointment = async (appointmentId, reason = "") => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, {
        status: "cancelled",
        reason: reason || "Cancelled by staff",
      });
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
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
      await updateAppointmentStatus(actionAppointment._id, "confirmed");
      setShowConfirmModal(false);
      setActionAppointment(null);
    }
  };

  const completeAppointment = async () => {
    if (actionAppointment) {
      await updateAppointmentStatus(actionAppointment._id, "completed");
      setShowCompleteModal(false);
      setActionAppointment(null);
    }
  };

  const cancelAppointmentConfirmed = async () => {
    if (actionAppointment) {
      const reasonInput = document.getElementById("cancelReason");
      const reason = reasonInput ? reasonInput.value.trim() : "";
      await cancelAppointment(actionAppointment._id, reason);
      setShowCancelModal(false);
      setActionAppointment(null);
    }
  };

  const handleApproveCancellation = async (appointment) => {
    if (window.confirm("Are you sure you want to approve this cancellation request?")) {
      try {
        await appointmentsAPI.approveCancellation(appointment._id);
        toast.success("Cancellation request approved successfully");
        fetchAppointments();
      } catch (error) {
        console.error("Error approving cancellation:", error);
        toast.error(handleAPIError(error));
      }
    }
  };

  const handleRejectCancellation = async (appointment) => {
    if (window.confirm("Are you sure you want to reject this cancellation request? The appointment will be restored to its previous status.")) {
      try {
        await appointmentsAPI.rejectCancellation(appointment._id);
        toast.success("Cancellation request rejected successfully");
        fetchAppointments();
      } catch (error) {
        console.error("Error rejecting cancellation:", error);
        toast.error(handleAPIError(error));
      }
    }
  };

  // Calendar events creation
  const getCalendarEvents = () => {
    // Use ALL appointments for calendar display
    const events = appointments.map((appointment) => {
      // Parse date
      const dateStr = appointment.appointmentDate.split("T")[0];
      const [year, month, day] = dateStr.split("-");

      // Parse time
      const timeStr = appointment.appointmentTime;
      const [time, period] = timeStr.split(" ");
      const [hours, minutes] = time.split(":");
      let hour24 = parseInt(hours);

      if (period === "PM" && hour24 < 12) hour24 += 12;
      if (period === "AM" && hour24 === 12) hour24 = 0;

      // Create event dates
      const startDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        hour24,
        parseInt(minutes)
      );
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 minutes later

      return {
        id: appointment._id,
        title:
          getPatientName(appointment) + " - " + appointment.appointmentTime,
        start: startDate,
        end: endDate,
      };
    });

    return events;
  };

  // Handle calendar event selection - when user clicks ON an appointment
  const handleEventSelect = (event) => {
    toast.info(`Clicked: ${event.title}`);
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

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return appointments.filter((appointment) => {
      const appointmentDate = appointment.appointmentDate.split("T")[0];
      return appointmentDate === dateString;
    });
  };

  const handleSelectSlot = (slotInfo) => {
    // Calendar is for VIEWING appointments only, not creating them
    // When user clicks a date, show appointments for that date in a modal
    const selectedDate = slotInfo.start;
    const dayAppointments = getAppointmentsForDate(selectedDate);

    setSelectedModalDate(selectedDate);
    setSelectedDateAppointments(dayAppointments);
    setShowDateModal(true);
  };

  // Custom calendar toolbar component
  const CustomToolbar = ({ date, view, onNavigate, onView }) => {
    const navigate = (action) => {
      onNavigate(action);
    };

    const viewNamesGroup = {
      month: "Month",
      week: "Week",
      day: "Day",
      agenda: "Agenda",
    };

    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-gradient-to-r from-off-white to-light-blush-50 rounded-lg border border-soft-olive-200">
        {/* Navigation and Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("PREV")}
              className="border-soft-olive-300 hover:bg-soft-olive-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("TODAY")}
              className="border-soft-olive-300 hover:bg-soft-olive-100 px-4"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("NEXT")}
              className="border-soft-olive-300 hover:bg-soft-olive-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xl font-semibold text-charcoal">
            {format(
              date,
              view === "month"
                ? "MMMM yyyy"
                : view === "week"
                ? "MMM d, yyyy"
                : "EEEE, MMM d, yyyy"
            )}
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
              className={
                view === key
                  ? "bg-warm-pink hover:bg-warm-pink-600 text-white"
                  : "border-soft-olive-300 hover:bg-soft-olive-100"
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
    setNewAppointment((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate end time when appointment time changes
      if (name === 'appointmentTime' && value) {
        updated.endTime = add30Minutes(value);
      }
      return updated;
    });
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
    setPatientSearch(
      patient.patientId +
        " - " +
        (patient.obGyneRecord?.patientName ||
          patient.pediatricRecord?.nameOfChildren ||
          "")
    );
    setPatientResults([]);
    setNewAppointment((prev) => ({
      ...prev,
      patientName:
        patient.obGyneRecord?.patientName ||
        patient.pediatricRecord?.nameOfChildren ||
        "",
      contactNumber: patient.contactInfo?.primaryPhone || "",
    }));
  };

  const handleCreateAppointment = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    const doctorType = getDoctorType(newAppointment.doctorName);
    const serviceOptions = getServiceOptions(doctorType);
    if (!serviceOptions.includes(newAppointment.serviceType)) {
      toast.error("Please select a valid service type");
      return;
    }
    if (
      !newAppointment.patientName.trim() ||
      !newAppointment.contactNumber.trim()
    ) {
      toast.error("Patient name and contact number are required");
      return;
    }
    if (
      !newAppointment.doctorName ||
      !newAppointment.appointmentDate ||
      !newAppointment.appointmentTime
    ) {
      toast.error("Please fill all required fields");
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
        endTime: newAppointment.endTime || undefined,
        estimatedWaitTime: newAppointment.estimatedWaitTime ? parseInt(newAppointment.estimatedWaitTime) : undefined,
        serviceType: newAppointment.serviceType,
        contactInfo: { primaryPhone: newAppointment.contactNumber },
        patientName: newAppointment.patientName.trim(),
        contactNumber: newAppointment.contactNumber.trim(),
        reasonForVisit: newAppointment.reasonForVisit.trim(),
        bookingSource: "staff",
      });
      toast.success("Appointment created successfully");
      setShowNewAppointmentModal(false);
      setSelectedPatient(null);
      setPatientSearch("");
      setNewAppointment({
        patientName: "",
        contactNumber: "",
        doctorName: allDoctorNames[0],
        appointmentDate: new Date().toISOString().split("T")[0],
        appointmentTime: "09:00 AM",
        endTime: "",
        estimatedWaitTime: "",
        serviceType: "",
        reasonForVisit: "",
      });
      fetchAppointments();
    } catch (error) {
      toast.error(handleAPIError(error) || "Failed to create appointment");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-warm-pink/5 to-soft-olive-100/50 p-4 rounded-lg border border-soft-olive-200">
        <div>
          <h1 className="text-2xl font-bold text-charcoal mb-1">
            Appointments
          </h1>
          <p className="text-muted-gold">
            Manage patient appointments and schedules
          </p>
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
      <Card className="bg-off-white border-soft-olive-200 sticky top-0 z-20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-gold" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 h-9 border border-soft-olive-300 rounded-md focus:ring-2 focus:ring-warm-pink focus:border-warm-pink text-charcoal placeholder-muted-gold bg-white"
                />
              </div>
            </div>

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

            {/* Simplified Date Range Filters */}
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

            {/* Doctor Tabs */}
            <div className="flex items-center gap-2 bg-white rounded-md border border-soft-olive-300 px-3 py-1.5">
              <User className="h-4 w-4 text-muted-gold" />
              <span className="text-sm text-muted-gold whitespace-nowrap mr-1">
                Doctors:
              </span>
              <Button
                variant={
                  doctorFilter.length === allDoctorNames.length
                    ? "clinic"
                    : "outline"
                }
                size="sm"
                className="h-9"
                onClick={() => setDoctorFilter(allDoctorNames)}
              >
                All
              </Button>
              <Button
                variant={
                  doctorFilter.length === 1 &&
                  doctorFilter[0] === allDoctorNames[0]
                    ? "clinic"
                    : "outline"
                }
                size="sm"
                onClick={() => setDoctorFilter([allDoctorNames[0]])}
                className="flex items-center gap-1 h-9"
              >
                Dr. Maria
              </Button>
              <Button
                variant={
                  doctorFilter.length === 1 &&
                  doctorFilter[0] === allDoctorNames[1]
                    ? "clinic"
                    : "outline"
                }
                size="sm"
                onClick={() => setDoctorFilter([allDoctorNames[1]])}
                className="flex items-center gap-1 h-9"
              >
                Dr. Shara
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Filter Tabs - Modern Segmented Control */}
      {viewMode === "list" && (
        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200 w-fit mb-6">
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

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Calendar View - Google Calendar Style */}
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
                      // Navigate to previous view
                      const calendarRef =
                        document.querySelector(".rbc-calendar");
                      if (calendarRef) {
                        const navigateButtons = calendarRef.querySelectorAll(
                          ".rbc-btn-group button"
                        );
                        if (navigateButtons && navigateButtons.length >= 2) {
                          navigateButtons[0].click(); // Navigate back button
                        }
                      }
                      setCurrentDate((prev) => {
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
                      const calendarRef =
                        document.querySelector(".rbc-calendar");
                      if (calendarRef) {
                        const navigateButtons = calendarRef.querySelectorAll(
                          ".rbc-btn-group button"
                        );
                        if (navigateButtons && navigateButtons.length >= 3) {
                          navigateButtons[2].click(); // Navigate next button
                        }
                      }
                      setCurrentDate((prev) => {
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
                      const calendarRef =
                        document.querySelector(".rbc-calendar");
                      if (calendarRef) {
                        const todayButton = calendarRef.querySelector(
                          ".rbc-btn-group button:first-child"
                        );
                        if (todayButton) todayButton.click();
                      }
                    }}
                  >
                    Today
                  </button>
                </div>
              </div>

              <div className="flex h-[700px]">
                <div className="hidden md:block w-60 border-r p-4 bg-white overflow-y-auto">
                  <div className="mb-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                      Doctors
                    </div>
                    <div className="space-y-2">
                      {allDoctorNames.map((doctor) => (
                        <div key={doctor} className="flex items-center">
                          <input
                            type="checkbox"
                            id={doctor}
                            name="doctorFilter"
                            checked={doctorFilter.includes(doctor)}
                            onChange={() => handleDoctorFilterChange(doctor)}
                            className="h-4 w-4 rounded border-gray-300 text-clinic-600 focus:ring-clinic-500 cursor-pointer"
                          />
                          <label
                            htmlFor={doctor}
                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                          >
                            {doctor
                              .replace("Dr. ", "")
                              .split(" ")
                              .slice(0, 2)
                              .join(" ")}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                      Upcoming Holidays
                    </div>
                    <div className="space-y-2 text-sm">
                      {holidays
                        .filter((h) => new Date(h.start) >= new Date())
                        .slice(0, 5)
                        .map((holiday, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-xs py-1 border-b border-gray-100"
                          >
                            <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {holiday.title}
                              </span>
                              <span className="text-gray-500">
                                {format(new Date(holiday.start), "EEE, MMM d")}
                              </span>
                            </div>
                          </div>
                        ))}
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
                          if (dateRange === "all") {
                            setDateRange("today");
                          } else {
                            setDateRange("all");
                          }
                          toast.info(
                            dateRange === "today"
                              ? "Showing all appointments"
                              : "Showing today's appointments"
                          );
                        }}
                      >
                        <Filter className="h-3.5 w-3.5 mr-2" />
                        {dateRange === "all"
                          ? "Today Only"
                          : "All Appointments"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-white rounded-lg">
                  {/* Calendar */}
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
                      onView={() => {}} // disables view switching
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
                      dayPropGetter={(date) => {
                        const _today3 = new Date();
                        const isToday =
                          date.getDate() === _today3.getDate() &&
                          date.getMonth() === _today3.getMonth() &&
                          date.getFullYear() === _today3.getFullYear();
                        const isWeekend =
                          date.getDay() === 0 || date.getDay() === 6;
                        const isPast = date < _today3.setHours(0, 0, 0, 0);

                        // Get appointment count for this date
                        const dayAppointments = getAppointmentsForDate(date);
                        const appointmentCount = dayAppointments.length;

                        let className = "";
                        let style = {};

                        if (isToday) {
                          className = "google-today";
                          style = {
                            backgroundColor: "#e8f0fe",
                            fontWeight: "600",
                          };
                        } else if (isWeekend) {
                          className = "google-weekend";
                          style = {
                            backgroundColor: "#fafafa",
                          };
                        } else if (isPast) {
                          style = {
                            backgroundColor: "#f8f9fa",
                            color: "#9aa0a6",
                          };
                        }

                        // Add appointment count indicator
                        if (appointmentCount > 0) {
                          style = {
                            ...style,
                            position: "relative",
                          };
                        }

                        return {
                          className,
                          style: {
                            ...style,
                            borderRadius: "4px",
                            margin: "1px",
                          },
                        };
                      }}
                      components={{
                        month: {
                          dateHeader: ({ date, label }) => {
                            const dayAppointments =
                              getAppointmentsForDate(date);
                            const appointmentCount = dayAppointments.length;

                            return (
                              <div style={{ position: "relative" }}>
                                <span>{label}</span>
                                {appointmentCount > 0 && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "-8px",
                                      right: "-8px",
                                      backgroundColor: "#dc2626",
                                      color: "white",
                                      borderRadius: "50%",
                                      width: "20px",
                                      height: "20px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      zIndex: 10,
                                    }}
                                  >
                                    {appointmentCount}
                                  </div>
                                )}
                              </div>
                            );
                          },
                        },
                      }}
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
                  <table ref={tableRef} className="min-w-full text-sm border-collapse">
                    <colgroup>
                      <col style={{ width: `${columnWidths[1]}px`, minWidth: '80px' }} />
                      <col style={{ width: `${columnWidths[0]}px`, minWidth: '60px' }} />
                      <col style={{ width: `${columnWidths[2]}px`, minWidth: '120px' }} />
                      <col style={{ width: `${columnWidths[3]}px`, minWidth: '150px' }} />
                      <col style={{ width: `${columnWidths[4]}px`, minWidth: '120px' }} />
                      <col style={{ width: `${columnWidths[5]}px`, minWidth: '70px' }} />
                      <col style={{ width: `${columnWidths[6]}px`, minWidth: '80px' }} />
                      <col style={{ width: `${columnWidths[7]}px`, minWidth: '90px' }} />
                      <col style={{ width: `${columnWidths[8]}px`, minWidth: '120px' }} />
                    </colgroup>
                    <thead className="bg-gray-50 text-charcoal">
                      <tr>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 1)}></div>
                          Date
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 0)}></div>
                          Time
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 2)}></div>
                          Patient
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 3)}></div>
                          Doctor
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 4)}></div>
                          Service
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 5)}></div>
                          End Time
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 6)}></div>
                          Wait Time
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 7)}></div>
                          Status
                        </th>
                        <th className="px-1 py-2 text-left relative">
                          Actions
                        </th>
                      </tr>
                    </thead>
                  <tbody className="divide-y">
                    {paginatedAppointments.map((a) => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-1 py-2 border-r border-gray-100">
                          {formatDate(a.appointmentDate)}
                        </td>
                        <td className="px-1 py-2 font-medium border-r border-gray-100">
                          {formatTime(a.appointmentTime)}
                        </td>
                        <td className="px-1 py-2 truncate border-r border-gray-100">
                          {getPatientName(a)}
                        </td>
                        <td className="px-1 py-2 truncate border-r border-gray-100">{a.doctorName}</td>
                        <td className="px-1 py-2 truncate border-r border-gray-100">
                          {a.serviceType.replace(/_/g, " ")}
                        </td>
                        <td className="px-1 py-2 border-r border-gray-100">
                          {a.endTime ? formatTime(a.endTime) : (a.appointmentTime ? formatTime(add30Minutes(a.appointmentTime)) : '—')}
                        </td>
                        <td className="px-1 py-2 border-r border-gray-100">
                          {a.estimatedWaitTime ? `${a.estimatedWaitTime} min` : '—'}
                        </td>
                        <td className="px-1 py-2 border-r border-gray-100">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(
                              a.status
                            )}`}
                          >
                            {(() => {
                              const status = a.status?.toLowerCase();
                              if (status === "cancellation_pending") {
                                return "Cancellation Pending";
                              } else if (status === "reschedule_pending") {
                                return "Reschedule Pending";
                              }
                              return a.status.charAt(0).toUpperCase() + a.status.slice(1);
                            })()}
                          </span>
                        </td>
                        <td className="px-1 py-2">
                          <div className="flex gap-1.5">
                            {/* Patient Cancellation Request Actions */}
                            {a.status === "cancellation_pending" && 
                             a.cancellationRequest && 
                             a.cancellationRequest.requestedBy && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApproveCancellation(a)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 px-2 bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleRejectCancellation(a)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {a.status === "scheduled" && (
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleConfirmClick(a)}
                              >
                                Confirm
                              </Button>
                            )}
                            {a.status === "confirmed" && (
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleCompleteClick(a)}
                              >
                                Complete
                              </Button>
                            )}
                            {(a.status === "scheduled" ||
                              a.status === "confirmed") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={() => handleReschedule(a)}
                              >
                                Resched
                              </Button>
                            )}
                            {(a.status === "scheduled" ||
                              a.status === "confirmed") && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 px-2"
                                onClick={() => handleCancelClickModal(a)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* List View */}
          {viewMode === "list" &&
            (visibleAppointments.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Object.entries(appointmentsByDoctor).map(
                  ([doctorName, doctorAppointments]) => (
                    <Card
                      key={doctorName}
                      className="bg-off-white border-soft-olive-200"
                    >
                      <CardHeader className="bg-gradient-to-r from-warm-pink/10 to-soft-olive-100 border-b border-soft-olive-200">
                        <CardTitle className="flex items-center gap-2 text-charcoal">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              doctorName.includes("Maria")
                                ? "bg-warm-pink"
                                : "bg-yellow-400"
                            }`}
                          ></div>
                          <span className="font-semibold">{doctorName}</span>
                        </CardTitle>
                        <CardDescription className="text-muted-gold text-sm">
                          {doctorName.includes("Maria")
                            ? "OB-GYNE Specialist"
                            : "Pediatric Specialist"}{" "}
                          •
                          {dateRange === "today"
                            ? " Today's Schedule"
                            : ` ${doctorAppointments.length} appointment(s)`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 p-4">
                        {doctorAppointments.length === 0 ? (
                          <div className="text-center py-12 text-muted-gold">
                            <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-soft-olive-400" />
                            <p className="text-lg">
                              No appointments{" "}
                              {dateRange === "today" ? "today" : "found"}
                            </p>
                          </div>
                        ) : (
                          doctorAppointments.map((appointment) => (
                            <div
                              key={appointment._id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                            >
                              {/* Patient Info Header */}
                              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-warm-pink/10 rounded-md">
                                      <User className="h-4 w-4 text-warm-pink" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-charcoal">
                                        {getPatientName(appointment)}
                                      </h3>
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(appointment.status)}
                                        <span
                                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                            appointment.status
                                          )}`}
                                        >
                                          {(() => {
                                            const status = appointment.status?.toLowerCase();
                                            if (status === "cancellation_pending") {
                                              return "Cancellation Pending";
                                            } else if (status === "reschedule_pending") {
                                              return "Reschedule Pending";
                                            }
                                            return appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
                                          })()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-1 text-sm text-muted-gold">
                                    <p className="font-medium text-charcoal">
                                      {appointment.serviceType.replace(
                                        /_/g,
                                        " "
                                      )}
                                    </p>
                                    {appointment.reasonForVisit && (
                                      <p className="italic bg-soft-olive-50 p-2 rounded text-xs">
                                        "{appointment.reasonForVisit}"
                                      </p>
                                    )}
                                    {/* Patient Cancellation Request */}
                                    {appointment.status === "cancellation_pending" && 
                                     appointment.cancellationRequest && 
                                     appointment.cancellationRequest.requestedBy && (
                                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                        <p className="font-semibold text-orange-800 mb-1">
                                          Patient Cancellation Request
                                        </p>
                                        <p className="text-orange-700">
                                          <strong>Reason:</strong> {appointment.cancellationRequest.reason || "No reason provided"}
                                        </p>
                                        <p className="text-orange-600 text-xs mt-1">
                                          Requested on {new Date(appointment.cancellationRequest.requestedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3 w-3" />
                                      <span className="text-xs">
                                        {getContactInfo(appointment)}
                                      </span>
                                      <span className="text-xs px-2 py-0.5 bg-light-blush rounded-full">
                                        {getBookingSource(appointment)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Time Info */}
                                <div className="text-center lg:text-right bg-gradient-to-br from-soft-olive-50 to-light-blush/30 p-3 rounded-md border border-soft-olive-200">
                                  <div className="text-lg font-bold text-warm-pink">
                                    {formatTime(appointment.appointmentTime)}
                                  </div>
                                  {dateRange !== "today" && (
                                    <p className="text-xs text-muted-gold mt-1">
                                      {formatDate(appointment.appointmentDate)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="border-t border-soft-olive-100 pt-3">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                  {/* Patient Cancellation Request Actions */}
                                  {appointment.status === "cancellation_pending" && 
                                   appointment.cancellationRequest && 
                                   appointment.cancellationRequest.requestedBy && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                                        onClick={() =>
                                          handleApproveCancellation(appointment)
                                        }
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold"
                                        onClick={() =>
                                          handleRejectCancellation(appointment)
                                        }
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {appointment.status === "scheduled" && (
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                      onClick={() =>
                                        handleConfirmClick(appointment)
                                      }
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Confirm
                                    </Button>
                                  )}
                                  {appointment.status === "confirmed" && (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                                      onClick={() =>
                                        handleCompleteClick(appointment)
                                      }
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Complete
                                    </Button>
                                  )}
                                  {(appointment.status === "scheduled" ||
                                    appointment.status === "confirmed") && (
                                    <Button
                                      size="sm"
                                      className="bg-white border border-black text-black font-semibold hover:bg-gray-100 hover:text-black hover:border-black"
                                      onClick={() =>
                                        handleReschedule(appointment)
                                      }
                                    >
                                      <CalendarIcon className="h-3 w-3 mr-1" />
                                      Reschedule
                                    </Button>
                                  )}
                                  {(appointment.status === "scheduled" ||
                                    appointment.status === "confirmed") && (
                                    <Button
                                      size="sm"
                                      className="bg-red-500 hover:bg-red-600 text-white font-semibold"
                                      onClick={() =>
                                        handleCancelClickModal(appointment)
                                      }
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
                  )
                )}
              </div>
            ) : viewMode === "list" ? (
              <Card className="bg-off-white border-soft-olive-200">
                <CardContent className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-soft-olive-50 to-light-blush/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CalendarIcon className="h-8 w-8 text-muted-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    No appointments found
                  </h3>
                  <p className="text-muted-gold mb-4 max-w-md mx-auto">
                    {searchTerm
                      ? `No appointments found matching "${searchTerm}"`
                      : doctorFilter.length === 0
                      ? "Select a doctor to view appointments"
                      : "No appointments found for the selected criteria"}
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
                <CardTitle className="text-xl font-bold text-charcoal">
                  Appointment Summary
                </CardTitle>
                <CardDescription className="text-muted-gold">
                  Statistics {dateRange === "today" ? "for today" : "overview"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-soft-olive-200">
                    <div className="w-12 h-12 bg-soft-olive-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-soft-olive-600" />
                    </div>
                    <div className="text-2xl font-bold text-soft-olive-600 mb-1">
                      {
                        visibleAppointments.filter(
                          (a) => a.status === "scheduled"
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-muted-gold">
                      Scheduled
                    </div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-soft-olive-200">
                    <div className="w-12 h-12 bg-warm-pink/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-warm-pink" />
                    </div>
                    <div className="text-2xl font-bold text-warm-pink mb-1">
                      {
                        visibleAppointments.filter(
                          (a) => a.status === "confirmed"
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-muted-gold">
                      Confirmed
                    </div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-soft-olive-200">
                    <div className="w-12 h-12 bg-muted-gold/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-muted-gold" />
                    </div>
                    <div className="text-2xl font-bold text-muted-gold mb-1">
                      {
                        visibleAppointments.filter(
                          (a) => a.status === "completed"
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-muted-gold">
                      Completed
                    </div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-soft-olive-200">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-red-500 mb-1">
                      {
                        visibleAppointments.filter(
                          (a) => {
                            const status = a.status?.toLowerCase();
                            return status === "cancelled" || status === "cancellation_pending";
                          }
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-muted-gold">
                      Cancelled
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination Controls - Only show for list view */}
          {viewMode === "list" && visibleAppointments.length > itemsPerPage && (
            <Card className="bg-off-white border border-soft-olive-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-gold">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, visibleAppointments.length)} of{" "}
                    {visibleAppointments.length} appointments
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and 1 page before/after current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const prevPage = array[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-2 text-muted-gold">
                                  ...
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                className={
                                  currentPage === page
                                    ? "bg-warm-pink text-white"
                                    : "border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50"
                                }
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-soft-olive-300 text-muted-gold hover:bg-soft-olive-50"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
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
                <div
                  className={`text-sm font-semibold capitalize px-2.5 py-1 rounded-full text-white ${
                    {
                      scheduled: "bg-blue-500",
                      confirmed: "bg-green-500",
                      completed: "bg-gray-500",
                      cancelled: "bg-red-500",
                    }[selectedAppointment.status] || "bg-yellow-500"
                  }`}
                >
                  {selectedAppointment.status}
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-x-2 gap-y-3 py-4 text-sm">
              <div className="col-span-1 font-semibold text-gray-500">
                Patient
              </div>
              <div className="col-span-2">
                {getPatientName(selectedAppointment)}
              </div>

              <div className="col-span-1 font-semibold text-gray-500">
                Contact
              </div>
              <div className="col-span-2">
                {getContactInfo(selectedAppointment)}
              </div>

              <div className="col-span-1 font-semibold text-gray-500">
                Doctor
              </div>
              <div className="col-span-2">{selectedAppointment.doctorName}</div>

              <div className="col-span-1 font-semibold text-gray-500">
                Service
              </div>
              <div className="col-span-2">
                {selectedAppointment.serviceType.replace(/_/g, " ")}
              </div>

              <div className="col-span-1 font-semibold text-gray-500">
                Schedule
              </div>
              <div className="col-span-2">
                {format(
                  new Date(selectedAppointment.appointmentDate),
                  "EEE, MMM d, yyyy"
                )}{" "}
                at {selectedAppointment.appointmentTime}
                {selectedAppointment.endTime || selectedAppointment.appointmentTime ? (
                  <span className="text-gray-500">
                    {" - "}
                    {selectedAppointment.endTime 
                      ? formatTime(selectedAppointment.endTime)
                      : formatTime(add30Minutes(selectedAppointment.appointmentTime))}
                  </span>
                ) : null}
              </div>

              {selectedAppointment.reasonForVisit && (
                <>
                  <div className="col-span-1 font-semibold text-gray-500 pt-1">
                    Reason
                  </div>
                  <div className="col-span-2 bg-gray-50 p-2 rounded-md italic">
                    "{selectedAppointment.reasonForVisit}"
                  </div>
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
              {(selectedAppointment.status === "scheduled" ||
                selectedAppointment.status === "confirmed") && (
                <div className="flex space-x-2">
                  <Button variant="destructive" onClick={handleCancelClick}>
                    Cancel Appointment
                  </Button>
                  <Button variant="clinic" onClick={handleRescheduleClick}>
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
        <Dialog
          open={showRescheduleModal}
          onOpenChange={setShowRescheduleModal}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Reschedule
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 bg-blue-50 p-2 rounded-md text-sm">
                <div className="font-medium">
                  {getPatientName(selectedAppointment)}
                </div>
                <div className="text-xs text-gray-600">
                  {formatDate(selectedAppointment.appointmentDate)} at{" "}
                  {formatTime(selectedAppointment.appointmentTime)}
                </div>
                <div className="text-xs">
                  {selectedAppointment.doctorName} ·{" "}
                  {selectedAppointment.serviceType.replace(/_/g, " ")}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium mb-2 text-gray-700">
                  Select New Date
                </label>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white shadow-sm">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        const newMonth = new Date(rescheduleCalendarMonth);
                        newMonth.setMonth(newMonth.getMonth() - 1);
                        setRescheduleCalendarMonth(newMonth);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h3 className="text-sm font-semibold text-gray-700">
                      {rescheduleCalendarMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newMonth = new Date(rescheduleCalendarMonth);
                        newMonth.setMonth(newMonth.getMonth() + 1);
                        setRescheduleCalendarMonth(newMonth);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Day headers */}
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                      <div
                        key={idx}
                        className="text-center text-xs font-semibold text-gray-400 py-1"
                      >
                        {day}
                      </div>
                    ))}

                    {(() => {
                      const year = rescheduleCalendarMonth.getFullYear();
                      const month = rescheduleCalendarMonth.getMonth();
                      const firstDay = new Date(year, month, 1);
                      const lastDay = new Date(year, month + 1, 0);
                      const startDayOfWeek = firstDay.getDay();
                      const daysInMonth = lastDay.getDate();
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const cells = [];

                      // Empty cells for days before month starts
                      for (let i = 0; i < startDayOfWeek; i++) {
                        cells.push(
                          <div key={`empty-${i}`} className="h-8"></div>
                        );
                      }

                      // Date cells
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        // Format date string directly to avoid timezone issues
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isAvailable = isDateAvailableForDoctor(
                          selectedAppointment.doctorName,
                          dateStr
                        );
                        const isPast = date < today;
                        const isSelected = selectedRescheduleDate === dateStr;
                        // Format today's date string the same way
                        const todayYear = today.getFullYear();
                        const todayMonth = today.getMonth();
                        const todayDay = today.getDate();
                        const todayStr = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
                        const isToday = dateStr === todayStr;

                        cells.push(
                          <button
                            key={day}
                            type="button"
                            disabled={!isAvailable || isPast}
                            onClick={() => {
                              if (isAvailable && !isPast) {
                                setSelectedRescheduleDate(dateStr);
                                const hiddenInput = document.getElementById("newDate");
                                if (hiddenInput) {
                                  hiddenInput.value = dateStr;
                                }
                              }
                            }}
                            className={`
                              h-8 w-full rounded-md text-xs font-semibold transition-all duration-200
                              ${
                                !isAvailable || isPast
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                  : isSelected
                                  ? "bg-warm-pink text-white shadow-lg scale-110 ring-2 ring-warm-pink ring-offset-1"
                                  : isToday
                                  ? "bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-warm-pink hover:text-white hover:border-warm-pink hover:shadow-md"
                              }
                              focus:outline-none focus:ring-2 focus:ring-warm-pink focus:ring-offset-1
                              disabled:cursor-not-allowed
                            `}
                            title={
                              !isAvailable
                                ? "Doctor not available on this day"
                                : isPast
                                ? "Cannot select past dates"
                                : `Select ${date.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                  })}`
                            }
                          >
                            {day}
                          </button>
                        );
                      }

                      return cells;
                    })()}
                  </div>
                </div>
                <input
                  type="hidden"
                  id="newDate"
                  value={selectedRescheduleDate}
                />
                {selectedRescheduleDate && (
                  <div className="mt-2 p-2 bg-warm-pink/10 border border-warm-pink/20 rounded-md">
                    <p className="text-xs text-warm-pink-700 font-medium">
                      Selected:{" "}
                      {(() => {
                        // Parse date string as local date to avoid timezone issues
                        const datePart = selectedRescheduleDate.split("T")[0];
                        const [year, month, day] = datePart.split("-");
                        const localDate = new Date(
                          parseInt(year),
                          parseInt(month) - 1,
                          parseInt(day)
                        );
                        return localDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      })()}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {(() => {
                    const schedules = {
                      "Dr. Maria Sarah L. Manaloto": "Available: Mon, Wed, Fri",
                      "Dr. Shara Laine S. Vino": "Available: Mon, Tue, Thu",
                    };
                    return (
                      schedules[selectedAppointment.doctorName] ||
                      "Check doctor schedule"
                    );
                  })()}
                </p>
              </div>

              <div>
                <label
                  htmlFor="newTime"
                  className="block text-xs font-medium mb-1"
                >
                  New Time
                </label>
                <select
                  id="newTime"
                  defaultValue={selectedAppointment.appointmentTime}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                >
                  {[
                    "09:00 AM",
                    "09:30 AM",
                    "10:00 AM",
                    "10:30 AM",
                    "11:00 AM",
                    "11:30 AM",
                    "01:00 PM",
                    "01:30 PM",
                    "02:00 PM",
                    "02:30 PM",
                    "03:00 PM",
                    "03:30 PM",
                    "04:00 PM",
                    "04:30 PM",
                  ].map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="rescheduleReason" className="text-xs font-medium mb-1">
                  Reason for Rescheduling
                </Label>
                <textarea
                  id="rescheduleReason"
                  rows={3}
                  placeholder="Enter reason for rescheduling..."
                  className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-warm-pink focus:border-transparent"
                />
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
                  const newDate = document.getElementById("newDate").value;
                  const newTime = document.getElementById("newTime").value;
                  const reasonInput = document.getElementById("rescheduleReason");
                  const reason = reasonInput ? reasonInput.value.trim() : "";

                  if (!newDate || !newTime) {
                    toast.error("Please select both date and time");
                    return;
                  }

                  if (!reason) {
                    toast.error("Please provide a reason for rescheduling");
                    return;
                  }

                  appointmentsAPI
                    .reschedule(selectedAppointment._id, {
                      newDate: newDate,
                      newTime: newTime,
                      reason: reason || "Rescheduled by staff",
                    })
                    .then(() => {
                      toast.success("Appointment rescheduled successfully");
                      setShowRescheduleModal(false);
                      fetchAppointments();
                    })
                    .catch((error) => {
                      toast.error(
                        handleAPIError(error) ||
                          "Failed to reschedule appointment"
                      );
                      console.error(error);
                    });
                }}
              >
                Reschedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Appointment Modal */}
      <Dialog
        open={showNewAppointmentModal}
        onOpenChange={setShowNewAppointmentModal}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateAppointment();
            }}
            className="space-y-2 overflow-y-auto flex-1 pr-2"
          >
            <div>
              <label className="block text-xs font-medium mb-0.5">
                Search Patient *
              </label>
              <input
                type="text"
                value={patientSearch}
                onChange={handlePatientSearch}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                placeholder="Type name, ID, or contact..."
                required
              />
              {searching && (
                <div className="text-xs text-gray-500 mt-0.5">Searching...</div>
              )}
              {patientResults.length > 0 && (
                <div className="border rounded bg-white shadow max-h-32 overflow-y-auto mt-1 z-10">
                  {patientResults.map((p) => (
                    <div
                      key={p._id}
                      className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer text-xs"
                      onClick={() => handleSelectPatient(p)}
                    >
                      {p.patientId} -{" "}
                      {p.obGyneRecord?.patientName ||
                        p.pediatricRecord?.nameOfChildren ||
                        ""}{" "}
                      ({p.patientType})
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedPatient && (
              <div className="p-1.5 bg-blue-50 rounded text-xs">
                <div><b>ID:</b> {selectedPatient.patientId} | <b>Type:</b> {selectedPatient.patientType} | <b>Contact:</b> {selectedPatient.contactInfo?.primaryPhone}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-0.5">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={newAppointment.patientName}
                  onChange={handleNewAppointmentChange}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-0.5">
                  Contact Number *
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={newAppointment.contactNumber}
                  onChange={handleNewAppointmentChange}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-0.5">Doctor *</label>
              <select
                name="doctorName"
                value={newAppointment.doctorName}
                onChange={(e) => {
                  handleNewAppointmentChange(e);
                  setNewAppointment((prev) => ({ ...prev, serviceType: "" }));
                }}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                required
              >
                {allDoctorNames.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-0.5">Date *</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={newAppointment.appointmentDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleNewAppointmentChange}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-0.5">Time *</label>
                <select
                  name="appointmentTime"
                  value={newAppointment.appointmentTime}
                  onChange={handleNewAppointmentChange}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                  required
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-0.5">End Time</label>
                <input
                  type="text"
                  name="endTime"
                  value={newAppointment.endTime}
                  onChange={handleNewAppointmentChange}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md bg-gray-50"
                  placeholder="Auto-calculated"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-0.5">Wait Time (min)</label>
                <input
                  type="number"
                  name="estimatedWaitTime"
                  value={newAppointment.estimatedWaitTime}
                  onChange={handleNewAppointmentChange}
                  min="0"
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                  placeholder="15"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-0.5">
                Service Type *
              </label>
              <select
                name="serviceType"
                value={newAppointment.serviceType}
                onChange={handleNewAppointmentChange}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                required
              >
                <option value="">Select service</option>
                {getServiceOptions(
                  getDoctorType(newAppointment.doctorName)
                ).map((svc) => (
                  <option key={svc} value={svc}>
                    {svc.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-0.5">
                Reason for Visit
              </label>
              <textarea
                name="reasonForVisit"
                value={newAppointment.reasonForVisit}
                onChange={handleNewAppointmentChange}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
            <DialogFooter className="mt-2 flex justify-between w-full flex-shrink-0">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowNewAppointmentModal(false)}
              >
                Cancel
              </Button>
              <Button variant="clinic" type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Appointment"}
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
                  <div className="font-semibold text-charcoal">
                    {getPatientName(actionAppointment)}
                  </div>
                  <div className="text-muted-gold">
                    {formatDate(actionAppointment.appointmentDate)} at{" "}
                    {formatTime(actionAppointment.appointmentTime)}
                  </div>
                  <div className="text-muted-gold">
                    {actionAppointment.doctorName} •{" "}
                    {actionAppointment.serviceType.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
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
                  <div className="font-semibold text-charcoal">
                    {getPatientName(actionAppointment)}
                  </div>
                  <div className="text-muted-gold">
                    {formatDate(actionAppointment.appointmentDate)} at{" "}
                    {formatTime(actionAppointment.appointmentTime)}
                  </div>
                  <div className="text-muted-gold">
                    {actionAppointment.doctorName} •{" "}
                    {actionAppointment.serviceType.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteModal(false)}
            >
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
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>
            {actionAppointment && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                <div className="text-sm">
                  <div className="font-semibold text-charcoal">
                    {getPatientName(actionAppointment)}
                  </div>
                  <div className="text-muted-gold">
                    {formatDate(actionAppointment.appointmentDate)} at{" "}
                    {formatTime(actionAppointment.appointmentTime)}
                  </div>
                  <div className="text-muted-gold">
                    {actionAppointment.doctorName} •{" "}
                    {actionAppointment.serviceType.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="cancelReason" className="text-sm font-medium text-charcoal mb-2 block">
                Reason for Cancellation
              </Label>
              <textarea
                id="cancelReason"
                rows={3}
                placeholder="Enter reason for cancellation..."
                className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Appointment
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                const reasonInput = document.getElementById("cancelReason");
                if (!reasonInput || !reasonInput.value.trim()) {
                  toast.error("Please provide a reason for cancellation");
                  return;
                }
                cancelAppointmentConfirmed();
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Appointments Modal */}
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
                            <User className="h-4 w-4 text-gray-500" />
                            {getPatientName(appointment)}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.appointmentTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {getContactInfo(appointment)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-black">
                            {appointment.appointmentTime}
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(appointment.status)}
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                appointment.status
                              )}`}
                            >
                              {(() => {
                                const status = appointment.status?.toLowerCase();
                                if (status === "cancellation_pending") {
                                  return "Cancellation Pending";
                                } else if (status === "reschedule_pending") {
                                  return "Reschedule Pending";
                                }
                                return appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Doctor:
                            </span>
                            <p
                              className={
                                appointment.doctorName ===
                                "Dr. Maria Sarah L. Manaloto"
                                  ? "text-warm-pink font-semibold"
                                  : appointment.doctorName ===
                                    "Dr. Shara Laine S. Vino"
                                  ? "text-blue-600 font-semibold"
                                  : "text-gray-600"
                              }
                            >
                              {appointment.doctorName}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Service:
                            </span>
                            <p className="text-gray-600">
                              {appointment.serviceType.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>

                        {appointment.reasonForVisit && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700 text-sm">
                              Reason:
                            </span>
                            <p className="text-gray-600 text-sm italic bg-gray-50 p-2 rounded mt-1">
                              "{appointment.reasonForVisit}"
                            </p>
                          </div>
                        )}

                        {/* Patient Cancellation Request */}
                        {appointment.status === "cancellation_pending" && 
                         appointment.cancellationRequest && 
                         appointment.cancellationRequest.requestedBy && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                            <p className="font-semibold text-orange-800 mb-1">
                              Patient Cancellation Request
                            </p>
                            <p className="text-orange-700">
                              <strong>Reason:</strong> {appointment.cancellationRequest.reason || "No reason provided"}
                            </p>
                            <p className="text-orange-600 text-xs mt-1">
                              Requested on {new Date(appointment.cancellationRequest.requestedAt).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                onClick={() => handleApproveCancellation(appointment)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white text-xs"
                                onClick={() => handleRejectCancellation(appointment)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDateModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
