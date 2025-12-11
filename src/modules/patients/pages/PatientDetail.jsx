import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  LoadingSpinner,
  Badge,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  patientsAPI,
  appointmentsAPI,
  formatDate,
  calculateAge,
  getStatusColor,
  toast,
  EditObGynePatientModal,
  EditPediatricPatientModal,
  AddConsultationModal,
  AddImmunizationModal,
  DeleteConfirmationModal,
} from "../../shared";
import { ObGyneOverview, PediatricOverview } from "../components/patient-views";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Baby,
  User,
  Activity,
  FileText,
  Syringe,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Beaker,
  Save,
  X,
  Edit3,
  Lock,
  Unlock,
} from "lucide-react";
// Helper component for displaying info items
const InfoItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="text-sm text-gray-900">{value || "N/A"}</p>
  </div>
);

// Helper for boolean/checkbox items
const ChecklistItem = ({ label, checked }) => (
  <div className="flex items-center">
    {checked ? (
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
    ) : (
      <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
    )}
    <span
      className={checked ? "text-sm text-gray-800" : "text-sm text-gray-500"}
    >
      {label}
    </span>
  </div>
);

const PatientOverview = ({ patient }) => {
  if (!patient) return null;

  switch (patient.patientType) {
    case "ob-gyne":
      return <ObGyneOverview patient={patient} />;
    case "pediatric":
      return <PediatricOverview patient={patient} />;
    default:
      return <div>Unknown patient type</div>;
  }
};

