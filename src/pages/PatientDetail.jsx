import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Badge } from '../components/ui/badge';
import { patientsAPI, appointmentsAPI } from '../lib/api';
import { formatDate, calculateAge, getStatusColor } from '../lib/utils';
import { 
  ArrowLeft, Edit, Trash2, Plus, Calendar, Phone, Mail, MapPin, 
  Heart, Baby, User, Activity, FileText, Syringe, Stethoscope,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { toast } from '../components/ui/toast';
import EditPatientModal from '../components/forms/EditPatientModal';
import AddConsultationModal from '../components/forms/AddConsultationModal';
import AddImmunizationModal from '../components/forms/AddImmunizationModal';
import DeleteConfirmationModal from '../components/forms/DeleteConfirmationModal';

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

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [patientResponse, appointmentsResponse] = await Promise.all([
        patientsAPI.getById(patientId),
        appointmentsAPI.getAll({ patientId })
      ]);
      
      console.log('Patient data:', patientResponse.data);
      setPatient(patientResponse.data);
      setAppointments(appointmentsResponse.data?.data?.appointments || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = (updatedPatient) => {
    setPatient(updatedPatient);
    setEditModalOpen(false);
    toast.success('Patient updated successfully');
    fetchPatientData(); // Refresh data
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Patient Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900">{patientInfo.name}</p>
                  </div>
                  {isPediatric && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                        <p className="text-sm text-gray-900">{patientInfo.motherName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                        <p className="text-sm text-gray-900">{patientInfo.fatherName}</p>
                      </div>
                    </>
                  )}
                  {!isPediatric && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Civil Status</label>
                        <p className="text-sm text-gray-900">{patientInfo.civilStatus}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Occupation</label>
                        <p className="text-sm text-gray-900">{patientInfo.occupation}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-sm text-gray-900">
                      {patientInfo.birthDate ? formatDate(patientInfo.birthDate) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <p className="text-sm text-gray-900">
                      {patientInfo.birthDate ? calculateAge(patientInfo.birthDate) : 'N/A'}
                    </p>
                  </div>
                  {isPediatric && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Birth Weight</label>
                        <p className="text-sm text-gray-900">{patientInfo.birthWeight}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Birth Length</label>
                        <p className="text-sm text-gray-900">{patientInfo.birthLength}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{patientInfo.contactNumber}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-900">{patientInfo.address}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Appointments</span>
                  <span className="font-semibold">{appointments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Consultations</span>
                  <span className="font-semibold">
                    {isPediatric 
                      ? patient.pediatricRecord?.consultations?.length || 0
                      : patient.obGyneRecord?.consultations?.length || 0
                    }
                  </span>
                </div>
                {isPediatric && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Immunizations</span>
                    <span className="font-semibold">
                      {patient.pediatricRecord?.immunizations?.length || 0}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Visit</span>
                  <span className="text-sm">
                    {appointments.length > 0 
                      ? formatDate(appointments[0].appointmentDate) 
                      : 'No visits yet'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appointment, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{appointment.serviceType}</p>
                        <p className="text-gray-600">{formatDate(appointment.appointmentDate)}</p>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'medical-records' && (
        <div className="space-y-6">
          {/* Medical Records Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Medical Records</h2>
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

          {/* Consultations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Consultation Records</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isPediatric 
                  ? patient.pediatricRecord?.consultations || []
                  : patient.obGyneRecord?.consultations || []
                ).map((consultation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        Consultation #{index + 1}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(consultation.date)}
                      </span>
                    </div>
                    {isPediatric ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">History & PE:</span>
                          <p className="text-sm text-gray-900">{consultation.historyAndPE || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Nature of Transaction:</span>
                          <p className="text-sm text-gray-900">{consultation.natureTxn || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Impression:</span>
                          <p className="text-sm text-gray-900">{consultation.impression || 'N/A'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">BP:</span>
                          <span className="text-sm text-gray-900 ml-2">{consultation.bp || 'N/A'}</span>
                          <span className="text-sm font-medium text-gray-700 ml-4">HR:</span>
                          <span className="text-sm text-gray-900 ml-2">{consultation.hr || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">History & Physical Exam:</span>
                          <p className="text-sm text-gray-900">{consultation.historyPhysicalExam || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Assessment & Plan:</span>
                          <p className="text-sm text-gray-900">{consultation.assessmentPlan || 'N/A'}</p>
                        </div>
                        {consultation.medications && consultation.medications.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Medications:</span>
                            <ul className="text-sm text-gray-900 mt-1 space-y-1">
                              {consultation.medications.map((med, medIndex) => (
                                <li key={medIndex} className="ml-4">
                                  • {med.name} - {med.dosage} - {med.frequency} for {med.duration}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {(isPediatric 
                  ? patient.pediatricRecord?.consultations?.length || 0
                  : patient.obGyneRecord?.consultations?.length || 0
                ) === 0 && (
                  <p className="text-gray-500 text-center py-8">No consultation records found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Immunizations (Pediatric Only) */}
          {isPediatric && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Syringe className="h-5 w-5" />
                  <span>Immunization Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(patient.pediatricRecord?.immunizations || []).map((immunization, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{immunization.vaccine}</h4>
                          <p className="text-sm text-gray-600">{formatDate(immunization.date)}</p>
                          {immunization.remarks && (
                            <p className="text-sm text-gray-600 mt-1">{immunization.remarks}</p>
                          )}
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                  {(patient.pediatricRecord?.immunizations?.length || 0) === 0 && (
                    <p className="text-gray-500 text-center py-8">No immunization records found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.serviceType}</h4>
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

      {/* Modals */}
      {editModalOpen && (
        <EditPatientModal
          patient={patient}
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