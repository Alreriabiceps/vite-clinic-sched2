import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LoadingSpinner } from "../ui/loading-spinner";
import { X, Stethoscope } from "lucide-react";
import { patientsAPI } from "../../lib/api";
import { toast } from "../ui/toaster";

const AddConsultationModal = ({
  patientId,
  patientType,
  consultation,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!consultation;
  const [formData, setFormData] = useState(() => {
    if (isEditing && consultation) {
      // Pre-fill form with existing consultation data
      if (patientType === "pediatric") {
        return {
          date: consultation.date ? new Date(consultation.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          historyAndPE: consultation.historyAndPE || "",
          natureTxn: consultation.natureTxn || "",
          impression: consultation.impression || "",
        };
      } else {
        // OB-GYNE
        const historyPhysicalExam = consultation.historyPhysicalExam || "";
        const assessmentPlan = consultation.assessmentPlan || "";
        return {
          date: consultation.date ? new Date(consultation.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          bp: consultation.bp || "",
          pr: consultation.pr || "",
          rr: consultation.rr || "",
          temp: consultation.temp || "",
          weight: consultation.weight || "",
          bmi: consultation.bmi || "",
          aog: consultation.aog || "",
          fh: consultation.fh || "",
          fht: consultation.fht || "",
          internalExam: consultation.internalExam || "",
          history: consultation.history || historyPhysicalExam.split("|")[0] || "",
          physicalExam: consultation.physicalExam || historyPhysicalExam.split("|")[1] || "",
          assessment: consultation.assessment || assessmentPlan.split("|")[0] || "",
          plan: consultation.plan || assessmentPlan.split("|")[1] || "",
          nextAppointment: consultation.nextAppointment ? new Date(consultation.nextAppointment).toISOString().split("T")[0] : "",
        };
      }
    }

    const commonState = { date: new Date().toISOString().split("T")[0] };

    if (patientType === "pediatric") {
      return {
        ...commonState,
        historyAndPE: "",
        natureTxn: "",
        impression: "",
      };
    } else {
      // OB-GYNE
      return {
        ...commonState,
        bp: "",
        pr: "",
        rr: "",
        temp: "",
        weight: "",
        bmi: "",
        aog: "",
        fh: "",
        fht: "",
        internalExam: "",
        // Split fields
        history: "",
        physicalExam: "",
        assessment: "",
        plan: "",
        nextAppointment: "",
      };
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPediatric = patientType === "pediatric";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For OB-GYNE, combine split fields to match backend schema
      const payload = { ...formData };
      if (!isPediatric) {
        payload.historyPhysicalExam = `${formData.history || ""}`.trim() || "";
        if (formData.physicalExam) {
          payload.historyPhysicalExam = `${payload.historyPhysicalExam}${
            payload.historyPhysicalExam ? "\n\n" : ""
          }Physical Exam:\n${formData.physicalExam}`;
        }
        payload.assessmentPlan = `${formData.assessment || ""}`.trim() || "";
        if (formData.plan) {
          payload.assessmentPlan = `${payload.assessmentPlan}${
            payload.assessmentPlan ? "\n\n" : ""
          }Plan:\n${formData.plan}`;
        }
        // Remove split-only fields from payload
        delete payload.history;
        delete payload.physicalExam;
        delete payload.assessment;
        delete payload.plan;
      }

      if (isEditing && consultation?._id) {
        await patientsAPI.updateConsultation(patientId, consultation._id, payload);
        toast.success("Consultation record updated successfully!");
      } else {
        await patientsAPI.addConsultation(patientId, payload);
        toast.success("Consultation record added successfully!");
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding consultation:", error);
      setError("Failed to add consultation record. Please try again.");
      toast.error("Failed to add consultation record");
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
            <Input
              value={formData.bp}
              onChange={(e) => handleInputChange("bp", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">PR (bpm)</label>
            <Input
              value={formData.pr}
              onChange={(e) => handleInputChange("pr", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">RR (cpm)</label>
            <Input
              value={formData.rr}
              onChange={(e) => handleInputChange("rr", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Temp (°C)</label>
            <Input
              value={formData.temp}
              onChange={(e) => handleInputChange("temp", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Weight (kg)</label>
            <Input
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">BMI (kg/m²)</label>
            <Input
              value={formData.bmi}
              onChange={(e) => handleInputChange("bmi", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">AOG (cm)</label>
            <Input
              value={formData.aog}
              onChange={(e) => handleInputChange("aog", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">FH (cm)</label>
            <Input
              value={formData.fh}
              onChange={(e) => handleInputChange("fh", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">FHT (bpm)</label>
            <Input
              value={formData.fht}
              onChange={(e) => handleInputChange("fht", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Internal Exam
          </label>
          <textarea
            value={formData.internalExam}
            onChange={(e) => handleInputChange("internalExam", e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
          ></textarea>
        </div>
      </div>

      {/* Right Column: Notes & Plan */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            History
          </label>
          <textarea
            value={formData.history}
            onChange={(e) => handleInputChange("history", e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={5}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Physical Examination
          </label>
          <textarea
            value={formData.physicalExam}
            onChange={(e) => handleInputChange("physicalExam", e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={5}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment
          </label>
          <textarea
            value={formData.assessment}
            onChange={(e) => handleInputChange("assessment", e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan
          </label>
          <textarea
            value={formData.plan}
            onChange={(e) => handleInputChange("plan", e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Next Appointment
          </label>
          <Input
            type="date"
            value={formData.nextAppointment}
            onChange={(e) =>
              handleInputChange("nextAppointment", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderPediatricForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          History & Physical Examination
        </label>
        <textarea
          value={formData.historyAndPE}
          onChange={(e) => handleInputChange("historyAndPE", e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={6}
          placeholder="Enter history and physical examination findings..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nature of Transaction
        </label>
        <textarea
          value={formData.natureTxn}
          onChange={(e) => handleInputChange("natureTxn", e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={4}
          placeholder="Enter nature of transaction..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Impression/Diagnosis
        </label>
        <textarea
          value={formData.impression}
          onChange={(e) => handleInputChange("impression", e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={4}
          placeholder="Enter impression or diagnosis..."
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b py-4">
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>{isEditing ? "Edit Consultation Record" : "Add Consultation Record"}</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>

              {isPediatric ? renderPediatricForm() : renderObGyneForm()}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    "Save Record"
                  )}
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
