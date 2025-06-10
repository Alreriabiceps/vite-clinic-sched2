import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading-spinner';
import { X, Stethoscope } from 'lucide-react';
import { patientsAPI } from '../../lib/api';
import { toast } from '../ui/toast';

const AddConsultationModal = ({ patientId, patientType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() => {
    const commonState = { date: new Date().toISOString().split('T')[0] };

    if (patientType === 'pediatric') {
      return {
        ...commonState,
        historyAndPE: '',
        natureTxn: '',
        impression: ''
      };
    } else { // OB-GYNE
      return {
        ...commonState,
        bp: '', pr: '', rr: '', temp: '', weight: '', bmi: '',
        aog: '', fh: '', fht: '', internalExam: '',
        historyPhysicalExam: '',
        assessmentPlan: '',
        nextAppointment: ''
      };
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPediatric = patientType === 'pediatric';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await patientsAPI.addConsultation(patientId, formData);
      toast.success('Consultation record added successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding consultation:', error);
      setError('Failed to add consultation record. Please try again.');
      toast.error('Failed to add consultation record');
    } finally {
      setLoading(false);
    }
  };

  const renderObGyneForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Vitals */}
        <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Vitals & Examination</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">BP (mmHg)</label>
                    <Input value={formData.bp} onChange={(e) => handleInputChange('bp', e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium">PR (bpm)</label>
                    <Input value={formData.pr} onChange={(e) => handleInputChange('pr', e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium">RR (cpm)</label>
                    <Input value={formData.rr} onChange={(e) => handleInputChange('rr', e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium">Temp (°C)</label>
                    <Input value={formData.temp} onChange={(e) => handleInputChange('temp', e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium">Weight (kg)</label>
                    <Input value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium">BMI (kg/m²)</label>
                    <Input value={formData.bmi} onChange={(e) => handleInputChange('bmi', e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium">AOG (cm)</label>
                    <Input value={formData.aog} onChange={(e) => handleInputChange('aog', e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium">FH (cm)</label>
                    <Input value={formData.fh} onChange={(e) => handleInputChange('fh', e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-medium">FHT (bpm)</label>
                    <Input value={formData.fht} onChange={(e) => handleInputChange('fht', e.target.value)} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Exam</label>
                <textarea value={formData.internalExam} onChange={(e) => handleInputChange('internalExam', e.target.value)} className="w-full p-2 border rounded-md" rows={3}></textarea>
            </div>
        </div>

        {/* Right Column: Notes & Plan */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">History / Physical Examination</label>
                <textarea value={formData.historyPhysicalExam} onChange={(e) => handleInputChange('historyPhysicalExam', e.target.value)} className="w-full p-2 border rounded-md" rows={8}></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment / Plan</label>
                <textarea value={formData.assessmentPlan} onChange={(e) => handleInputChange('assessmentPlan', e.target.value)} className="w-full p-2 border rounded-md" rows={8}></textarea>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Appointment</label>
                <Input type="date" value={formData.nextAppointment} onChange={(e) => handleInputChange('nextAppointment', e.target.value)} />
            </div>
        </div>
    </div>
  );
  
  const renderPediatricForm = () => (
    // Pediatric form JSX remains here
    <></>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b py-4">
            <CardTitle className="flex items-center space-x-2"><Stethoscope className="h-5 w-5" /><span>Add Consultation Record</span></CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Date *</label>
                <Input type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.g.target.value)} required />
              </div>

              {isPediatric ? renderPediatricForm() : renderObGyneForm()}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Save Record'}
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