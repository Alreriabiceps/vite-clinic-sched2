import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner, Badge, patientsAPI, appointmentsAPI, formatDate, calculateAge, getStatusColor, toast, EditObGynePatientModal, EditPediatricPatientModal, AddConsultationModal, AddImmunizationModal, DeleteConfirmationModal } from '../../shared';
import { ObGyneOverview, PediatricOverview } from '../components/patient-views';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Plus, Calendar, Phone, Mail, MapPin, 
  Heart, Baby, User, Activity, FileText, Syringe, Stethoscope,
  AlertCircle, CheckCircle, ShieldCheck, Beaker, Save, X, Edit3
} from 'lucide-react';
// Helper component for displaying info items
const InfoItem = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="text-sm text-gray-900">{value || 'N/A'}</p>
  </div>
);

// Helper for boolean/checkbox items
const ChecklistItem = ({ label, checked }) => (
    <div className="flex items-center">
        {checked ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />}
        <span className={checked ? 'text-sm text-gray-800' : 'text-sm text-gray-500'}>{label}</span>
    </div>
);

const PatientOverview = ({ patient }) => {
  if (!patient) return null;

  switch (patient.patientType) {
    case 'ob-gyne':
      return <ObGyneOverview patient={patient} />;
    case 'pediatric':
      return <PediatricOverview patient={patient} />;
    default:
      return <div>Unknown patient type</div>;
  }
};

