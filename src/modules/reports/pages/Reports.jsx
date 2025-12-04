import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner, appointmentsAPI, extractData } from '../../shared';
import React, { useState, useEffect, useMemo } from 'react';
import { Printer, Filter, Users, Globe, UserPlus, TrendingUp } from 'lucide-react';

const allDoctorNames = [
  "Dr. Maria Sarah L. Manaloto",
  "Dr. Shara Laine S. Vino",
];

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState(allDoctorNames); // Default to both doctors

  const fetchAllAppointments = async () => {
    setLoading(true);
    try {
      // Fetch all appointments with a high limit
      const response = await appointmentsAPI.getAll({ limit: 10000 });
      const data = extractData(response);
      const appointments = data.appointments || data || [];
      console.log('Fetched appointments for reports:', appointments.length);
      setAllAppointments(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAllAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = allAppointments.length;
    
    // Walk-in appointments: booked by staff (has bookedBy or bookingSource is "staff")
    const walkIns = allAppointments.filter(a => 
      a.bookingSource === "staff" || 
      (a.bookedBy && !a.patientUserId) ||
      (!a.bookingSource && a.bookedBy)
    );
    
    // Online appointments: booked through patient portal (has patientUserId or bookingSource is "patient_portal")
    const online = allAppointments.filter(a => 
      a.bookingSource === "patient_portal" || 
      (a.patientUserId && !a.bookedBy) ||
      (a.patientUserId && a.bookingSource !== "staff")
    );
    
    // Calculate percentages
    const walkInPercentage = total > 0 ? Math.round((walkIns.length / total) * 100) : 0;
    const onlinePercentage = total > 0 ? Math.round((online.length / total) * 100) : 0;

    return {
      total,
      walkIns: walkIns.length,
      online: online.length,
      walkInPercentage,
      onlinePercentage,
    };
  }, [allAppointments]);

  const getPatientName = (appointment) => {
    if (appointment.patientName) return appointment.patientName;
    if (appointment.patient?.obGyneRecord?.patientName) {
      return appointment.patient.obGyneRecord.patientName;
    }
    if (appointment.patient?.pediatricRecord?.nameOfChildren) {
      return appointment.patient.pediatricRecord.nameOfChildren;
    }
    return 'Unknown Patient';
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
                <th>Time</th>
                <th>Date</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Status</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r) => {
                    // Format date correctly to avoid timezone issues
                    let formattedDate = "";
                    if (r.appointmentDate) {
                      if (r.appointmentDate instanceof Date) {
                        const year = r.appointmentDate.getFullYear();
                        const month = r.appointmentDate.getMonth();
                        const day = r.appointmentDate.getDate();
                        formattedDate = new Date(year, month, day).toLocaleDateString();
                      } else if (typeof r.appointmentDate === "string") {
                        const datePart = r.appointmentDate.split("T")[0];
                        const [year, month, day] = datePart.split("-");
                        formattedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
                      } else {
                        formattedDate = new Date(r.appointmentDate).toLocaleDateString();
                      }
                    }
                    return `
                <tr>
                  <td>${r.appointmentTime || ""}</td>
                  <td>${formattedDate}</td>
                  <td>${r.patientName || r._patientName || ""}</td>
                  <td>${(r.serviceType || "").replace(/_/g, " ")}</td>
                  <td>${r.status || ""}</td>
                  <td>${
                    (r.contactInfo && r.contactInfo.primaryPhone) ||
                    r.contactNumber ||
                    ""
                  }</td>
                </tr>
              `;
                  }
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
    // Determine date window
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfToday = new Date(today);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Filter appointments based on mode and selected doctors
    const base = allAppointments.filter((a) => {
      // Filter by selected doctors
      if (selectedDoctors.length > 0 && !selectedDoctors.includes(a.doctorName)) {
        return false;
      }
      
      // Filter by status for no-show
      if (mode === "no-show") {
        const status = (a.status || "").toLowerCase();
        if (status !== "no-show") return false;
      }
      
      // Filter by date range
      if (mode !== "no-show") {
        // Parse appointment date correctly to avoid timezone issues
        let appointmentDate;
        if (a.appointmentDate instanceof Date) {
          appointmentDate = new Date(a.appointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);
        } else if (typeof a.appointmentDate === "string") {
          const datePart = a.appointmentDate.split("T")[0];
          const [year, month, day] = datePart.split("-");
          appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          appointmentDate = new Date(a.appointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);
        }
        
        if (mode === "day") {
          return appointmentDate >= startOfToday && appointmentDate <= endOfToday;
        }
        if (mode === "week") {
          return appointmentDate >= weekStart && appointmentDate <= weekEnd;
        }
        if (mode === "month") {
          return appointmentDate >= monthStart && appointmentDate <= monthEnd;
        }
      }
      
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

    // Group by doctor (only include selected doctors)
    const grouped = rows.reduce((acc, r) => {
      if (selectedDoctors.length === 0 || selectedDoctors.includes(r.doctorName)) {
        acc[r.doctorName] = acc[r.doctorName] || [];
        acc[r.doctorName].push(r);
      }
      return acc;
    }, {});

    // Range label
    let label;
    if (mode === "day") label = "Today";
    else if (mode === "week") label = "This Week";
    else if (mode === "month") label = "This Month";
    else if (mode === "no-show") label = "No-Show Appointments";
    else label = "All Appointments";
    
    // Check if there's any data to print
    if (Object.keys(grouped).length === 0) {
      alert(`No appointments found for ${label} with the selected doctor filter.`);
      return;
    }

    const html = buildPrintHtml(label, grouped);
    printHtml(html);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <Button onClick={() => fetchAllAppointments()} className="bg-blue-600 hover:bg-blue-700">
          Refresh
        </Button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Appointments
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {analytics.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              All time appointments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Walk-In Appointments
            </CardTitle>
            <UserPlus className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {analytics.walkIns.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {analytics.walkInPercentage}% of total • Manually added by staff
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Online Appointments
            </CardTitle>
            <Globe className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {analytics.online.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {analytics.onlinePercentage}% of total • Booked through patient portal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter by Doctor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedDoctors.length === allDoctorNames.length ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDoctors(allDoctorNames)}
              className={selectedDoctors.length === allDoctorNames.length ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Both Doctors
            </Button>
            {allDoctorNames.map((doctor) => {
              const isSelected = selectedDoctors.includes(doctor);
              return (
                <Button
                  key={doctor}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isSelected) {
                      // If clicking selected, remove it (but keep at least one)
                      if (selectedDoctors.length > 1) {
                        setSelectedDoctors(selectedDoctors.filter(d => d !== doctor));
                      }
                    } else {
                      // If clicking unselected, add it
                      setSelectedDoctors([...selectedDoctors, doctor]);
                    }
                  }}
                  className={isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {doctor.includes("Maria") ? "OB-GYNE" : "Pediatrician"}
                </Button>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Selected: {selectedDoctors.length === 0 ? "None" : selectedDoctors.join(", ")}
          </p>
        </CardContent>
      </Card>

      {/* Print Options */}
      <Card>
        <CardHeader>
          <CardTitle>Print Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              onClick={() => handlePrint("day")}
              className="flex items-center justify-center gap-2 h-20 text-lg"
            >
              <Printer className="h-5 w-5" />
              Daily
            </Button>
            <Button 
              variant="outline"
              onClick={() => handlePrint("week")}
              className="flex items-center justify-center gap-2 h-20 text-lg"
            >
              <Printer className="h-5 w-5" />
              Weekly
            </Button>
            <Button 
              variant="outline"
              onClick={() => handlePrint("month")}
              className="flex items-center justify-center gap-2 h-20 text-lg"
            >
              <Printer className="h-5 w-5" />
              Monthly
            </Button>
            <Button 
              variant="outline"
              onClick={() => handlePrint("no-show")}
              className="flex items-center justify-center gap-2 h-20 text-lg"
            >
              <Printer className="h-5 w-5" />
              All No Shows
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Data Status */}
      {!loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                <strong>Total Appointments Loaded:</strong> {allAppointments.length}
              </p>
              {allAppointments.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  No appointments found. Click Refresh to reload data.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports; 