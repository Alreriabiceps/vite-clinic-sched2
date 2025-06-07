import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { X, Baby, Heart, Calendar, Phone, MapPin, User, FileText } from 'lucide-react';
import { patientsAPI } from '../../lib/api';
import { toast } from '../ui/toast';

export default function PatientRegistrationModal({ isOpen, onClose, patientType, onSuccess }) {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    address: '',
    emergencyContact: '',
    emergencyContactNumber: '',
    
    // Pediatric-specific
    motherName: '',
    fatherName: '',
    birthWeight: '',
    birthHeight: '',
    bloodType: '',
    
    // OB-GYNE-specific
    occupation: '',
    civilStatus: '',
    religion: '',
    lastMenstrualPeriod: '',
    gravida: '',
    para: '',
    medicalHistory: '',
    allergies: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'contactNumber', 'address'];
    
    if (patientType === 'pediatric') {
      required.push('motherName', 'birthWeight', 'birthHeight');
    } else {
      required.push('occupation', 'civilStatus');
    }

    for (const field of required) {
      if (!formData[field]) {
        setError(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }

    // Validate phone number (Philippine format)
    const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
    if (!phoneRegex.test(formData.contactNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid Philippine mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Prepare data based on patient type
      const patientData = {
        patientType,
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          contactNumber: formData.contactNumber,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          emergencyContactNumber: formData.emergencyContactNumber
        }
      };

      if (patientType === 'pediatric') {
        patientData.pediatricInfo = {
          motherName: formData.motherName,
          fatherName: formData.fatherName,
          birthWeight: parseFloat(formData.birthWeight),
          birthHeight: parseFloat(formData.birthHeight),
          bloodType: formData.bloodType,
          immunizations: [],
          consultations: []
        };
      } else {
        patientData.obgyneInfo = {
          occupation: formData.occupation,
          civilStatus: formData.civilStatus,
          religion: formData.religion,
          lastMenstrualPeriod: formData.lastMenstrualPeriod || undefined,
          gravida: formData.gravida ? parseInt(formData.gravida) : undefined,
          para: formData.para ? parseInt(formData.para) : undefined,
          medicalHistory: formData.medicalHistory,
          allergies: formData.allergies,
          consultations: []
        };
      }

      // Use the correct API method to create patient
      const response = await (await import('../../lib/api')).default.post('/patients', patientData);
      
      // Show success toast
      toast.success(`${isPediatric ? 'Pediatric' : 'OB-GYNE'} patient registered successfully!`);
      
      onSuccess && onSuccess(response.data);
      onClose();
      
      // Reset form
      setFormData({
        firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: '',
        contactNumber: '', address: '', emergencyContact: '', emergencyContactNumber: '',
        motherName: '', fatherName: '', birthWeight: '', birthHeight: '', bloodType: '',
        occupation: '', civilStatus: '', religion: '', lastMenstrualPeriod: '',
        gravida: '', para: '', medicalHistory: '', allergies: ''
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Failed to register patient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isPediatric = patientType === 'pediatric';

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPediatric ? (
                  <div className="p-2 bg-sky-100 rounded-lg">
                    <Baby className="h-6 w-6 text-sky-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl">
                    New {isPediatric ? 'Pediatric' : 'OB-GYNE'} Patient
                  </CardTitle>
                  <CardDescription>
                    Register a new {isPediatric ? 'pediatric' : 'OB-GYNE'} patient in the system
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <Input
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Enter middle name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="+63 912 345 6789"
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="emergencyContactNumber"
                        value={formData.emergencyContactNumber}
                        onChange={handleChange}
                        placeholder="+63 912 345 6789"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter complete address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent resize-none"
                        rows="3"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Name
                    </label>
                    <Input
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="Enter emergency contact name"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Pediatric-specific fields */}
              {isPediatric && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Baby className="h-5 w-5 text-sky-600" />
                    <h3 className="text-lg font-semibold">Pediatric Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mother's Name *
                      </label>
                      <Input
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                        placeholder="Enter mother's full name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Father's Name
                      </label>
                      <Input
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="Enter father's full name"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Weight (kg) *
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        name="birthWeight"
                        value={formData.birthWeight}
                        onChange={handleChange}
                        placeholder="3.2"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Height (cm) *
                      </label>
                      <Input
                        type="number"
                        name="birthHeight"
                        value={formData.birthHeight}
                        onChange={handleChange}
                        placeholder="50"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Type
                      </label>
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="">Select blood type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* OB-GYNE-specific fields */}
              {!isPediatric && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <h3 className="text-lg font-semibold">OB-GYNE Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Occupation *
                      </label>
                      <Input
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        placeholder="Enter occupation"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Civil Status *
                      </label>
                      <select
                        name="civilStatus"
                        value={formData.civilStatus}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent"
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Religion
                      </label>
                      <Input
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        placeholder="Enter religion"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Menstrual Period
                      </label>
                      <Input
                        type="date"
                        name="lastMenstrualPeriod"
                        value={formData.lastMenstrualPeriod}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gravida (G)
                      </label>
                      <Input
                        type="number"
                        name="gravida"
                        value={formData.gravida}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Para (P)
                      </label>
                      <Input
                        type="number"
                        name="para"
                        value={formData.para}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical History
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          name="medicalHistory"
                          value={formData.medicalHistory}
                          onChange={handleChange}
                          placeholder="Enter medical history, previous surgeries, etc."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent resize-none"
                          rows="3"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allergies
                      </label>
                      <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        placeholder="Enter known allergies"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent resize-none"
                        rows="3"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={isPediatric ? "default" : "clinic"}
                  disabled={isLoading}
                  className={isPediatric ? "bg-sky-600 hover:bg-sky-700" : ""}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Registering...
                    </>
                  ) : (
                    `Register ${isPediatric ? 'Pediatric' : 'OB-GYNE'} Patient`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 