const MedicalRecordsTab = ({ patient }) => {
    const consultations = patient.patientType === 'ob-gyne' 
        ? patient.obGyneRecord?.consultations 
        : patient.pediatricRecord?.consultations;

    if (!consultations || consultations.length === 0) {
        return <div className="text-center py-12"><FileText className="h-12 w-12 mx-auto text-gray-400" /><p className="mt-2 text-gray-600">No consultation records found.</p></div>
    }

    const renderObGyneConsultation = (consultation) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vitals */}
            <div className="space-y-3">
                <h4 className="font-semibold">Vitals & Examination</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <InfoItem label="BP" value={consultation.bp} />
                    <InfoItem label="PR" value={consultation.pr} />
                    <InfoItem label="RR" value={consultation.rr} />
                    <InfoItem label="Temp" value={consultation.temp} />
                    <InfoItem label="Weight" value={consultation.weight} />
                    <InfoItem label="BMI" value={consultation.bmi} />
                </div>
                <InfoItem label="Internal Exam" value={consultation.internalExam} />
            </div>
            {/* Notes */}
            <div className="space-y-3">
                 <InfoItem label="History/Physical Exam" value={consultation.historyPhysicalExam} />
                 <InfoItem label="Assessment/Plan" value={consultation.assessmentPlan} />
                 <InfoItem label="Next Appointment" value={formatDate(consultation.nextAppointment)} />
            </div>
        </div>
    );
    
    // A renderer for pediatric consultations would go here

    return (
        <div className="space-y-4">
            {consultations.slice().reverse().map((consultation) => (
                <Card key={consultation._id}>
                    <CardHeader>
                        <CardTitle className="text-lg">Consultation on {formatDate(consultation.date)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {patient.patientType === 'ob-gyne' ? renderObGyneConsultation(consultation) : <p>Pediatric record view.</p>}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [immunizationModalOpen, setImmunizationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);
  const [diagnosisValue, setDiagnosisValue] = useState('');
  const [savingDiagnosis, setSavingDiagnosis] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // First get patient data
      const patientResponse = await patientsAPI.getById(patientId);
      console.log('Patient data:', patientResponse.data);
      setPatient(patientResponse.data);
      
      // Then get appointments using the patient's patientId field
      const appointmentsResponse = await appointmentsAPI.getAll({ patientId: patientResponse.data.patientId });
      console.log('Fetching appointments for patientId:', patientResponse.data.patientId);
      setAppointments(appointmentsResponse.data?.data?.appointments || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    toast.success('Patient updated successfully');
    fetchPatientData(); // Always refresh from backend
  };

  const handleMedicalRecordAdded = () => {
    fetchPatientData(); // Refresh data to show new record
    setConsultationModalOpen(false);
    setImmunizationModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await patientsAPI.delete(patientId);
      toast.success('Patient deleted successfully');
      navigate('/patients');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
    setDeleteModalOpen(false);
  };

  const handleEditDiagnosis = (appointmentId, currentDiagnosis) => {
    setEditingDiagnosis(appointmentId);
    setDiagnosisValue(currentDiagnosis || '');
  };

  const handleSaveDiagnosis = async (appointmentId) => {
    setSavingDiagnosis(true);
    try {
      await appointmentsAPI.updateDiagnosis(appointmentId, diagnosisValue);
      
      // Update the local appointments state
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId 
          ? { ...apt, diagnosis: diagnosisValue }
          : apt
      ));
      
      setEditingDiagnosis(null);
      setDiagnosisValue('');
      toast.success('Diagnosis updated successfully');
    } catch (error) {
      console.error('Error updating diagnosis:', error);
      toast.error('Failed to update diagnosis');
    } finally {
      setSavingDiagnosis(false);
    }
  };

  const handleCancelDiagnosis = () => {
    setEditingDiagnosis(null);
    setDiagnosisValue('');
  };

  const getPatientName = (patient) => {
    if (!patient) return 'Unknown Patient';
    
    if (patient.patientType === 'pediatric') {
      return patient.pediatricRecord?.nameOfChildren || 'Pediatric Patient';
    } else {
      return patient.obGyneRecord?.patientName || 'OB-GYNE Patient';
    }
  };

  const getPatientInfo = (patient) => {
    if (!patient) return {};
    
    if (patient.patientType === 'pediatric') {
      const record = patient.pediatricRecord || {};
      return {
        name: record.nameOfChildren || 'N/A',
        motherName: record.nameOfMother || 'N/A',
        fatherName: record.nameOfFather || 'N/A',
        contactNumber: record.contactNumber || 'N/A',
        address: record.address || 'N/A',
        birthDate: record.birthDate,
        birthWeight: record.birthWeight || 'N/A',
        birthLength: record.birthLength || 'N/A'
      };
    } else {
      const record = patient.obGyneRecord || {};
      return {
        name: record.patientName || 'N/A',
        contactNumber: record.contactNumber || 'N/A',
        address: record.address || 'N/A',
        birthDate: record.birthDate,
        civilStatus: record.civilStatus || 'N/A',
        occupation: record.occupation || 'N/A'
      };
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h2>
        <p className="text-gray-600 mb-6">The patient you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/patients')} className="bg-blue-600 hover:bg-blue-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
      </div>
    );
  }

  const patientInfo = getPatientInfo(patient);
  const isPediatric = patient.patientType === 'pediatric';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/patients')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPatientName(patient)}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <Badge className={getStatusBadgeColor(patient.status)}>
                {patient.status || 'New'}
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                {isPediatric ? <Baby className="h-3 w-3" /> : <Heart className="h-3 w-3" />}
                <span>{isPediatric ? 'Pediatric' : 'OB-GYNE'}</span>
              </Badge>
              <span className="text-sm text-gray-500">ID: {patient.patientId}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setEditModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Patient</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'medical-records', 'appointments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'medical-records' && 'Medical Records'}
              {tab === 'appointments' && 'Appointments'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <PatientOverview patient={patient} />
        )}

        {activeTab === 'medical-records' && (
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Consultation History</h2>
                  <div className="flex items-center space-x-2">
                      <Button
                          onClick={() => setConsultationModalOpen(true)}
                          className="flex items-center space-x-2"
                      >
                          <Plus className="h-4 w-4" />
                          <span>Add Consultation</span>
                      </Button>
                      {isPediatric && (
                          <Button
                          variant="outline"
                          onClick={() => setImmunizationModalOpen(true)}
                          className="flex items-center space-x-2"
                          >
                          <Plus className="h-4 w-4" />
                          <span>Add Immunization</span>
                          </Button>
                      )}
                  </div>
              </div>
              <MedicalRecordsTab patient={patient} />
          </div>
        )}

        {activeTab === 'appointments' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Appointment History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Editable Diagnosis Field */}
                        <div className="mb-2">
                          {editingDiagnosis === appointment._id ? (
                            <div className="flex items-center space-x-2">
                              <textarea
                                value={diagnosisValue}
                                onChange={(e) => setDiagnosisValue(e.target.value)}
                                placeholder="Enter diagnosis..."
                                className="flex-1 p-2 border border-gray-300 rounded-md resize-none"
                                rows="2"
                                autoFocus
                              />
                              <div className="flex flex-col space-y-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveDiagnosis(appointment._id)}
                                  disabled={savingDiagnosis}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1"
                                >
                                  {savingDiagnosis ? <LoadingSpinner size="sm" /> : <Save className="h-3 w-3" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelDiagnosis}
                                  disabled={savingDiagnosis}
                                  className="px-2 py-1"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start space-x-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {appointment.diagnosis || 'No diagnosis provided'}
                                </h4>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditDiagnosis(appointment._id, appointment.diagnosis)}
                                className="px-2 py-1 text-blue-600 hover:text-blue-700"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          Dr. {appointment.doctorName} • {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                        </p>
                        {appointment.reasonForVisit && (
                          <p className="text-sm text-gray-600 mt-1">Reason: {appointment.reasonForVisit}</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No appointments found</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {editModalOpen && patient.patientType === 'ob-gyne' && (
        <EditObGynePatientModal
          patient={patient}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {editModalOpen && patient.patientType === 'pediatric' && (
        <EditPediatricPatientModal
          patient={patient}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {consultationModalOpen && (
        <AddConsultationModal
          patientId={patientId}
          patientType={patient.patientType}
          onClose={() => setConsultationModalOpen(false)}
          onSuccess={handleMedicalRecordAdded}
        />
      )}

      {immunizationModalOpen && isPediatric && (
        <AddImmunizationModal
          patientId={patientId}
          onClose={() => setImmunizationModalOpen(false)}
          onSuccess={handleMedicalRecordAdded}
        />
      )}

      {deleteModalOpen && (
        <DeleteConfirmationModal
          title="Delete Patient"
          message={`Are you sure you want to delete ${getPatientName(patient)}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PatientDetail; 