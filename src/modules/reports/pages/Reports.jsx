import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner, appointmentsAPI, settingsAPI, extractData } from '../../shared';
import React, { useState, useEffect, useMemo } from 'react';
import { Printer, Filter, Users, Globe, UserPlus, TrendingUp, Calendar, FileText, RefreshCw } from 'lucide-react';

const allDoctorNames = [
  "Dr. Maria Sarah L. Manaloto",
  "Dr. Shara Laine S. Vino",
];

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]); // Empty = show all doctors
  const [clinicSettings, setClinicSettings] = useState(null);

  // Get dynamic doctor names from settings
  const getDoctorNames = () => {
    if (clinicSettings) {
      return [
        clinicSettings.obgyneDoctor?.name || allDoctorNames[0],
        clinicSettings.pediatrician?.name || allDoctorNames[1],
      ];
    }
    return allDoctorNames;
  };

  const dynamicDoctorNames = getDoctorNames();

  // Doctor name mapping helpers for flexible filtering
  // Maps appointment doctor names to settings doctor names and vice versa
  const mapDoctorNameToSettings = (appointmentDoctorName) => {
    if (!appointmentDoctorName || !clinicSettings) {
      return appointmentDoctorName;
    }

    // Check if appointment doctor matches OB-GYNE doctor from settings
    const obgyneSettingsName = clinicSettings.obgyneDoctor?.name;
    if (obgyneSettingsName) {
      // Check if appointment doctor name contains OB-GYNE doctor name or vice versa
      if (
        appointmentDoctorName.includes(obgyneSettingsName) ||
        obgyneSettingsName.includes(appointmentDoctorName) ||
        appointmentDoctorName.toLowerCase().includes("maria") ||
        appointmentDoctorName.toLowerCase().includes("ob") ||
        appointmentDoctorName.toLowerCase().includes("ob-gyne")
      ) {
        return obgyneSettingsName;
      }
    }

    // Check if appointment doctor matches Pediatric doctor from settings
    const pediatricSettingsName = clinicSettings.pediatrician?.name;
    if (pediatricSettingsName) {
      // Check if appointment doctor name contains Pediatric doctor name or vice versa
      if (
        appointmentDoctorName.includes(pediatricSettingsName) ||
        pediatricSettingsName.includes(appointmentDoctorName) ||
        appointmentDoctorName.toLowerCase().includes("shara") ||
        appointmentDoctorName.toLowerCase().includes("pediatric") ||
        appointmentDoctorName.toLowerCase().includes("pedia")
      ) {
        return pediatricSettingsName;
      }
    }

    // Fallback: return original name if no match found
    return appointmentDoctorName;
  };

  // Check if appointment doctor matches filter
  const matchesDoctorFilter = (appointmentDoctorName, filter) => {
    // If filter is empty array, show all (return true)
    if (!filter || filter.length === 0) {
      return true;
    }

    // If appointment has no doctor name, exclude it
    if (!appointmentDoctorName) {
      return false;
    }

    // Map appointment doctor name to settings doctor name
    const mappedName = mapDoctorNameToSettings(appointmentDoctorName);

    // Check if mapped name or original name is in filter
    return (
      filter.includes(appointmentDoctorName) ||
      filter.includes(mappedName) ||
      filter.some((filterName) => {
        const filterMapped = mapDoctorNameToSettings(filterName);
        return (
          filterMapped === mappedName ||
          appointmentDoctorName.includes(filterName) ||
          filterName.includes(appointmentDoctorName)
        );
      })
    );
  };

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
      // Suppress CanceledError (expected from request throttling)
      if (error?.code !== 'ERR_CANCELED' && error?.name !== 'CanceledError' && !error?.silent) {
        console.error('Error fetching appointments:', error);
        setAllAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAppointments();
    fetchClinicSettings();
  }, []);

  const fetchClinicSettings = async () => {
    try {
      const response = await settingsAPI.getClinicSettings();
      const data = extractData(response);
      setClinicSettings(data);
    } catch (error) {
      // Suppress CanceledError (expected from request throttling)
      if (error?.code !== 'ERR_CANCELED' && error?.name !== 'CanceledError' && !error?.silent) {
        console.error("Error fetching clinic settings:", error);
      }
      // Fallback to localStorage if API fails
      const savedSettings = localStorage.getItem("clinic_settings");
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setClinicSettings(settings);
        } catch (e) {
          console.error("Error parsing localStorage settings:", e);
        }
      }
    }
  };

  // Calculate analytics - filter by selected doctors
  const analytics = useMemo(() => {
    // Get filtered appointments based on selected doctors
    const doctorsToFilter = selectedDoctors.length === 0 ? getDoctorNames() : selectedDoctors;
    const filteredAppointments = allAppointments.filter(a => 
      matchesDoctorFilter(a.doctorName, doctorsToFilter)
    );
    
    const total = filteredAppointments.length;
    
    // Walk-in appointments: booked by staff (has bookedBy or bookingSource is "staff")
    const walkIns = filteredAppointments.filter(a => 
      a.bookingSource === "staff" || 
      (a.bookedBy && !a.patientUserId) ||
      (!a.bookingSource && a.bookedBy)
    );
    
    // Online appointments: booked through patient portal (has patientUserId or bookingSource is "patient_portal")
    const online = filteredAppointments.filter(a => 
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAppointments, selectedDoctors, clinicSettings]);

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
    const clinicName = clinicSettings?.clinicName || "VM Mother and Child Clinic";
    const clinicAddress = clinicSettings?.address || "";
    const clinicPhone = clinicSettings?.phone || "";
    const clinicEmail = clinicSettings?.email || "";
    
    const styles = `
      <style>
        @page {
          size: A4;
          margin: 50px 15mm 45px 15mm;
        }
        * {
          box-sizing: border-box;
        }
        body { 
          font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; 
          padding: 0;
          color: #000000; 
          margin: 0;
          width: 210mm;
          min-height: 297mm;
        }
        .print-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 50px;
          background: white;
          border-bottom: 2px solid #000000;
          padding: 8px 15mm;
          margin: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
        }
        .print-header .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        }
        .print-header .clinic-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .print-header .clinic-icon {
          width: 40px;
          height: 40px;
          background: white;
          border: 1px solid #000000;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          flex-shrink: 0;
        }
        .print-header .clinic-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 6px;
        }
        .print-header .clinic-details {
          flex: 1;
          min-width: 0;
        }
        .print-header h1 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 2px 0;
          color: #000000;
          letter-spacing: -0.3px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .print-header .clinic-info {
          font-size: 9px;
          color: #000000;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          line-height: 1.3;
        }
        .print-header .clinic-info-item {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .print-header .report-badge {
          background: white;
          color: #000000;
          border: 1px solid #000000;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .print-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 45px;
          background: white;
          border-top: 2px solid #000000;
          padding: 6px 15mm;
          font-size: 9px;
          color: #000000;
          text-align: center;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-footer .footer-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 100%;
        }
        .print-footer .footer-main {
          font-weight: 600;
          color: #000000;
          font-size: 10px;
          line-height: 1.2;
        }
        .print-footer .footer-secondary {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          color: #000000;
          font-size: 8px;
          line-height: 1.2;
        }
        .print-footer .footer-divider {
          color: #000000;
        }
        .print-footer .page-info {
          background: white;
          border: 1px solid #000000;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
          color: #000000;
        }
        .print-content {
          margin-top: 50px;
          margin-bottom: 45px;
          padding: 0 15mm;
          min-height: calc(297mm - 95px);
        }
        h2 { 
          font-size: 14px; 
          margin: 12px 0 6px 0;
          color: #000000;
          font-weight: 600;
          page-break-after: avoid;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 6px;
          margin-bottom: 12px;
          font-size: 9px;
        }
        th, td { 
          border: 1px solid #000000; 
          padding: 5px 8px; 
          font-size: 9px;
          text-align: left;
          line-height: 1.3;
        }
        th { 
          background: #ffffff; 
          border: 2px solid #000000;
          font-weight: 600;
          font-size: 9px;
        }
        .muted { color: #000000; }
        .summary { 
          margin-top: 4px; 
          font-size: 9px;
          color: #000000;
          line-height: 1.4;
        }
        .no-show { 
          color: #000000; 
          font-weight: 600; 
        }
        .range-label {
          font-size: 12px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 8px;
          page-break-after: avoid;
        }
        section {
          page-break-inside: avoid;
          margin-bottom: 16px;
        }
        @media print {
          @page {
            size: A4;
            margin: 50px 15mm 45px 15mm;
          }
          body {
            width: 210mm;
            min-height: 297mm;
          }
          .print-header, .print-footer {
            position: fixed;
          }
          .print-content {
            margin-top: 50px;
            margin-bottom: 45px;
          }
          table { 
            page-break-inside: avoid;
            font-size: 9px;
          }
          section { 
            page-break-inside: avoid;
            page-break-after: auto;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      </style>`;

    const printHeader = `
      <div class="print-header">
        <div class="header-content">
          <div class="clinic-brand">
            <div class="clinic-icon">
              <img src="/221.jpg" alt="${clinicName} Logo" />
            </div>
            <div class="clinic-details">
              <h1>${clinicName}</h1>
              <div class="clinic-info">
                ${clinicAddress ? `<span class="clinic-info-item">📍 ${clinicAddress}</span>` : ""}
                ${clinicPhone ? `<span class="clinic-info-item">📞 ${clinicPhone}</span>` : ""}
                ${clinicEmail ? `<span class="clinic-info-item">✉️ ${clinicEmail}</span>` : ""}
              </div>
            </div>
          </div>
          <div class="report-badge">${rangeLabel} Report</div>
        </div>
      </div>`;

    const printFooter = `
      <div class="print-footer">
        <div class="footer-content">
          <div class="footer-main">
            📋 Appointments Report: ${rangeLabel}
          </div>
          <div class="footer-secondary">
            <span>🕒 Printed on ${new Date().toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "long", 
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}</span>
            <span class="footer-divider">•</span>
            <span>${clinicName}</span>
            <span class="footer-divider">•</span>
            <span class="page-info">Page <span class="page-number"></span></span>
          </div>
        </div>
      </div>`;

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
                      } else                   if (typeof r.appointmentDate === "string") {
                    const datePart = r.appointmentDate.split("T")[0];
                    const [year, month, day] = datePart.split("-");
                    if (year && month && day) {
                      formattedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      });
                    }
                  } else {
                    formattedDate = new Date(r.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
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

    const content = `
      <div class="print-content">
        <div class="range-label">Appointments Report: ${rangeLabel}</div>
        ${sections}
      </div>`;

    return `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>${clinicName} - Appointments Report</title>
          ${styles}
          <script>
            window.onload = function() {
              // Update page numbers
              const pageNumbers = document.querySelectorAll('.page-number');
              pageNumbers.forEach((el, idx) => {
                el.textContent = (idx + 1);
              });
            };
          </script>
        </head>
        <body>
          ${printHeader}
          ${content}
          ${printFooter}
        </body>
      </html>`;
  };

  const handlePrint = (mode) => {
    // Determine date window
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfToday = new Date(today);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    weekStart.setDate(today.getDate() - dayOfWeek); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Saturday
    weekEnd.setHours(23, 59, 59, 999);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Filter appointments based on mode and selected doctors
    // Use dynamic doctor names for filtering
    const doctorsToFilter = selectedDoctors.length === 0 ? getDoctorNames() : selectedDoctors;
    
    const base = allAppointments.filter((a) => {
      // Filter by selected doctors - use flexible matching
      if (!matchesDoctorFilter(a.doctorName, doctorsToFilter)) {
        return false;
      }
      
      // Filter by status for status-based reports (no-show, cancelled, completed)
      if (mode === "no-show") {
        const status = (a.status || "").toLowerCase();
        if (status !== "no-show") return false;
      } else if (mode === "cancelled") {
        const status = (a.status || "").toLowerCase();
        if (status !== "cancelled") return false;
      } else if (mode === "completed") {
        const status = (a.status || "").toLowerCase();
        if (status !== "completed") return false;
      }
      
      // Filter by date range for date-based reports (day, week, month)
      if (mode === "day" || mode === "week" || mode === "month") {
        // Parse appointment date correctly to avoid timezone issues
        if (!a.appointmentDate) return false;
        
        let appointmentDate;
        try {
          if (a.appointmentDate instanceof Date) {
            appointmentDate = new Date(a.appointmentDate);
            if (isNaN(appointmentDate.getTime())) return false;
            appointmentDate.setHours(0, 0, 0, 0);
          } else if (typeof a.appointmentDate === "string") {
            const datePart = a.appointmentDate.split("T")[0];
            const [year, month, day] = datePart.split("-");
            if (!year || !month || !day) return false;
            appointmentDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
            if (isNaN(appointmentDate.getTime())) return false;
          } else {
            appointmentDate = new Date(a.appointmentDate);
            if (isNaN(appointmentDate.getTime())) return false;
            appointmentDate.setHours(0, 0, 0, 0);
          }
        } catch (error) {
          return false;
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

    // Group by doctor (only include selected doctors) - use flexible matching
    const grouped = rows.reduce((acc, r) => {
      // Map appointment doctor name to settings doctor name for matching
      const mappedDoctorName = mapDoctorNameToSettings(r.doctorName);
      
      // Check if this doctor should be included
      const shouldInclude = doctorsToFilter.length === 0 || 
        doctorsToFilter.some(selectedDoc => {
          const mappedSelected = mapDoctorNameToSettings(selectedDoc);
          return mappedDoctorName === mappedSelected || 
                 r.doctorName === selectedDoc ||
                 selectedDoc === mappedDoctorName ||
                 matchesDoctorFilter(r.doctorName, [selectedDoc]);
        });
      
      if (shouldInclude) {
        // Use the original doctor name as key
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
    else if (mode === "cancelled") label = "Cancelled Appointments";
    else if (mode === "completed") label = "Completed Appointments";
    else label = "All Appointments";
    
    // Check if there's any data to print
    if (Object.keys(grouped).length === 0) {
      alert(`No appointments found for ${label} with the selected filters.`);
      return;
    }

    const html = buildPrintHtml(label, grouped);
    printHtml(html);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">View appointment statistics and generate printable reports</p>
        </div>
        <Button 
          onClick={() => fetchAllAppointments()} 
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
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
              {selectedDoctors.length === 0 ? 'All doctors' : `${selectedDoctors.length} doctor(s) selected`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
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
              {analytics.walkInPercentage}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
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
              {analytics.onlinePercentage}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Print Options - Combined Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Reports
            </CardTitle>
            {!loading && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {allAppointments.length.toLocaleString()} appointments loaded
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Doctor Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Doctor
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedDoctors.length === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDoctors([])}
                className={selectedDoctors.length === 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
              >
                Both Doctors
              </Button>
              {dynamicDoctorNames.map((doctor) => {
                const isSelected = selectedDoctors.length > 0 && selectedDoctors.some(selectedDoc => {
                  return selectedDoc === doctor || 
                         mapDoctorNameToSettings(selectedDoc) === doctor ||
                         mapDoctorNameToSettings(doctor) === selectedDoc;
                });
                
                return (
                  <Button
                    key={doctor}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (selectedDoctors.length === 0) {
                        setSelectedDoctors([doctor]);
                      } else if (isSelected) {
                        const newSelected = selectedDoctors.filter(d => {
                          const mappedD = mapDoctorNameToSettings(d);
                          const mappedDoctor = mapDoctorNameToSettings(doctor);
                          return mappedD !== mappedDoctor && d !== doctor;
                        });
                        setSelectedDoctors(newSelected.length === 0 ? [] : newSelected);
                      } else {
                        setSelectedDoctors([...selectedDoctors, doctor]);
                      }
                    }}
                    className={isSelected ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                  >
                    {doctor.includes("Maria") || doctor.toLowerCase().includes("ob") ? "OB-GYNE" : "Pediatrician"}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4">
            {/* Time-based Reports */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Time-Based Reports
              </label>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handlePrint("day")}
                  className="flex items-center justify-center gap-2 h-14 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Printer className="h-4 w-4" />
                  <span>Today</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrint("week")}
                  className="flex items-center justify-center gap-2 h-14 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Printer className="h-4 w-4" />
                  <span>This Week</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrint("month")}
                  className="flex items-center justify-center gap-2 h-14 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Printer className="h-4 w-4" />
                  <span>This Month</span>
                </Button>
              </div>
            </div>

            {/* Status-based Reports */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Status-Based Reports
              </label>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handlePrint("no-show")}
                  className="flex items-center justify-center gap-2 h-14 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                >
                  <Printer className="h-4 w-4" />
                  <span>No-Shows</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrint("cancelled")}
                  className="flex items-center justify-center gap-2 h-14 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cancelled</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrint("completed")}
                  className="flex items-center justify-center gap-2 h-14 border-green-200 hover:bg-green-50 hover:border-green-300"
                >
                  <Printer className="h-4 w-4" />
                  <span>Completed</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Loading appointments...</span>
        </div>
      )}

      {!loading && allAppointments.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No appointments found</p>
              <p className="text-sm text-gray-500 mb-4">Click Refresh to reload appointments</p>
              <Button onClick={() => fetchAllAppointments()} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports; 