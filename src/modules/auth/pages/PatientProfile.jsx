import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, LoadingSpinner, usePatientAuth, toast } from '../../shared';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ArrowLeft,
  Stethoscope,
  Baby,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
export default function PatientProfile() {
  const navigate = useNavigate();
  const { patient, updateProfile, changePassword, loading: authLoading } = usePatientAuth();
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      province: '',
      zipCode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    }
  });
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [activeTab, setActiveTab] = useState('profile'); // profile, password

  useEffect(() => {
    if (!patient && !authLoading) {
      navigate('/patient/login');
      return;
    }

    if (patient) {
      // Populate form with current patient data
      setProfileForm({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.email || '',
        phoneNumber: patient.phoneNumber || '',
        address: {
          street: patient.address?.street || '',
          city: patient.address?.city || '',
          province: patient.address?.province || '',
          zipCode: patient.address?.zipCode || ''
        },
        emergencyContact: {
          name: patient.emergencyContact?.name || '',
          relationship: patient.emergencyContact?.relationship || '',
          phoneNumber: patient.emergencyContact?.phoneNumber || ''
        }
      });
    }
  }, [patient, authLoading, navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    if (!profileForm.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!profileForm.phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      setLoading(true);
      const result = await updateProfile(profileForm);
      if (result.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error('New password is required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (result.success) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully');
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (authLoading || !patient) {
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
              <Button variant="ghost" onClick={() => navigate('/patient/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-clinic-600 rounded-full">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="p-2 bg-medical-600 rounded-full">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div className="p-2 bg-pink-500 rounded-full">
                    <Baby className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
                  <p className="text-sm text-gray-600">VM Mother and Child Clinic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'profile' ? 'default' : 'outline'}
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Personal Information
            </Button>
            <Button
              variant={activeTab === 'password' ? 'default' : 'outline'}
              onClick={() => setActiveTab('password')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-clinic-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => handleProfileInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={(e) => handleProfileInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter your phone number"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {patient.dateOfBirth && (
                  <div>
                    <Label>Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        value={new Date(patient.dateOfBirth).toLocaleDateString()}
                        className="pl-10 bg-gray-50"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Contact clinic to update your date of birth</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-clinic-600" />
                  Address Information
                </CardTitle>
                <CardDescription>
                  Update your home address details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={profileForm.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileForm.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={profileForm.address.province}
                      onChange={(e) => handleAddressChange('province', e.target.value)}
                      placeholder="Enter your province"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={profileForm.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    placeholder="Enter your ZIP code"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-clinic-600" />
                  Emergency Contact
                </CardTitle>
                <CardDescription>
                  Add an emergency contact for medical situations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={profileForm.emergencyContact.name}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      value={profileForm.emergencyContact.relationship}
                      onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Phone Number</Label>
                    <Input
                      id="emergencyPhone"
                      value={profileForm.emergencyContact.phoneNumber}
                      onChange={(e) => handleEmergencyContactChange('phoneNumber', e.target.value)}
                      placeholder="Enter emergency contact phone"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Password Change Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-clinic-600" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password for security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="Enter your new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
} 