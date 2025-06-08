import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading-spinner';
import { X, Plus, Stethoscope, Trash2 } from 'lucide-react';
import { patientsAPI } from '../../lib/api';
import { toast } from '../ui/toast';

const AddConsultationModal = ({ patientId, patientType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() => {
    if (patientType === 'pediatric') {
      return {
        date: new Date().toISOString().split('T')[0],
        historyAndPE: '',
        natureTxn: '',
        impression: ''
      };
    } else {
      return {
        date: new Date().toISOString().split('T')[0],
        bp: '',
        hr: '',
        historyPhysicalExam: '',
        assessmentPlan: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
      };
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPediatric = patientType === 'pediatric';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (isPediatric) {
      if (!formData.historyAndPE && !formData.natureTxn && !formData.impression) {
        setError('Please fill in at least one consultation field.');
        return false;
      }
    } else {
      if (!formData.historyPhysicalExam && !formData.assessmentPlan) {
        setError('Please fill in at least History & Physical Exam or Assessment & Plan.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const consultationData = { ...formData };
      
      // Filter out empty medications for OB-GYNE patients
      if (!isPediatric) {
        consultationData.medications = formData.medications.filter(med => 
          med.name.trim() || med.dosage.trim() || med.frequency.trim() || med.duration.trim()
        );
      }

      await patientsAPI.addConsultation(patientId, consultationData);
      
      toast.success('Consultation record added successfully!');
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error adding consultation:', error);
      setError('Failed to add consultation record. Please try again.');
      toast.error('Failed to add consultation record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>Add Consultation Record</span>
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
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              {isPediatric ? (
                <>
                  {/* Pediatric Consultation Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      History & Physical Examination
                    </label>
                    <textarea
                      value={formData.historyAndPE}
                      onChange={(e) => handleInputChange('historyAndPE', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter history and physical examination findings..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nature of Transaction
                    </label>
                    <textarea
                      value={formData.natureTxn}
                      onChange={(e) => handleInputChange('natureTxn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe the nature of the consultation or treatment..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Impression
                    </label>
                    <textarea
                      value={formData.impression}
                      onChange={(e) => handleInputChange('impression', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Clinical impression or diagnosis..."
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* OB-GYNE Consultation Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Pressure (BP)
                      </label>
                      <Input
                        type="text"
                        value={formData.bp}
                        onChange={(e) => handleInputChange('bp', e.target.value)}
                        placeholder="e.g., 120/80 mmHg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heart Rate (HR)
                      </label>
                      <Input
                        type="text"
                        value={formData.hr}
                        onChange={(e) => handleInputChange('hr', e.target.value)}
                        placeholder="e.g., 80 bpm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      History & Physical Examination
                    </label>
                    <textarea
                      value={formData.historyPhysicalExam}
                      onChange={(e) => handleInputChange('historyPhysicalExam', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter history and physical examination findings..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assessment & Plan
                    </label>
                    <textarea
                      value={formData.assessmentPlan}
                      onChange={(e) => handleInputChange('assessmentPlan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Clinical assessment and treatment plan..."
                    />
                  </div>

                  {/* Medications */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Medications
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMedication}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Medication</span>
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.medications.map((medication, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                          <div>
                            <Input
                              type="text"
                              value={medication.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              placeholder="Medication name"
                            />
                          </div>
                          <div>
                            <Input
                              type="text"
                              value={medication.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                              placeholder="Dosage"
                            />
                          </div>
                          <div>
                            <Input
                              type="text"
                              value={medication.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                              placeholder="Frequency"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              type="text"
                              value={medication.duration}
                              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                              placeholder="Duration"
                              className="flex-1"
                            />
                            {formData.medications.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMedication(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <Plus className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Adding...' : 'Add Consultation'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddConsultationModal; 