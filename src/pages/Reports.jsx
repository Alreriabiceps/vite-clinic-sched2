import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { reportsAPI } from '../lib/api';
import { formatDate, getStatusColor } from '../lib/utils';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const doctors = [
    'Dr. Maria Sarah L. Manaloto',
    'Dr. Shara Laine S. Vino'
  ];

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      let response;
      const params = {
        date: selectedDate,
        doctorName: selectedDoctor || undefined
      };

      switch (type) {
        case 'daily':
          response = await reportsAPI.getDailyReport(params);
          break;
        case 'weekly':
          response = await reportsAPI.getWeeklyReport({ 
            startDate: selectedDate, 
            doctorName: selectedDoctor || undefined 
          });
          break;
        case 'monthly':
          response = await reportsAPI.getMonthlyReport({ 
            month: selectedDate.substring(0, 7), 
            doctorName: selectedDoctor || undefined 
          });
          break;
        case 'dashboard':
          response = await reportsAPI.getDashboardAnalytics();
          break;
        default:
          break;
      }
      
      setReportData(response.data.data);
    } catch (error) {
      console.error(`Error fetching ${type} report:`, error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab, selectedDate, selectedDoctor]);

  const StatCard = ({ title, value, subtitle, color = "blue" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDailyReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Appointments" value={reportData.statistics?.total || 0} />
          <StatCard title="Completed" value={reportData.statistics?.completed || 0} color="green" />
          <StatCard title="Cancelled" value={reportData.statistics?.cancelled || 0} color="red" />
          <StatCard title="Pediatric" value={reportData.statistics?.pediatric || 0} color="purple" />
        </div>

        {/* Doctor Breakdown */}
        {reportData.statistics?.doctorBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle>Doctor Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(reportData.statistics.doctorBreakdown).map(([doctor, count]) => (
                  <div key={doctor} className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">{doctor}</span>
                    <span className="text-blue-600 font-semibold">{count} appointments</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments for {formatDate(reportData.date)}</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.appointments?.length > 0 ? (
              <div className="space-y-2">
                {reportData.appointments.map((appointment) => (
                  <div key={appointment._id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {appointment.patient?.pediatricRecord?.nameOfChildren || 
                         appointment.patient?.obGyneRecord?.patientName || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.appointmentTime} - {appointment.serviceType}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{appointment.doctorName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No appointments found for this date.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWeeklyReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Appointments" value={reportData.statistics?.total || 0} />
          <StatCard title="Completed" value={reportData.statistics?.completed || 0} color="green" />
          <StatCard title="Cancelled" value={reportData.statistics?.cancelled || 0} color="red" />
          <StatCard title="No Shows" value={reportData.statistics?.noShow || 0} color="orange" />
        </div>

        {/* Daily Breakdown */}
        {reportData.dailyBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Breakdown ({reportData.weekStart} to {reportData.weekEnd})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(reportData.dailyBreakdown).map(([day, data]) => (
                  <div key={day} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="font-medium">{day}</span>
                    <div className="flex space-x-4 text-sm">
                      <span>Total: {data.total}</span>
                      <span className="text-green-600">Completed: {data.completed}</span>
                      <span className="text-red-600">Cancelled: {data.cancelled}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderDashboard = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Today's Appointments" value={reportData.today?.total || 0} />
          <StatCard title="This Week" value={reportData.thisWeek?.total || 0} color="green" />
          <StatCard title="This Month" value={reportData.thisMonth?.total || 0} color="blue" />
          <StatCard title="Total Patients" value={reportData.totalPatients || 0} color="purple" />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.recentAppointments?.map((appointment) => (
                <div key={appointment._id} className="flex justify-between items-center p-3 border-b">
                  <div>
                    <p className="font-medium">
                      {appointment.patient?.pediatricRecord?.nameOfChildren || 
                       appointment.patient?.obGyneRecord?.patientName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <Button onClick={() => fetchReport(activeTab)} className="bg-blue-600 hover:bg-blue-700">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <div className="flex space-x-2">
                {['daily', 'weekly', 'monthly', 'dashboard'].map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'default' : 'outline'}
                    onClick={() => setActiveTab(tab)}
                    className="capitalize"
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </div>

            {activeTab !== 'dashboard' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Doctors</option>
                    {doctors.map((doctor) => (
                      <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {activeTab === 'daily' && renderDailyReport()}
          {activeTab === 'weekly' && renderWeeklyReport()}
          {activeTab === 'monthly' && renderDailyReport()} {/* Reuse daily layout for monthly */}
          {activeTab === 'dashboard' && renderDashboard()}
        </>
      )}
    </div>
  );
};

export default Reports; 