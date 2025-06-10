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
  AlertCircle, CheckCircle, ShieldCheck, Beaker
} from 'lucide-react';
import { toast } from '../components/ui/toast';
import EditPatientModal from '../components/forms/EditPatientModal';
import AddConsultationModal from '../components/forms/AddConsultationModal';
import AddImmunizationModal from '../components/forms/AddImmunizationModal';
import DeleteConfirmationModal from '../components/forms/DeleteConfirmationModal';

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

const ObGyneOverview = ({ patient }) => {
  const record = patient.obGyneRecord;
  if (!record) return null;

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <Card className="p-0">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 pb-2 px-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <InfoItem label="Name" value={record.patientName} />
          <InfoItem label="Age" value={record.age} />
          <InfoItem label="Date of Birth" value={formatDate(record.birthDate)} />
          <InfoItem label="Address" value={record.address} />
          <InfoItem label="Contact #" value={record.contactNumber} />
          <InfoItem label="Occupation" value={record.occupation} />
          <InfoItem label="Civil Status" value={record.civilStatus} />
          <InfoItem label="Religion" value={record.religion} />
          <InfoItem label="Referred By" value={record.referredBy} />
          <InfoItem label="Emergency Contact" value={`${record.emergencyContact?.name} (${record.emergencyContact?.contactNumber})`} />
        </CardContent>
      </Card>

      {/* Past Medical & Family History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-0">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Stethoscope className="h-4 w-4" /> Past Medical History</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-2 px-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <ChecklistItem label="Hypertension" checked={record.pastMedicalHistory?.hypertension} />
            <ChecklistItem label="Diabetes" checked={record.pastMedicalHistory?.diabetes} />
            <ChecklistItem label="Bronchial Asthma" checked={record.pastMedicalHistory?.bronchialAsthma} />
            <ChecklistItem label="Heart Disease" checked={record.pastMedicalHistory?.heartDisease} />
            <ChecklistItem label="Thyroid Disease" checked={record.pastMedicalHistory?.thyroidDisease} />
            <InfoItem label="Last Attack" value={record.pastMedicalHistory?.lastAttack} />
            <InfoItem label="Previous Surgery" value={record.pastMedicalHistory?.previousSurgery} />
            <InfoItem label="Allergies" value={record.pastMedicalHistory?.allergies} />
          </CardContent>
        </Card>
        <Card className="p-0">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Family History</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-2 px-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <ChecklistItem label="Smoker" checked={record.familyHistory?.smoker} />
            <ChecklistItem label="Alcohol" checked={record.familyHistory?.alcohol} />
            <ChecklistItem label="Drugs" checked={record.familyHistory?.drugs} />
          </CardContent>
        </Card>
      </div>

      {/* Gynecologic & Obstetric History */}
      <Card className="p-0">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><Heart className="h-4 w-4" /> Gynecologic & Obstetric History</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 pb-2 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm mb-2">
            <InfoItem label="OB Score" value={record.gynecologicHistory?.obScore} />
            <InfoItem label="Gravidity" value={record.gynecologicHistory?.gravidity} />
            <InfoItem label="Parity" value={record.gynecologicHistory?.parity} />
            <InfoItem label="LMP" value={formatDate(record.gynecologicHistory?.lmp)} />
            <InfoItem label="PMP" value={formatDate(record.gynecologicHistory?.pmp)} />
            <InfoItem label="AOG" value={record.gynecologicHistory?.aog} />
            <InfoItem label="Early Ultrasound" value={formatDate(record.gynecologicHistory?.earlyUltrasound)} />
            <InfoItem label="AOG by EUTZ" value={record.gynecologicHistory?.aogByEutz} />
            <InfoItem label="EDD by LMP" value={formatDate(record.gynecologicHistory?.eddByLmp)} />
            <InfoItem label="EDD by EUTZ" value={formatDate(record.gynecologicHistory?.eddByEutz)} />
            <InfoItem label="Menarche" value={record.gynecologicHistory?.menarche} />
            <ChecklistItem label="Interval Regular" checked={record.gynecologicHistory?.intervalIsRegular} />
            <InfoItem label="Interval Days" value={record.gynecologicHistory?.intervalDays} />
            <InfoItem label="Duration Days" value={record.gynecologicHistory?.durationDays} />
            <InfoItem label="Amount Pads" value={record.gynecologicHistory?.amountPads} />
            <ChecklistItem label="Dysmenorrhea" checked={record.gynecologicHistory?.dysmenorrhea} />
            <InfoItem label="Coitarche" value={record.gynecologicHistory?.coitarche} />
            <InfoItem label="Sexual Partners" value={record.gynecologicHistory?.sexualPartners} />
            <InfoItem label="Contraceptive Use" value={record.gynecologicHistory?.contraceptiveUse} />
            <InfoItem label="Last Pap Smear Date" value={formatDate(record.gynecologicHistory?.lastPapSmear?.date)} />
            <InfoItem label="Last Pap Smear Result" value={record.gynecologicHistory?.lastPapSmear?.result} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border mt-2">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-1 px-1">Year</th>
                  <th className="text-left py-1 px-1">Place</th>
                  <th className="text-left py-1 px-1">Type of Delivery</th>
                  <th className="text-left py-1 px-1">BW</th>
                  <th className="text-left py-1 px-1">Complications</th>
                </tr>
              </thead>
              <tbody>
                {record.obstetricHistory?.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-1 px-1">{item.year}</td>
                    <td className="py-1 px-1">{item.place}</td>
                    <td className="py-1 px-1">{item.typeOfDelivery}</td>
                    <td className="py-1 px-1">{item.bw}</td>
                    <td className="py-1 px-1">{item.complications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics and Immunizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-0">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Beaker className="h-4 w-4" /> Baseline Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-2 px-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <InfoItem label="Hgb" value={record.baselineDiagnostics?.cbc?.hgb} />
            <InfoItem label="Hct" value={record.baselineDiagnostics?.cbc?.hct} />
            <InfoItem label="Plt" value={record.baselineDiagnostics?.cbc?.plt} />
            <InfoItem label="WBC" value={record.baselineDiagnostics?.cbc?.wbc} />
            <InfoItem label="Urinalysis" value={record.baselineDiagnostics?.urinalysis} />
            <InfoItem label="Blood Type" value={record.baselineDiagnostics?.bloodType} />
            <InfoItem label="FBS" value={record.baselineDiagnostics?.fbs} />
            <InfoItem label="HBsAg" value={record.baselineDiagnostics?.hbsag} />
            <InfoItem label="VDRL/RPR" value={record.baselineDiagnostics?.vdrlRpr} />
            <InfoItem label="HIV" value={record.baselineDiagnostics?.hiv} />
            <InfoItem label="OGTT FBS" value={record.baselineDiagnostics?.ogtt75g?.fbs} />
            <InfoItem label="OGTT 1st Hr" value={record.baselineDiagnostics?.ogtt75g?.firstHour} />
            <InfoItem label="OGTT 2nd Hr" value={record.baselineDiagnostics?.ogtt75g?.secondHour} />
            <InfoItem label="Other" value={record.baselineDiagnostics?.other} />
          </CardContent>
        </Card>
        <Card className="p-0">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Immunizations</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-2 px-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <InfoItem label="TT1" value={formatDate(record.immunizations?.tt1)} />
            <InfoItem label="TT2" value={formatDate(record.immunizations?.tt2)} />
            <InfoItem label="TT3" value={formatDate(record.immunizations?.tt3)} />
            <InfoItem label="TDAP" value={formatDate(record.immunizations?.tdap)} />
            <InfoItem label="Flu" value={formatDate(record.immunizations?.flu)} />
            <InfoItem label="HPV" value={formatDate(record.immunizations?.hpv)} />
            <InfoItem label="PCV" value={formatDate(record.immunizations?.pcv)} />
            <InfoItem label="COVID-19 Brand" value={record.immunizations?.covid19?.brand} />
            <InfoItem label="COVID-19 Primary" value={formatDate(record.immunizations?.covid19?.primary)} />
            <InfoItem label="COVID-19 Booster" value={formatDate(record.immunizations?.covid19?.booster)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
        isPediatric ? (
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
        ) : (
          <ObGyneOverview patient={patient} />
        )
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