const MedicalRecordsTab = ({ patient, onEditConsultation, onDeleteConsultation, onEditImmunization, onDeleteImmunization, fetchPatient }) => {
  const consultations =
    patient.patientType === "ob-gyne"
      ? patient.obGyneRecord?.consultations
      : patient.pediatricRecord?.consultations;

  const immunizations = patient.patientType === "pediatric"
    ? patient.pediatricRecord?.immunizations
    : null;

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
        <InfoItem
          label="History/Physical Exam"
          value={consultation.historyPhysicalExam}
        />
        <InfoItem label="Assessment/Plan" value={consultation.assessmentPlan} />
        <InfoItem
          label="Next Appointment"
          value={formatDate(consultation.nextAppointment)}
        />
      </div>
    </div>
  );

  // A renderer for pediatric consultations would go here

  return (
    <div className="space-y-4">
      {/* Consultations */}
      {consultations && consultations.length > 0 ? (
        consultations
          .slice()
          .reverse()
          .map((consultation) => (
            <Card key={consultation._id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Consultation on {formatDate(consultation.date)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditConsultation(consultation)}
                      className="h-8 px-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteConsultation(consultation._id)}
                      className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {patient.patientType === "ob-gyne" ? (
                  renderObGyneConsultation(consultation)
                ) : (
                  <p>Pediatric record view.</p>
                )}
              </CardContent>
            </Card>
          ))
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">No consultation records found.</p>
        </div>
      )}

      {/* Immunizations (Pediatric only) */}
      {patient.patientType === "pediatric" && immunizations && immunizations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Immunization Records</h3>
          <div className="space-y-4">
            {immunizations
              .slice()
              .reverse()
              .map((immunization) => (
                <Card key={immunization._id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {immunization.vaccineName || 'Immunization'} - {formatDate(immunization.date)}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditImmunization(immunization)}
                          className="h-8 px-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteImmunization(immunization._id)}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {immunization.batchNumber && (
                        <InfoItem label="Batch Number" value={immunization.batchNumber} />
                      )}
                      {immunization.manufacturer && (
                        <InfoItem label="Manufacturer" value={immunization.manufacturer} />
                      )}
                      {immunization.site && (
                        <InfoItem label="Site" value={immunization.site} />
                      )}
                      {immunization.route && (
                        <InfoItem label="Route" value={immunization.route} />
                      )}
                      {immunization.notes && (
                        <InfoItem label="Notes" value={immunization.notes} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [immunizationModalOpen, setImmunizationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [editingImmunization, setEditingImmunization] = useState(null);
  const [deletingConsultationId, setDeletingConsultationId] = useState(null);
  const [deletingImmunizationId, setDeletingImmunizationId] = useState(null);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);
  const [diagnosisValue, setDiagnosisValue] = useState("");
  const [savingDiagnosis, setSavingDiagnosis] = useState(false);
  const [nextApptOpen, setNextApptOpen] = useState(false);
  const [nextAppt, setNextAppt] = useState({
    appointmentDate: new Date().toISOString().split("T")[0],
    appointmentTime: "09:00 AM",
    doctorName: "",
    serviceType: "",
    reasonForVisit: "",
  });
  const [unlocking, setUnlocking] = useState(false);

  const deriveDoctorName = (p, appts) => {
    if (!p) return "Dr. Maria Sarah L. Manaloto";
    // Prefer last appointment's doctor if available
    if (appts && appts.length > 0) {
      const last = appts[appts.length - 1];
      if (last?.doctorName) return last.doctorName;
    }
    // Fallback by patient type
    return p.patientType === "pediatric"
      ? "Dr. Shara Laine S. Vino"
      : "Dr. Maria Sarah L. Manaloto";
  };

  const obgyneServices = [
    "PRENATAL_CHECKUP",
    "POSTNATAL_CHECKUP",
    "CHILDBIRTH_CONSULTATION",
    "DILATATION_CURETTAGE",
    "FAMILY_PLANNING",
    "PAP_SMEAR",
    "WOMEN_VACCINATION",
    "PCOS_CONSULTATION",
    "STI_CONSULTATION",
    "INFERTILITY_CONSULTATION",
    "MENOPAUSE_CONSULTATION",
  ];
  const pediatricServices = [
    "NEWBORN_CONSULTATION",
    "WELL_BABY_CHECKUP",
    "WELL_CHILD_CHECKUP",
    "PEDIATRIC_EVALUATION",
    "CHILD_VACCINATION",
    "EAR_PIERCING",
    "PEDIATRIC_REFERRAL",
  ];

  const isDoctorAvailable = (doctorName, dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    const dow = d.getDay();
    if (doctorName.includes("Manaloto")) {
      return [1, 3, 5].includes(dow); // Mon, Wed, Fri
    }
    if (doctorName.includes("Vino")) {
      return [1, 2, 4].includes(dow); // Mon, Tue, Thu
    }
    return true;
  };

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
      console.log("Patient data:", patientResponse.data);
      setPatient(patientResponse.data);

      // Then get appointments using the patient's patientId field
      const appointmentsResponse = await appointmentsAPI.getAll({
        patientId: patientResponse.data.patientId,
      });
      console.log(
        "Fetching appointments for patientId:",
        patientResponse.data.patientId
      );
      setAppointments(appointmentsResponse.data?.data?.appointments || []);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    toast.success("Patient updated successfully");
    fetchPatientData(); // Always refresh from backend
  };

  const handleMedicalRecordAdded = () => {
    fetchPatientData(); // Refresh data to show new record
    setConsultationModalOpen(false);
    setImmunizationModalOpen(false);
    setEditingConsultation(null);
    setEditingImmunization(null);
  };

  const handleEditConsultation = (consultation) => {
    setEditingConsultation(consultation);
    setConsultationModalOpen(true);
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (!window.confirm("Are you sure you want to delete this consultation record?")) {
      return;
    }
    try {
      await patientsAPI.deleteConsultation(patientId, consultationId);
      toast.success("Consultation record deleted successfully");
      fetchPatientData();
    } catch (error) {
      console.error("Error deleting consultation:", error);
      toast.error("Failed to delete consultation record");
    }
  };

  const handleEditImmunization = (immunization) => {
    setEditingImmunization(immunization);
    setImmunizationModalOpen(true);
  };

  const handleDeleteImmunization = async (immunizationId) => {
    if (!window.confirm("Are you sure you want to delete this immunization record?")) {
      return;
    }
    try {
      await patientsAPI.deleteImmunization(patientId, immunizationId);
      toast.success("Immunization record deleted successfully");
      fetchPatientData();
    } catch (error) {
      console.error("Error deleting immunization:", error);
      toast.error("Failed to delete immunization record");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await patientsAPI.delete(patientId);
      toast.success("Patient deleted successfully");
      navigate("/patients");
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete patient");
    }
    setDeleteModalOpen(false);
  };

  const handleEditDiagnosis = (appointmentId, currentDiagnosis) => {
    setEditingDiagnosis(appointmentId);
    setDiagnosisValue(currentDiagnosis || "");
  };

  const handleSaveDiagnosis = async (appointmentId) => {
    setSavingDiagnosis(true);
    try {
      await appointmentsAPI.updateDiagnosis(appointmentId, diagnosisValue);

      // Update the local appointments state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId
            ? { ...apt, diagnosis: diagnosisValue }
            : apt
        )
      );

      setEditingDiagnosis(null);
      setDiagnosisValue("");
      toast.success("Diagnosis updated successfully");
    } catch (error) {
      console.error("Error updating diagnosis:", error);
      toast.error("Failed to update diagnosis");
    } finally {
      setSavingDiagnosis(false);
    }
  };

  const handleCancelDiagnosis = () => {
    setEditingDiagnosis(null);
    setDiagnosisValue("");
  };

  const handleUnlockAppointments = async () => {
    if (!patient) return;
    try {
      setUnlocking(true);
      await patientsAPI.unlockAppointments(patient._id);
      toast.success("Appointment booking unlocked for this patient");
      await fetchPatientData();
    } catch (error) {
      console.error("Error unlocking appointments:", error);
      toast.error("Failed to unlock appointments");
    } finally {
      setUnlocking(false);
    }
  };

  const getPatientName = (patient) => {
    if (!patient) return "Unknown Patient";

    if (patient.patientType === "pediatric") {
      return patient.pediatricRecord?.nameOfChildren || "Pediatric Patient";
    } else {
      return patient.obGyneRecord?.patientName || "OB-GYNE Patient";
    }
  };

  const getPatientInfo = (patient) => {
    if (!patient) return {};

    if (patient.patientType === "pediatric") {
      const record = patient.pediatricRecord || {};
      return {
        name: record.nameOfChildren || "N/A",
        motherName: record.nameOfMother || "N/A",
        fatherName: record.nameOfFather || "N/A",
        contactNumber: record.contactNumber || "N/A",
        address: record.address || "N/A",
        birthDate: record.birthDate,
        birthWeight: record.birthWeight || "N/A",
        birthLength: record.birthLength || "N/A",
      };
    } else {
      const record = patient.obGyneRecord || {};
      return {
        name: record.patientName || "N/A",
        contactNumber: record.contactNumber || "N/A",
        address: record.address || "N/A",
        birthDate: record.birthDate,
        civilStatus: record.civilStatus || "N/A",
        occupation: record.occupation || "N/A",
      };
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Patient Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The patient you're looking for doesn't exist.
        </p>
        <Button
          onClick={() => navigate("/patients")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
      </div>
    );
  }

  const patientInfo = getPatientInfo(patient);
  const isPediatric = patient.patientType === "pediatric";
  const isBookingLocked = !!patient.appointmentLocked;
  const noShowCount = patient.noShowCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/patients")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getPatientName(patient)}
            </h1>
            <div className="flex items-center space-x-3 mt-1">
              <Badge className={getStatusBadgeColor(patient.status)}>
                {patient.status || "New"}
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                {isPediatric ? (
                  <Baby className="h-3 w-3" />
                ) : (
                  <Heart className="h-3 w-3" />
                )}
                <span>{isPediatric ? "Pediatric" : "OB-GYNE"}</span>
              </Badge>
              <span className="text-sm text-gray-500">
                ID: {patient.patientId}
              </span>
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
          {isBookingLocked && (
            <Button
              variant="clinic"
              onClick={handleUnlockAppointments}
              disabled={unlocking}
              className="flex items-center space-x-2"
            >
              {unlocking ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
              <span>Unlock Appointment</span>
            </Button>
          )}
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

      {isBookingLocked && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <Lock className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">
              Booking locked after {noShowCount} no-shows.
            </p>
            <p className="text-sm text-red-700">
              This patient cannot book new appointments until unlocked.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleUnlockAppointments}
            disabled={unlocking}
            className="text-red-700 border-red-200 hover:bg-red-100"
          >
            {unlocking ? <LoadingSpinner size="sm" /> : <Unlock className="h-4 w-4 mr-1" />}
            Unlock
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {["overview", "medical-records", "appointments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "medical-records" && "Medical Records"}
              {tab === "appointments" && "Appointments"}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && <PatientOverview patient={patient} />}

        {activeTab === "medical-records" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Consultation History
              </h2>
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
            <MedicalRecordsTab 
              patient={patient} 
              onEditConsultation={handleEditConsultation}
              onDeleteConsultation={handleDeleteConsultation}
              onEditImmunization={handleEditImmunization}
              onDeleteImmunization={handleDeleteImmunization}
              fetchPatient={fetchPatientData}
            />
          </div>
        )}

        {activeTab === "appointments" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Appointment History</span>
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    const dn = deriveDoctorName(patient, appointments);
                    setNextAppt((prev) => ({ ...prev, doctorName: dn }));
                    setNextApptOpen(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Next Appointment</span>
                </Button>
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
                                onChange={(e) =>
                                  setDiagnosisValue(e.target.value)
                                }
                                placeholder="Enter diagnosis..."
                                className="flex-1 p-2 border border-gray-300 rounded-md resize-none"
                                rows="2"
                                autoFocus
                              />
                              <div className="flex flex-col space-y-1">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleSaveDiagnosis(appointment._id)
                                  }
                                  disabled={savingDiagnosis}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1"
                                >
                                  {savingDiagnosis ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <Save className="h-3 w-3" />
                                  )}
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
                                  {appointment.diagnosis ||
                                    "No diagnosis provided"}
                                </h4>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleEditDiagnosis(
                                    appointment._id,
                                    appointment.diagnosis
                                  )
                                }
                                className="px-2 py-1 text-blue-600 hover:text-blue-700"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600">
                          {appointment.doctorName?.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`} •{" "}
                          {formatDate(appointment.appointmentDate)} at{" "}
                          {appointment.appointmentTime}
                        </p>
                        {appointment.reasonForVisit && (
                          <p className="text-sm text-gray-600 mt-1">
                            Reason: {appointment.reasonForVisit}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`${getStatusColor(appointment.status)} ml-2`}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No appointments found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Next Appointment Modal */}
      <Dialog open={nextApptOpen} onOpenChange={setNextApptOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Schedule Next Appointment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>Doctor</Label>
              <div className="mt-1 w-full border rounded-md p-2 bg-gray-50 text-gray-700">
                {nextAppt.doctorName || "—"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={nextAppt.appointmentDate}
                  onChange={(e) =>
                    setNextAppt({
                      ...nextAppt,
                      appointmentDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <select
                  id="time"
                  className="mt-1 w-full border rounded-md p-2"
                  value={nextAppt.appointmentTime}
                  onChange={(e) =>
                    setNextAppt({
                      ...nextAppt,
                      appointmentTime: e.target.value,
                    })
                  }
                >
                  {[
                    "09:00 AM",
                    "09:30 AM",
                    "10:00 AM",
                    "10:30 AM",
                    "11:00 AM",
                    "11:30 AM",
                    "01:00 PM",
                    "01:30 PM",
                    "02:00 PM",
                    "02:30 PM",
                    "03:00 PM",
                    "03:30 PM",
                    "04:00 PM",
                    "04:30 PM",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="service">Service</Label>
              <select
                id="service"
                className="mt-1 w-full border rounded-md p-2"
                value={nextAppt.serviceType}
                onChange={(e) =>
                  setNextAppt({ ...nextAppt, serviceType: e.target.value })
                }
              >
                {(patient?.patientType === "ob-gyne"
                  ? obgyneServices
                  : pediatricServices
                ).map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="Reason for visit"
                value={nextAppt.reasonForVisit}
                onChange={(e) =>
                  setNextAppt({ ...nextAppt, reasonForVisit: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNextApptOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!patient) return;
                try {
                  const doctorType =
                    patient.patientType === "ob-gyne" ? "ob-gyne" : "pediatric";
                  const payload = {
                    patientId: patient.patientId,
                    doctorType,
                    doctorName: nextAppt.doctorName,
                    appointmentDate: nextAppt.appointmentDate,
                    appointmentTime: nextAppt.appointmentTime,
                    serviceType: nextAppt.serviceType || "REGULAR_CHECKUP",
                    contactInfo: {
                      primaryPhone:
                        patient.contactNumber || patient.phoneNumber || "N/A",
                    },
                    reasonForVisit: nextAppt.reasonForVisit || "",
                  };
                  // Validate doctor availability client-side to avoid 500s
                  if (
                    !isDoctorAvailable(
                      nextAppt.doctorName,
                      nextAppt.appointmentDate
                    )
                  ) {
                    toast.error(
                      "Selected doctor is not available on this date"
                    );
                    return;
                  }
                  if (!payload.serviceType) {
                    toast.error("Please select a valid service");
                    return;
                  }
                  await appointmentsAPI.create(payload);
                  toast.success("Next appointment scheduled");
                  setNextApptOpen(false);
                  fetchPatientData();
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to schedule appointment");
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {editModalOpen && patient.patientType === "ob-gyne" && (
        <EditObGynePatientModal
          patient={patient}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {editModalOpen && patient.patientType === "pediatric" && (
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
          consultation={editingConsultation}
          onClose={() => {
            setConsultationModalOpen(false);
            setEditingConsultation(null);
          }}
          onSuccess={handleMedicalRecordAdded}
        />
      )}

      {immunizationModalOpen && isPediatric && (
        <AddImmunizationModal
          patientId={patientId}
          immunization={editingImmunization}
          onClose={() => {
            setImmunizationModalOpen(false);
            setEditingImmunization(null);
          }}
          onSuccess={handleMedicalRecordAdded}
        />
      )}

      {deleteModalOpen && (
        <DeleteConfirmationModal
          title="Delete Patient"
          message={`Are you sure you want to delete ${getPatientName(
            patient
          )}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PatientDetail;
