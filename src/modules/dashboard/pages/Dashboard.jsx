import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  reportsAPI,
  appointmentsAPI,
  patientsAPI,
  useAuth,
  LoadingSpinner,
} from "../../shared";
import { useState, useEffect } from "react";
import { Calendar, Users, FileText, Clock, Activity, Plus } from "lucide-react";
export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingReports: 0,
    nextAppointment: null,
    recentActivities: [],
    loading: true,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError("");

      // Get today's date
      const today = new Date().toISOString().split("T")[0];

      // Fetch dashboard analytics
      const [
        dashboardResponse,
        todayAppointmentsResponse,
        patientsStatsResponse,
      ] = await Promise.all([
        reportsAPI.getDashboardAnalytics().catch(() => ({ data: {} })),
        appointmentsAPI
          .getAll({ date: today, limit: 100 })
          .catch(() => ({ data: { appointments: [] } })),
        patientsAPI
          .search({ limit: 1 })
          .catch(() => ({ data: { pagination: { total: 0 } } })),
      ]);

      const todayAppointments =
        todayAppointmentsResponse.data?.appointments || [];
      const totalPatients = patientsStatsResponse.data?.pagination?.total || 0;

      // Find next appointment
      const now = new Date();
      const upcomingAppointments = todayAppointments
        .filter((apt) => {
          const aptDateTime = new Date(`${apt.date}T${apt.time}`);
          return aptDateTime > now && apt.status === "confirmed";
        })
        .sort((a, b) => {
          const timeA = new Date(`${a.date}T${a.time}`);
          const timeB = new Date(`${b.date}T${b.time}`);
          return timeA - timeB;
        });

      const nextAppointment = upcomingAppointments[0] || null;

      // Generate recent activities from appointments
      const recentActivities = todayAppointments.slice(0, 3).map((apt) => ({
        type:
          apt.status === "confirmed"
            ? "appointment_confirmed"
            : "appointment_pending",
        message: `${
          apt.status === "confirmed"
            ? "Appointment confirmed"
            : "New appointment"
        }`,
        details: `Patient: ${apt.patientName} - ${apt.time}`,
        timestamp: apt.createdAt || new Date().toISOString(),
      }));

      setDashboardData({
        todayAppointments: todayAppointments.length,
        totalPatients,
        pendingReports: todayAppointments.filter(
          (apt) => apt.status === "pending"
        ).length,
        nextAppointment,
        recentActivities,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "appointment_confirmed":
        return "bg-soft-olive-500";
      case "appointment_pending":
        return "bg-muted-gold";
      case "patient_registered":
        return "bg-warm-pink";
      default:
        return "bg-charcoal-500";
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-warm-pink to-muted-gold rounded-lg p-4 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome to VM Mother and Child Clinic
        </h1>
        <p className="text-white/90">
          Manage appointments, patient records, and clinic operations
          efficiently.
        </p>
        {user && (
          <p className="text-white/80 text-sm mt-1">
            Logged in as: {user.firstName} {user.lastName} ({user.role})
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-light-blush border border-warm-pink-200 rounded-lg p-4">
          <p className="text-warm-pink-700 text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="mt-2 border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardTitle className="text-sm font-medium text-charcoal">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl leading-none font-bold text-warm-pink">
              {dashboardData.todayAppointments}
            </div>
            <p className="text-xs text-muted-gold">
              {dashboardData.todayAppointments === 0
                ? "No appointments today"
                : "Total for today"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-charcoal">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warm-pink">
              {dashboardData.totalPatients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-gold">Registered patients</p>
          </CardContent>
        </Card>

        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-charcoal">
              Pending Appointments
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warm-pink">
              {dashboardData.pendingReports}
            </div>
            <p className="text-xs text-muted-gold">Need confirmation</p>
          </CardContent>
        </Card>

        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-charcoal">
              Next Appointment
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warm-pink">
              {dashboardData.nextAppointment
                ? formatTime(dashboardData.nextAppointment.time)
                : "None"}
            </div>
            <p className="text-xs text-muted-gold">
              {dashboardData.nextAppointment
                ? `${dashboardData.nextAppointment.patientName} - ${dashboardData.nextAppointment.doctorName}`
                : "No upcoming appointments"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader>
            <CardTitle className="text-charcoal">Quick Actions</CardTitle>
            <CardDescription className="text-muted-gold">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button
              variant="outline"
              className="w-full justify-between border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white"
              onClick={() => (window.location.href = "/appointments")}
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Book New Appointment
              </span>
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white"
              onClick={() => (window.location.href = "/patients")}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Add New Patient
              </span>
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white"
              onClick={() => (window.location.href = "/reports")}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </span>
              <Activity className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader>
            <CardTitle className="text-charcoal">Recent Activity</CardTitle>
            <CardDescription className="text-muted-gold">
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`h-2 w-2 rounded-full mt-2 ${getActivityIcon(
                      activity.type
                    )}`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-gold">
                      {activity.details}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-gold">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Doctor Schedules */}
      <Card className="bg-off-white border-soft-olive-200">
        <CardHeader>
          <CardTitle className="text-charcoal">Doctor Schedules</CardTitle>
          <CardDescription className="text-muted-gold">
            Current week availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-light-blush p-4 rounded-lg border border-warm-pink-200">
              <h3 className="font-semibold text-charcoal mb-2">
                Dr. Maria Sarah L. Manaloto
              </h3>
              <p className="text-sm text-muted-gold mb-3">OB-GYNE Specialist</p>
              <div className="space-y-1 text-sm text-charcoal">
                <div className="flex justify-between">
                  <span>Monday:</span>
                  <span className="text-warm-pink font-medium">
                    8:00 AM - 12:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Wednesday:</span>
                  <span className="text-warm-pink font-medium">
                    9:00 AM - 2:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Friday:</span>
                  <span className="text-warm-pink font-medium">
                    1:00 PM - 5:00 PM
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-soft-olive-100 p-4 rounded-lg border border-soft-olive-300">
              <h3 className="font-semibold text-charcoal mb-2">
                Dr. Shara Laine S. Vino
              </h3>
              <p className="text-sm text-muted-gold mb-3">Pediatrician</p>
              <div className="space-y-1 text-sm text-charcoal">
                <div className="flex justify-between">
                  <span>Monday:</span>
                  <span className="text-muted-gold-700 font-medium">
                    1:00 PM - 5:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tuesday:</span>
                  <span className="text-muted-gold-700 font-medium">
                    1:00 PM - 5:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Thursday:</span>
                  <span className="text-muted-gold-700 font-medium">
                    8:00 AM - 12:00 PM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
