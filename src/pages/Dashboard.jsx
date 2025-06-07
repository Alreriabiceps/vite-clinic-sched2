import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Users, FileText, Clock, Activity, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { reportsAPI, appointmentsAPI, patientsAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/loading-spinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingReports: 0,
    nextAppointment: null,
    recentActivities: [],
    loading: true
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch dashboard analytics
      const [
        dashboardResponse,
        todayAppointmentsResponse,
        patientsStatsResponse
      ] = await Promise.all([
        reportsAPI.getDashboardAnalytics().catch(() => ({ data: {} })),
        appointmentsAPI.getAll({ date: today, limit: 100 }).catch(() => ({ data: { appointments: [] } })),
        patientsAPI.search({ limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } }))
      ]);

      const todayAppointments = todayAppointmentsResponse.data?.appointments || [];
      const totalPatients = patientsStatsResponse.data?.pagination?.total || 0;

      // Find next appointment
      const now = new Date();
      const upcomingAppointments = todayAppointments
        .filter(apt => {
          const aptDateTime = new Date(`${apt.date}T${apt.time}`);
          return aptDateTime > now && apt.status === 'confirmed';
        })
        .sort((a, b) => {
          const timeA = new Date(`${a.date}T${a.time}`);
          const timeB = new Date(`${b.date}T${b.time}`);
          return timeA - timeB;
        });

      const nextAppointment = upcomingAppointments[0] || null;

      // Generate recent activities from appointments
      const recentActivities = todayAppointments
        .slice(0, 3)
        .map(apt => ({
          type: apt.status === 'confirmed' ? 'appointment_confirmed' : 'appointment_pending',
          message: `${apt.status === 'confirmed' ? 'Appointment confirmed' : 'New appointment'}`,
          details: `Patient: ${apt.patientName} - ${apt.time}`,
          timestamp: apt.createdAt || new Date().toISOString()
        }));

      setDashboardData({
        todayAppointments: todayAppointments.length,
        totalPatients,
        pendingReports: todayAppointments.filter(apt => apt.status === 'pending').length,
        nextAppointment,
        recentActivities,
        loading: false
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment_confirmed':
        return 'bg-green-500';
      case 'appointment_pending':
        return 'bg-yellow-500';
      case 'patient_registered':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-clinic-600 to-medical-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to VM Mother and Child Clinic</h1>
        <p className="text-clinic-100">
          Manage appointments, patient records, and clinic operations efficiently.
        </p>
        {user && (
          <p className="text-clinic-200 text-sm mt-2">
            Logged in as: {user.firstName} {user.lastName} ({user.role})
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.todayAppointments === 0 ? 'No appointments today' : 'Total for today'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Registered patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Need confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.nextAppointment ? formatTime(dashboardData.nextAppointment.time) : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.nextAppointment 
                ? `${dashboardData.nextAppointment.patientName} - ${dashboardData.nextAppointment.doctorName}` 
                : 'No upcoming appointments'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.location.href = '/appointments'}
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Book New Appointment
              </span>
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.location.href = '/patients'}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Add New Patient
              </span>
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.location.href = '/reports'}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </span>
              <Activity className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${getActivityIcon(activity.type)}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Doctor Schedules */}
      <Card>
        <CardHeader>
          <CardTitle>Doctor Schedules</CardTitle>
          <CardDescription>
            Current week availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="doctor-card-ob-gyne p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Dr. Maria Sarah L. Manaloto</h3>
              <p className="text-sm text-gray-600 mb-3">OB-GYNE Specialist</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Monday:</span>
                  <span>8:00 AM - 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Wednesday:</span>
                  <span>9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday:</span>
                  <span>1:00 PM - 5:00 PM</span>
                </div>
              </div>
            </div>

            <div className="doctor-card-pediatric p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Dr. Shara Laine S. Vino</h3>
              <p className="text-sm text-gray-600 mb-3">Pediatrician</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Monday:</span>
                  <span>1:00 PM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Tuesday:</span>
                  <span>1:00 PM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Thursday:</span>
                  <span>8:00 AM - 12:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 