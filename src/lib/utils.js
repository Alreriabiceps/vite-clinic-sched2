import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, format = 'MMM dd, yyyy') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  if (format === 'MMM dd, yyyy') {
    return `${month} ${day.toString().padStart(2, '0')}, ${year}`;
  }
  
  if (format === 'yyyy-MM-dd') {
    return `${year}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
  
  return d.toLocaleDateString();
}

export function formatTime(time) {
  if (!time) return '';
  return time;
}

export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return `${formatDate(d)} at ${d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })}`;
}

export function getAppointmentStatusColor(status) {
  const colors = {
    scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    'no-show': 'bg-gray-100 text-gray-800 border-gray-200',
    rescheduled: 'bg-purple-100 text-purple-800 border-purple-200'
  };
  
  return colors[status] || colors.scheduled;
}

// Alias for getAppointmentStatusColor
export const getStatusColor = getAppointmentStatusColor;

export function getDoctorTypeColor(type) {
  const colors = {
    'ob-gyne': 'bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200',
    'pediatric': 'bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200'
  };
  
  return colors[type] || colors.pediatric;
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getPatientDisplayName(patient) {
  if (!patient) return 'Unknown Patient';
  
  if (patient.patientType === 'pediatric') {
    return patient.pediatricRecord?.nameOfChildren || 'Pediatric Patient';
  } else if (patient.patientType === 'ob-gyne') {
    return patient.obGyneRecord?.patientName || 'OB-GYNE Patient';
  }
  
  return 'Unknown Patient';
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function generateTimeSlots(startTime, endTime, interval = 30) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    
    let displayHour = hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    if (hour > 12) displayHour = hour - 12;
    if (hour === 0) displayHour = 12;
    
    const timeString = `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`;
    slots.push(timeString);
  }
  
  return slots;
}

export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function calculateAge(birthDate) {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (isNaN(birth.getTime())) return null;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
} 