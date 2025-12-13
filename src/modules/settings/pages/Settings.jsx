import { Card, CardContent, CardHeader, CardTitle, Button, Input, useAuth, authAPI, settingsAPI, handleAPIError, extractData, toast } from '../../shared';
import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Clinic settings state
  const [clinicSettings, setClinicSettings] = useState({
    clinicName: 'VM Mother and Child Clinic',
    obgyneDoctor: {
      name: 'Dr. Maria Sarah L. Manaloto',
      hours: {
        monday: { start: '08:00', end: '12:00', enabled: true },
        wednesday: { start: '09:00', end: '14:00', enabled: true },
        friday: { start: '13:00', end: '17:00', enabled: true },
        tuesday: { start: '', end: '', enabled: false },
        thursday: { start: '', end: '', enabled: false },
        saturday: { start: '', end: '', enabled: false },
        sunday: { start: '', end: '', enabled: false }
      }
    },
    pediatrician: {
      name: 'Dr. Shara Laine S. Vino',
      hours: {
        monday: { start: '13:00', end: '17:00', enabled: true },
        tuesday: { start: '13:00', end: '17:00', enabled: true },
        thursday: { start: '08:00', end: '12:00', enabled: true },
        wednesday: { start: '', end: '', enabled: false },
        friday: { start: '', end: '', enabled: false },
        saturday: { start: '', end: '', enabled: false },
        sunday: { start: '', end: '', enabled: false }
      }
    }
  });
  const [clinicLoading, setClinicLoading] = useState(false);
  const [clinicMessage, setClinicMessage] = useState('');

  // Load clinic settings from API or localStorage on mount
  useEffect(() => {
    const loadClinicSettings = async () => {
      try {
        // Try to load from API first
        const response = await settingsAPI.getClinicSettings();
        const data = extractData(response);
        if (data) {
          setClinicSettings(data);
          // Also save to localStorage as backup
          localStorage.setItem('clinic_settings', JSON.stringify(data));
          return;
        }
      } catch (apiError) {
        console.log('API endpoint not available, trying localStorage');
      }
      
      // Fallback to localStorage if API fails
      const savedSettings = localStorage.getItem('clinic_settings');
      if (savedSettings) {
        try {
          setClinicSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Error loading clinic settings:', error);
        }
      }
    };
    
    loadClinicSettings();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    try {
      await authAPI.updateProfile(profileData);
      // Fetch latest profile and update global user state
      const response = await authAPI.getProfile();
      const userData = response.data?.data?.user || response.data?.user;
      updateUser(userData);
      setProfileMessage('Profile updated successfully');
    } catch (error) {
      setProfileMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const renderProfileAndPassword = () => (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Profile Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Information</h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <Input
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <Input
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <Input
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              {profileMessage && (
                <div className={`p-3 rounded-md text-sm ${
                  profileMessage.includes('success')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {profileMessage}
                </div>
              )}
              <Button type="submit" disabled={profileLoading} className="bg-blue-600 hover:bg-blue-700">
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Change Password */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleClinicSettingsChange = (doctorType, field, value) => {
    setClinicSettings(prev => ({
      ...prev,
      [doctorType]: {
        ...prev[doctorType],
        [field]: value
      }
    }));
  };

  const handleDoctorHoursChange = (doctorType, day, field, value) => {
    setClinicSettings(prev => ({
      ...prev,
      [doctorType]: {
        ...prev[doctorType],
        hours: {
          ...prev[doctorType].hours,
          [day]: {
            ...prev[doctorType].hours[day],
            [field]: value
          }
        }
      }
    }));
  };

  const handleClinicSettingsSave = async (e) => {
    e.preventDefault();
    setClinicLoading(true);
    setClinicMessage('');
    
    try {
      // Save to localStorage for now (can be replaced with API call later)
      localStorage.setItem('clinic_settings', JSON.stringify(clinicSettings));
      
      // Try to save via API if endpoint exists
      try {
        await settingsAPI.updateClinicSettings(clinicSettings);
      } catch (apiError) {
        // API might not be implemented yet, that's okay
        console.log('API endpoint not available, saved to localStorage');
      }
      
      // Dispatch custom event to notify other components of settings update
      window.dispatchEvent(new Event('clinicSettingsUpdated'));
      
      setClinicMessage('Clinic settings saved successfully');
      toast.success('Clinic settings saved successfully');
    } catch (error) {
      const errorMsg = handleAPIError(error) || 'Failed to save clinic settings';
      setClinicMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setClinicLoading(false);
    }
  };

  const formatTimeForDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const renderDoctorHours = (doctorType, doctorData) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayAbbr = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
        {days.map(day => (
          <div key={day} className="flex items-center gap-2 p-2 border rounded">
            <input
              type="checkbox"
              checked={doctorData.hours[day].enabled}
              onChange={(e) => handleDoctorHoursChange(doctorType, day, 'enabled', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700 w-20">{dayAbbr[day]}</span>
            {doctorData.hours[day].enabled ? (
              <>
                <Input
                  type="time"
                  value={doctorData.hours[day].start}
                  onChange={(e) => handleDoctorHoursChange(doctorType, day, 'start', e.target.value)}
                  className="flex-1"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="time"
                  value={doctorData.hours[day].end}
                  onChange={(e) => handleDoctorHoursChange(doctorType, day, 'end', e.target.value)}
                  className="flex-1"
                />
              </>
            ) : (
              <span className="text-sm text-gray-400 flex-1">Not available</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderClinicInformation = () => (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleClinicSettingsSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
            <Input
              value={clinicSettings.clinicName}
              onChange={(e) => setClinicSettings(prev => ({ ...prev, clinicName: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            {/* OB-GYNE Doctor */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OB-GYNE Doctor</label>
                <Input
                  value={clinicSettings.obgyneDoctor.name}
                  onChange={(e) => handleClinicSettingsChange('obgyneDoctor', 'name', e.target.value)}
                  required
                  placeholder="Doctor name"
                />
              </div>
              {renderDoctorHours('obgyneDoctor', clinicSettings.obgyneDoctor)}
            </div>

            {/* Pediatrician */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pediatrician</label>
                <Input
                  value={clinicSettings.pediatrician.name}
                  onChange={(e) => handleClinicSettingsChange('pediatrician', 'name', e.target.value)}
                  required
                  placeholder="Doctor name"
                />
              </div>
              {renderDoctorHours('pediatrician', clinicSettings.pediatrician)}
            </div>
          </div>

          {clinicMessage && (
            <div className={`p-3 rounded-md text-sm ${
              clinicMessage.includes('success')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {clinicMessage}
            </div>
          )}

          <Button type="submit" disabled={clinicLoading} className="bg-blue-600 hover:bg-blue-700">
            {clinicLoading ? 'Saving...' : 'Save Clinic Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderProfileOverview = () => {
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not set';
    const username = user?.username || 'Not set';
    const role = user?.role || 'Admin';
    const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
    const email = user?.email || 'Not set';

    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-blue-200">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
                <p className="text-sm text-gray-600">@{username}</p>
              </div>
              <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                {role.toUpperCase()}
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Full Name</p>
                  <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Username</p>
                  <p className="text-sm font-semibold text-gray-900">@{username}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900">{createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSystemInformation = () => (
    <Card>
      <CardHeader>
        <CardTitle>System Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System Version</label>
            <p className="text-sm text-gray-600">VM Clinic v1.0.0</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Bento Grid Layout */}
      <div className="space-y-6">
        {/* Profile Overview */}
        {renderProfileOverview()}

        {/* Account Settings and Clinic Information - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderProfileAndPassword()}
          {renderClinicInformation()}
        </div>

        {/* System Information - At bottom */}
        <div>
          {renderSystemInformation()}
        </div>
      </div>
    </div>
  );
};

export default Settings; 