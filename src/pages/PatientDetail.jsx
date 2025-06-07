import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { patientsAPI, appointmentsAPI } from '../lib/api';
import { formatDate, calculateAge, getStatusColor } from '../lib/utils';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

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
      
      setPatient(patientResponse.data.data.patient);
      setAppointments(appointmentsResponse.data.data.appointments || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h2>
        <p className="text-gray-600 mb-6">The patient you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/patients')} className="bg-blue-600 hover:bg-blue-700">
          Back to Patients
        </Button>
      </div>
    );
  }

  const renderPatientInfo = () => {
    const isPediatric = patient.patientType === 'pediatric';
    const record = isPediatric ? patient.pediatricRecord : patient.obGyneRecord;

    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                <p className="text-sm text-gray-900">{patient.patientId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Type</label>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  isPediatric 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-pink-100 text-pink-800'
                }`}>
                  {isPediatric ? 'Pediatric' : 'OB-GYNE'}
                </span>
              </div>
            </div>

            {isPediatric ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
                    <p className="text-sm text-gray-900">{record.nameOfChildren}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                    <p className="text-sm text-gray-900">
                      {record.birthDate ? formatDate(record.birthDate) : 'Not provided'}
                      {record.birthDate && (
                        <span className="text-gray-500 ml-2">
                          (Age: {calculateAge(record.birthDate)} years)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                    <p className="text-sm text-gray-900">{record.nameOfMother || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                    <p className="text-sm text-gray-900">{record.nameOfFather || 'Not provided'}</p>
                  </div>
                </div>

                {(record.birthWeight || record.birthLength) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birth Weight</label>
                      <p className="text-sm text-gray-900">{record.birthWeight || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birth Length</label>
                      <p className="text-sm text-gray-900">{record.birthLength || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <p className="text-sm text-gray-900">{record.patientName}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <p className="text-sm text-gray-900">{record.contactNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-sm text-gray-900">{record.address || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered</label>
              <p className="text-sm text-gray-900">{formatDate(patient.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Medical History for Pediatric */}
        {isPediatric && (
          <>
            {record.immunizations && record.immunizations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Immunization History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {record.immunizations.map((immunization, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{immunization.vaccineName}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(immunization.dateGiven)}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            Age: {immunization.ageGiven}
                          </span>
                        </div>
                        {immunization.reactions && (
                          <p className="text-sm text-gray-600 mt-2">
                            Reactions: {immunization.reactions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {record.consultations && record.consultations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Consultation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {record.consultations.map((consultation, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{formatDate(consultation.date)}</p>
                          <span className="text-sm text-gray-500">
                            Age: {consultation.ageAtConsultation}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Chief Complaint:</strong> {consultation.chiefComplaint}
                        </p>
                        {consultation.diagnosis && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Diagnosis:</strong> {consultation.diagnosis}
                          </p>
                        )}
                        {consultation.treatment && (
                          <p className="text-sm text-gray-600">
                            <strong>Treatment:</strong> {consultation.treatment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Medical History for OB-GYNE */}
        {!isPediatric && record.medicalHistory && (
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {record.medicalHistory.allergies && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                    <p className="text-sm text-gray-900">{record.medicalHistory.allergies}</p>
                  </div>
                )}
                {record.medicalHistory.currentMedications && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                    <p className="text-sm text-gray-900">{record.medicalHistory.currentMedications}</p>
                  </div>
                )}
                {record.medicalHistory.surgicalHistory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surgical History</label>
                    <p className="text-sm text-gray-900">{record.medicalHistory.surgicalHistory}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {patient.notes && patient.notes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Patient Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.notes.map((note, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium">
                        {note.createdBy?.firstName} {note.createdBy?.lastName}
                      </p>
                      <span className="text-sm text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderAppointments = () => (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Service:</strong> {appointment.serviceType}
                </p>
                {appointment.reasonForVisit && (
                  <p className="text-sm text-gray-700">
                    <strong>Reason:</strong> {appointment.reasonForVisit}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No appointments found for this patient.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {patient.patientType === 'pediatric' 
              ? patient.pediatricRecord.nameOfChildren 
              : patient.obGyneRecord.patientName}
          </h1>
          <p className="text-gray-600">Patient ID: {patient.patientId}</p>
        </div>
        <Button 
          onClick={() => navigate('/patients')} 
          variant="outline"
        >
          Back to Patients
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'appointments', label: 'Appointments' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && renderPatientInfo()}
        {activeTab === 'appointments' && renderAppointments()}
      </div>
    </div>
  );
};

export default PatientDetail; 