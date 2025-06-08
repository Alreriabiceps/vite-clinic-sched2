import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading-spinner';
import { X, Save, User, Baby, Heart } from 'lucide-react';
import { patientsAPI } from '../../lib/api';
import { toast } from '../ui/toast';

const EditPatientModal = ({ patient, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPediatric = patient?.patientType === 'pediatric';

  useEffect(() => {
    if (patient) {
      if (isPediatric) {
        const record = patient.pediatricRecord || {};
        setFormData({
          nameOfChildren: record.nameOfChildren || '',
          nameOfMother: record.nameOfMother || '',
          nameOfFather: record.nameOfFather || '',
          contactNumber: record.contactNumber || '',
          address: record.address || '',
          birthDate: record.birthDate ? record.birthDate.split('T')[0] : '',
          birthWeight: record.birthWeight || '',
          birthLength: record.birthLength || ''
        });
      } else {
        const record = patient.obGyneRecord || {};
        setFormData({
          patientName: record.patientName || '',
          contactNumber: record.contactNumber || '',
          address: record.address || '',
          birthDate: record.birthDate ? record.birthDate.split('T')[0] : '',
          civilStatus: record.civilStatus || '',
          occupation: record.occupation || ''
        });
      }
    }
  }, [patient, isPediatric]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData = {
        patientType: patient.patientType,
        status: patient.status
      };

      if (isPediatric) {
        updateData.pediatricRecord = {
          ...patient.pediatricRecord,
          ...formData
        };
      } else {
        updateData.obGyneRecord = {
          ...patient.obGyneRecord,
          ...formData
        };
      }

      const response = await patientsAPI.update(patient._id, updateData);
      
      toast.success('Patient updated successfully!');
      onSuccess && onSuccess(response.data.patient);
    } catch (error) {
      console.error('Error updating patient:', error);
      setError('Failed to update patient. Please try again.');
      toast.error('Failed to update patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center space-x-2">
              {isPediatric ? <Baby className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
              <span>Edit {isPediatric ? 'Pediatric' : 'OB-GYNE'} Patient</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isPediatric ? (
                <>
                  {/* Pediatric Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.nameOfChildren || ''}
                        onChange={(e) => handleInputChange('nameOfChildren', e.target.value)}
                        required
                        placeholder="Enter child's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Date
                      </label>
                      <Input
                        type="date"
                        value={formData.birthDate || ''}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mother's Name
                      </label>
                      <Input
                        type="text"
                        value={formData.nameOfMother || ''}
                        onChange={(e) => handleInputChange('nameOfMother', e.target.value)}
                        placeholder="Enter mother's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Father's Name
                      </label>
                      <Input
                        type="text"
                        value={formData.nameOfFather || ''}
                        onChange={(e) => handleInputChange('nameOfFather', e.target.value)}
                        placeholder="Enter father's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.contactNumber || ''}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        placeholder="Contact number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Weight
                      </label>
                      <Input
                        type="text"
                        value={formData.birthWeight || ''}
                        onChange={(e) => handleInputChange('birthWeight', e.target.value)}
                        placeholder="e.g., 3.2 kg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Length
                      </label>
                      <Input
                        type="text"
                        value={formData.birthLength || ''}
                        onChange={(e) => handleInputChange('birthLength', e.target.value)}
                        placeholder="e.g., 50 cm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Complete address"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* OB-GYNE Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.patientName || ''}
                        onChange={(e) => handleInputChange('patientName', e.target.value)}
                        required
                        placeholder="Enter patient's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Date
                      </label>
                      <Input
                        type="date"
                        value={formData.birthDate || ''}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.contactNumber || ''}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        placeholder="Contact number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Civil Status
                      </label>
                      <select
                        value={formData.civilStatus || ''}
                        onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Occupation
                      </label>
                      <Input
                        type="text"
                        value={formData.occupation || ''}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        placeholder="Patient's occupation"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Complete address"
                    />
                  </div>
                </>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPatientModal; 