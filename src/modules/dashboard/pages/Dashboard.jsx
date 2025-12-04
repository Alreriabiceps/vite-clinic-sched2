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
import { Calendar, Users, FileText, Clock, Activity } from "lucide-react";
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
        recentAppointmentsResponse,
      ] = await Promise.all([
        reportsAPI.getDashboardAnalytics().catch(() => ({ data: {} })),
        appointmentsAPI
          .getAll({ date: today, limit: 100 })
          .catch(() => ({ data: { appointments: [] } })),
        patientsAPI
          .search({ limit: 1 })
          .catch(() => ({ data: { pagination: { total: 0 } } })),
        // Fetch recent appointments (limit 50 to get enough data, then we'll take top 5)
        appointmentsAPI
          .getAll({ limit: 50 })
          .catch((err) => {
            console.error('Error fetching recent appointments:', err);
            return { data: { appointments: [] } };
          }),
      ]);

      const todayAppointments =
        todayAppointmentsResponse.data?.appointments || [];
      const totalPatients = patientsStatsResponse.data?.pagination?.total || 0;
      
      // Handle different possible response structures
      let recentAppointments = [];
      if (recentAppointmentsResponse?.data?.data?.appointments) {
        recentAppointments = recentAppointmentsResponse.data.data.appointments;
      } else if (recentAppointmentsResponse?.data?.appointments) {
        recentAppointments = recentAppointmentsResponse.data.appointments;
      } else if (Array.isArray(recentAppointmentsResponse?.data)) {
        recentAppointments = recentAppointmentsResponse.data;
      }
      
      console.log('Recent appointments fetched:', recentAppointments.length);

      // Find next appointment
      const now = new Date();
      const upcomingAppointments = todayAppointments
        .filter((apt) => {
          const aptDate = apt.appointmentDate;
          const aptTime = apt.appointmentTime;
          if (!aptDate || !aptTime) return false;
          // Convert appointmentTime from "HH:MM AM/PM" to 24-hour format for comparison
          const dateStr = new Date(aptDate).toISOString().split('T')[0];
          const timeStr = aptTime;
          // Create a proper date object
          const [time, period] = timeStr.split(' ');
          const [hours, minutes] = time.split(':');
          let hour24 = parseInt(hours);
          if (period === 'PM' && hour24 !== 12) hour24 += 12;
          if (period === 'AM' && hour24 === 12) hour24 = 0;
          const aptDateTime = new Date(aptDate);
          aptDateTime.setHours(hour24, parseInt(minutes), 0, 0);
          return aptDateTime > now && apt.status === "confirmed";
        })
        .sort((a, b) => {
          const dateA = new Date(a.appointmentDate);
          const dateB = new Date(b.appointmentDate);
          return dateA - dateB;
        });

      const nextAppointment = upcomingAppointments[0] || null;

      // Build activity feed from appointments only
      const activities = [];

      // Add appointment activities
      recentAppointments.forEach((apt) => {
        if (!apt) return;
        
        // Extract patient name from various possible sources
        let patientName = apt.patientName;
        if (!patientName && apt.patient) {
          if (typeof apt.patient === 'object') {
            if (apt.patient.pediatricRecord?.nameOfChildren) {
              patientName = apt.patient.pediatricRecord.nameOfChildren;
            } else if (apt.patient.obGyneRecord?.patientName) {
              patientName = apt.patient.obGyneRecord.patientName;
            }
          }
        }
        patientName = patientName || 'Unknown Patient';

        const serviceType = apt.serviceType || 'Consultation';
        // Use updatedAt for status changes, createdAt for new appointments
        const timestamp = apt.updatedAt || apt.createdAt || new Date().toISOString();
        
        let activityType = 'appointment_pending';
        let message = '';

        switch (apt.status) {
          case 'completed':
            activityType = 'appointment_completed';
            message = 'Appointment completed';
            break;
          case 'confirmed':
            activityType = 'appointment_confirmed';
            message = 'Appointment confirmed';
            break;
          case 'scheduled':
            activityType = 'appointment_scheduled';
            message = 'Appointment scheduled';
            break;
          case 'cancelled':
            activityType = 'appointment_cancelled';
            message = 'Appointment cancelled';
            break;
          default:
            activityType = 'appointment_pending';
            message = 'New appointment';
        }

        // Format service type for display
        const serviceDisplay = serviceType
          .split('_')
          .map(word => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ');

        activities.push({
          type: activityType,
          message: message,
          details: `${patientName} - ${serviceDisplay}`,
          timestamp: timestamp,
        });
      });

      // Sort activities by timestamp (most recent first) and limit to 5
      const recentActivities = activities
        .sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB - dateA; // Most recent first
        })
        .slice(0, 5)
        .map(activity => ({
          ...activity,
          formattedTime: formatActivityTime(activity.timestamp),
        }));
      
      console.log('Activities created:', activities.length);
      console.log('Recent activities (top 5):', recentActivities.length);

      setDashboardData({
        todayAppointments: todayAppointments.length,
        totalPatients,
        pendingReports: todayAppointments.filter(
          (apt) => apt.status === "pending" || apt.status === "scheduled"
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

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // Format as date
    return activityTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: activityTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    // Handle both "HH:MM AM/PM" and "HH:MM" formats
    if (time.includes('AM') || time.includes('PM')) {
      return time; // Already in correct format
    }
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
      case "appointment_completed":
        return "bg-green-500";
      case "appointment_scheduled":
        return "bg-blue-500";
      case "appointment_cancelled":
        return "bg-red-500";
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-1">Dashboard</h1>
        <p className="text-muted-gold">
          Welcome back, {user?.firstName || 'Admin'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
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
                ? formatTime(dashboardData.nextAppointment.appointmentTime || dashboardData.nextAppointment.time)
                : "None"}
            </div>
            <p className="text-xs text-muted-gold">
              {dashboardData.nextAppointment
                ? `${dashboardData.nextAppointment.patientName || 'Patient'} - ${dashboardData.nextAppointment.doctorName || 'Doctor'}`
                : "No upcoming appointments"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-off-white border-soft-olive-200">
        <CardHeader>
          <CardTitle className="text-charcoal">Recent Activity</CardTitle>
          <CardDescription className="text-muted-gold">
            Latest actions in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-soft-olive-200 last:border-0 last:pb-0">
                <div
                  className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${getActivityIcon(
                    activity.type
                  )}`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-gold mt-1">
                    {activity.details}
                  </p>
                  {activity.formattedTime && (
                    <p className="text-xs text-muted-gold/70 mt-0.5">
                      {activity.formattedTime}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-gold">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
