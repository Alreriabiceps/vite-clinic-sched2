import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  X,
  User,
  Baby,
  Heart,
  Stethoscope,
  ShieldCheck,
  Beaker,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { patientsAPI } from "../../lib/api";
import { toast } from "../ui/toaster";
import { Checkbox } from "../ui/checkbox";

const EditObGynePatientModal = ({ patient, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (patient && patient.obGyneRecord) {
      // Initialize nested objects if they don't exist
      const record = patient.obGyneRecord;
      const initializedRecord = {
        ...record,
        emergencyContact: record.emergencyContact ||
          patient.contactInfo?.emergencyContact || {
            name: "",
            contactNumber: "",
          },
        pastMedicalHistory: record.pastMedicalHistory || {},
        familyHistory: record.familyHistory || {},
        gynecologicHistory: record.gynecologicHistory || {},
        obstetricHistory: record.obstetricHistory || [],
        immunizations: record.immunizations || {},
        baselineDiagnostics: record.baselineDiagnostics || { cbc: {} },
      };
      setFormData(initializedRecord);
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    const keys = name.split(".");
    if (keys.length > 1) {
      setFormData((prev) => {
        const newState = { ...prev };
        let current = newState;
        for (let i = 0; i < keys.length - 1; i++) {
          // Initialize nested object if it doesn't exist
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = val;

        // Auto-calculate AOG when LMP is entered
        if (name === "gynecologicHistory.lmp" && val) {
          console.log("AOG Calculation triggered for LMP:", val);

          // Ensure gynecologicHistory exists
          if (!newState.gynecologicHistory) {
            newState.gynecologicHistory = {};
          }

          const lmpDate = new Date(val);
          const today = new Date();
          const diffTime = today - lmpDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(diffDays / 7);
          const days = diffDays % 7;

          console.log(
            "LMP Date:",
            lmpDate,
            "Today:",
            today,
            "Diff Days:",
            diffDays
          );

          // Handle both past and future dates
          if (diffDays >= 0) {
            const weekText = weeks === 1 ? "week" : "weeks";
            const dayText = days === 1 ? "day" : "days";
            newState.gynecologicHistory.aog = `${weeks} ${weekText} ${days} ${dayText}`;
          } else {
            // For future dates (which shouldn't happen in real scenarios)
            const absDays = Math.abs(diffDays);
            const absWeeks = Math.floor(absDays / 7);
            const remainingDays = absDays % 7;
            const weekText = absWeeks === 1 ? "week" : "weeks";
            const dayText = remainingDays === 1 ? "day" : "days";
            newState.gynecologicHistory.aog = `Future date: ${absWeeks} ${weekText} ${remainingDays} ${dayText} ahead`;
          }

          console.log("Calculated AOG:", newState.gynecologicHistory.aog);

          // Auto-calculate EDD by LMP (LMP + 280 days)
          const eddDate = new Date(lmpDate);
          eddDate.setDate(eddDate.getDate() + 280);
          const eddDateString = eddDate.toISOString().split("T")[0];
          newState.gynecologicHistory.eddByLmp = eddDateString;
          // Also set the main EDD field
          newState.gynecologicHistory.edd = eddDate.toISOString();

          console.log("Calculated EDD:", eddDateString);
        }

        return newState;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const addObstetricHistory = () => {
    setFormData((prev) => ({
      ...prev,
      obstetricHistory: [
        ...(prev.obstetricHistory || []),
        {
          year: "",
          place: "",
          typeOfDelivery: "",
          bw: "",
          complications: "",
        },
      ],
    }));
  };

  const removeObstetricHistory = (index) => {
    setFormData((prev) => ({
      ...prev,
      obstetricHistory:
        prev.obstetricHistory?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean the form data: convert empty strings to null
      let cleanedForm = JSON.parse(JSON.stringify(formData), (key, value) =>
        value === "" ? null : value
      );

      // Convert number fields to numbers (or null)
      const toNumberOrNull = (v) =>
        v === null || v === undefined || v === ""
          ? null
          : isNaN(Number(v))
          ? null
          : Number(v);
      cleanedForm.age = toNumberOrNull(cleanedForm.age);
      if (cleanedForm.gynecologicHistory) {
        cleanedForm.gynecologicHistory.gravidity = toNumberOrNull(
          cleanedForm.gynecologicHistory.gravidity
        );
        cleanedForm.gynecologicHistory.parity = toNumberOrNull(
          cleanedForm.gynecologicHistory.parity
        );
        cleanedForm.gynecologicHistory.menarche = toNumberOrNull(
          cleanedForm.gynecologicHistory.menarche
        );
        cleanedForm.gynecologicHistory.intervalDays = toNumberOrNull(
          cleanedForm.gynecologicHistory.intervalDays
        );
        cleanedForm.gynecologicHistory.durationDays = toNumberOrNull(
          cleanedForm.gynecologicHistory.durationDays
        );
        cleanedForm.gynecologicHistory.coitarche = toNumberOrNull(
          cleanedForm.gynecologicHistory.coitarche
        );
        cleanedForm.gynecologicHistory.sexualPartners = toNumberOrNull(
          cleanedForm.gynecologicHistory.sexualPartners
        );
      }
      if (Array.isArray(cleanedForm.obstetricHistory)) {
        cleanedForm.obstetricHistory = cleanedForm.obstetricHistory.map(
          (row) => ({
            ...row,
            year: toNumberOrNull(row.year),
          })
        );
      }
      // Build the payload: move emergencyContact to contactInfo
      const dataToSend = {
        obGyneRecord: { ...cleanedForm, emergencyContact: undefined },
        contactInfo: { emergencyContact: cleanedForm.emergencyContact },
      };

      console.log("Sending update data:", JSON.stringify(dataToSend, null, 2));

      await patientsAPI.update(patient._id, dataToSend);

      toast.success("Patient updated successfully!");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating patient:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update patient. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Guard against rendering with no data
  if (!formData.patientName) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b sticky top-0 bg-white z-10 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-pink-600" />
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    Edit OB-GYNE Patient
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Update patient information and medical records
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Personal Information Section */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Patient Name *
                      </label>
                      <Input
                        name="patientName"
                        value={formData.patientName || ""}
                        onChange={handleChange}
                        placeholder="Full name"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Age
                      </label>
                      <Input
                        name="age"
                        value={formData.age || ""}
                        onChange={handleChange}
                        placeholder="Age"
                        type="number"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Date of Birth
                      </label>
                      <Input
                        name="birthDate"
                        value={formData.birthDate?.split("T")[0] || ""}
                        onChange={handleChange}
                        type="date"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <Input
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        placeholder="Complete address"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Contact Number
                      </label>
                      <Input
                        name="contactNumber"
                        value={formData.contactNumber || ""}
                        onChange={handleChange}
                        placeholder="Phone number"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Occupation
                      </label>
                      <Input
                        name="occupation"
                        value={formData.occupation || ""}
                        onChange={handleChange}
                        placeholder="Occupation"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Civil Status
                      </label>
                      <select
                        name="civilStatus"
                        value={formData.civilStatus || ""}
                        onChange={handleChange}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Civil Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Religion
                      </label>
                      <Input
                        name="religion"
                        value={formData.religion || ""}
                        onChange={handleChange}
                        placeholder="Religion"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Referred By
                      </label>
                      <Input
                        name="referredBy"
                        value={formData.referredBy || ""}
                        onChange={handleChange}
                        placeholder="Referred by"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Emergency Contact Person
                      </label>
                      <Input
                        name="emergencyContact.name"
                        value={formData.emergencyContact?.name || ""}
                        onChange={handleChange}
                        placeholder="Contact person name"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Emergency Contact Number
                      </label>
                      <Input
                        name="emergencyContact.contactNumber"
                        value={formData.emergencyContact?.contactNumber || ""}
                        onChange={handleChange}
                        placeholder="Contact number"
                        className="h-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* History Section */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 text-base border-b pb-2">
                        Past Medical History
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            name="pastMedicalHistory.hypertension"
                            checked={
                              formData.pastMedicalHistory?.hypertension || false
                            }
                            onCheckedChange={(c) =>
                              handleChange({
                                target: {
                                  name: "pastMedicalHistory.hypertension",
                                  value: c,
                                  type: "checkbox",
                                  checked: c,
                                },
                              })
                            }
                          />
                          <span className="text-gray-700">Hypertension</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            name="pastMedicalHistory.diabetes"
                            checked={
                              formData.pastMedicalHistory?.diabetes || false
                            }
                            onCheckedChange={(c) =>
                              handleChange({
                                target: {
                                  name: "pastMedicalHistory.diabetes",
                                  value: c,
                                  type: "checkbox",
                                  checked: c,
                                },
                              })
                            }
                          />
                          <span className="text-gray-700">Diabetes</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            name="pastMedicalHistory.bronchialAsthma"
                            checked={
                              formData.pastMedicalHistory?.bronchialAsthma ||
                              false
                            }
                            onCheckedChange={(c) =>
                              handleChange({
                                target: {
                                  name: "pastMedicalHistory.bronchialAsthma",
                                  value: c,
                                  type: "checkbox",
                                  checked: c,
                                },
                              })
                            }
                          />
                          <span className="text-gray-700">
                            Bronchial Asthma
                          </span>
                        </label>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Last Attack Date
                          </label>
                          <Input
                            name="pastMedicalHistory.lastAttack"
                            value={
                              formData.pastMedicalHistory?.lastAttack?.split(
                                "T"
                              )[0] || ""
                            }
                            onChange={handleChange}
                            type="date"
                            className="h-10"
                          />
                        </div>
                        <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            name="pastMedicalHistory.heartDisease"
                            checked={
                              formData.pastMedicalHistory?.heartDisease || false
                            }
                            onCheckedChange={(c) =>
                              handleChange({
                                target: {
                                  name: "pastMedicalHistory.heartDisease",
                                  value: c,
                                  type: "checkbox",
                                  checked: c,
                                },
                              })
                            }
                          />
                          <span className="text-gray-700">Heart Disease</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            name="pastMedicalHistory.thyroidDisease"
                            checked={
                              formData.pastMedicalHistory?.thyroidDisease ||
                              false
                            }
                            onCheckedChange={(c) =>
                              handleChange({
                                target: {
                                  name: "pastMedicalHistory.thyroidDisease",
                                  value: c,
                                  type: "checkbox",
                                  checked: c,
                                },
                              })
                            }
                          />
                          <span className="text-gray-700">Thyroid Disease</span>
                        </label>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Previous Surgery Date
                          </label>
                          <Input
                            name="pastMedicalHistory.previousSurgery"
                            value={
                              formData.pastMedicalHistory?.previousSurgery?.split(
                                "T"
                              )[0] || ""
                            }
                            onChange={handleChange}
                            type="date"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Allergies
                          </label>
                          <Input
                            name="pastMedicalHistory.allergies"
                            value={formData.pastMedicalHistory?.allergies || ""}
                            onChange={handleChange}
                            placeholder="List any allergies"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Others
                          </label>
                          <textarea
                            name="pastMedicalHistory.others"
                            value={formData.pastMedicalHistory?.others || ""}
                            onChange={handleChange}
                            placeholder="Any other medical conditions or history not listed above..."
                            className="w-full p-3 border rounded-md text-sm min-h-[80px] resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 text-base border-b pb-2">
                        Personal / Social History
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            name="familyHistory.smoker"
                            checked={formData.familyHistory?.smoker || false}
                            onCheckedChange={(c) =>
                              handleChange({
                                target: {
                                  name: "familyHistory.smoker",
                                  value: c,
                                  type: "checkbox",
                                  checked: c,
                                },
                              })
                            }
                          />
                          <span className="text-gray-700">Smoker</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            name="familyHistory.alcohol"
                            checked={formData.familyHistory?.alcohol || false}
                            onCheckedChange={(c) =>
                              handleChange({
                                target: {
                                  name: "familyHistory.alcohol",
                                  value: c,
                                  type: "checkbox",
                                  checked: c,
                                },
                              })
                            }
                          />
                          <span className="text-gray-700">Alcohol</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            name="familyHistory.drugs"
                            checked={formData.familyHistory?.drugs || false}
                            onCheckedChange={(c) =>
                              handleChange({
                                target: {
                                  name: "familyHistory.drugs",
                                  value: c,
                                  type: "checkbox",
                                  checked: c,
                                },
                              })
                            }
                          />
                          <span className="text-gray-700">Drugs</span>
                        </label>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Others
                          </label>
                          <textarea
                            name="familyHistory.others"
                            value={formData.familyHistory?.others || ""}
                            onChange={handleChange}
                            placeholder="Any other personal or social history not listed above..."
                            className="w-full p-3 border rounded-md text-sm min-h-[80px] resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Obstetric History Table */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <Baby className="h-5 w-5 text-blue-600" />
                    Obstetric History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-3 text-left text-sm font-semibold text-gray-700">
                              Year
                            </th>
                            <th className="border border-gray-300 p-3 text-left text-sm font-semibold text-gray-700">
                              Place
                            </th>
                            <th className="border border-gray-300 p-3 text-left text-sm font-semibold text-gray-700">
                              Type of Delivery
                            </th>
                            <th className="border border-gray-300 p-3 text-left text-sm font-semibold text-gray-700">
                              Birth Weight
                            </th>
                            <th className="border border-gray-300 p-3 text-left text-sm font-semibold text-gray-700">
                              Complications
                            </th>
                            <th className="border border-gray-300 p-3 text-center text-sm font-semibold text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.obstetricHistory?.map((history, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 p-2">
                                <Input
                                  name={`obstetricHistory.${index}.year`}
                                  value={history.year || ""}
                                  onChange={handleChange}
                                  placeholder="Year"
                                  className="border-0 shadow-none focus:ring-0 h-8 text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <Input
                                  name={`obstetricHistory.${index}.place`}
                                  value={history.place || ""}
                                  onChange={handleChange}
                                  placeholder="Place"
                                  className="border-0 shadow-none focus:ring-0 h-8 text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <Input
                                  name={`obstetricHistory.${index}.typeOfDelivery`}
                                  value={history.typeOfDelivery || ""}
                                  onChange={handleChange}
                                  placeholder="Type"
                                  className="border-0 shadow-none focus:ring-0 h-8 text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <Input
                                  name={`obstetricHistory.${index}.bw`}
                                  value={history.bw || ""}
                                  onChange={handleChange}
                                  placeholder="BW"
                                  className="border-0 shadow-none focus:ring-0 h-8 text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <Input
                                  name={`obstetricHistory.${index}.complications`}
                                  value={history.complications || ""}
                                  onChange={handleChange}
                                  placeholder="Complications"
                                  className="border-0 shadow-none focus:ring-0 h-8 text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeObstetricHistory(index)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addObstetricHistory}
                        className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add Obstetric History Entry
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gynecologic History */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <Heart className="h-5 w-5 text-blue-600" />
                    Gynecologic History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          OB Score
                        </label>
                        <Input
                          name="gynecologicHistory.obScore"
                          value={formData.gynecologicHistory?.obScore || ""}
                          onChange={handleChange}
                          placeholder="OB Score"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Gravida
                        </label>
                        <Input
                          name="gynecologicHistory.gravida"
                          value={formData.gynecologicHistory?.gravida || ""}
                          onChange={handleChange}
                          placeholder="Gravida"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Para
                        </label>
                        <Input
                          name="gynecologicHistory.para"
                          value={formData.gynecologicHistory?.para || ""}
                          onChange={handleChange}
                          placeholder="Para"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Abortion
                        </label>
                        <Input
                          name="gynecologicHistory.abortion"
                          value={formData.gynecologicHistory?.abortion || ""}
                          onChange={handleChange}
                          placeholder="Abortion"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-800 border-b pb-2">
                          Menstrual History
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Last Menstrual Period (LMP)
                            </label>
                            <Input
                              name="gynecologicHistory.lmp"
                              value={
                                formData.gynecologicHistory?.lmp?.split(
                                  "T"
                                )[0] || ""
                              }
                              onChange={handleChange}
                              type="date"
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Age of Gestation (AOG)
                            </label>
                            <Input
                              name="gynecologicHistory.aog"
                              value={formData.gynecologicHistory?.aog || ""}
                              onChange={handleChange}
                              placeholder="Auto-calculated"
                              className="h-10 bg-gray-50"
                              readOnly
                            />
                            <p className="text-xs text-gray-500">
                              Auto-calculated based on LMP
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Expected Date of Delivery (EDD)
                            </label>
                            <Input
                              name="gynecologicHistory.edd"
                              value={
                                formData.gynecologicHistory?.edd?.split(
                                  "T"
                                )[0] || ""
                              }
                              onChange={handleChange}
                              type="date"
                              className="h-10 bg-gray-50"
                              readOnly
                            />
                            <p className="text-xs text-gray-500">
                              Auto-calculated based on LMP
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-800 border-b pb-2">
                          Screening History
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Last Pap Smear Date
                            </label>
                            <Input
                              name="gynecologicHistory.lastPapSmear.date"
                              value={
                                formData.gynecologicHistory?.lastPapSmear?.date?.split(
                                  "T"
                                )[0] || ""
                              }
                              onChange={handleChange}
                              type="date"
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Pap Smear Result
                            </label>
                            <Input
                              name="gynecologicHistory.lastPapSmear.result"
                              value={
                                formData.gynecologicHistory?.lastPapSmear
                                  ?.result || ""
                              }
                              onChange={handleChange}
                              placeholder="Result"
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Baseline Diagnostics */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <Beaker className="h-5 w-5 text-blue-600" />
                    Baseline Diagnostics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 border-b pb-2">
                        Complete Blood Count (CBC)
                      </h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Hemoglobin (Hgb)
                        </label>
                        <Input
                          name="baselineDiagnostics.cbc.hgb"
                          value={formData.baselineDiagnostics?.cbc?.hgb || ""}
                          onChange={handleChange}
                          placeholder="Hgb value"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Hematocrit (Hct)
                        </label>
                        <Input
                          name="baselineDiagnostics.cbc.hct"
                          value={formData.baselineDiagnostics?.cbc?.hct || ""}
                          onChange={handleChange}
                          placeholder="Hct value"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 border-b pb-2">
                        Urinalysis
                      </h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Urinalysis Result
                        </label>
                        <Input
                          name="baselineDiagnostics.urinalysis"
                          value={
                            formData.baselineDiagnostics?.urinalysis || ""
                          }
                          onChange={handleChange}
                          placeholder="Urinalysis result"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 border-b pb-2">
                        Blood Tests
                      </h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Blood Type
                        </label>
                        <Input
                          name="baselineDiagnostics.bloodType"
                          value={
                            formData.baselineDiagnostics?.bloodType || ""
                          }
                          onChange={handleChange}
                          placeholder="Blood Type"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          VDRL/RPR
                        </label>
                        <Input
                          name="baselineDiagnostics.vdrlRpr"
                          value={formData.baselineDiagnostics?.vdrlRpr || ""}
                          onChange={handleChange}
                          placeholder="VDRL/RPR"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          HBsAg
                        </label>
                        <Input
                          name="baselineDiagnostics.hbsag"
                          value={formData.baselineDiagnostics?.hbsag || ""}
                          onChange={handleChange}
                          placeholder="HBsAg"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          HIV
                        </label>
                        <Input
                          name="baselineDiagnostics.hiv"
                          value={formData.baselineDiagnostics?.hiv || ""}
                          onChange={handleChange}
                          placeholder="HIV"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Immunizations */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Immunizations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 border-b pb-2">
                        Tetanus Toxoid
                      </h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          TT1
                        </label>
                        <Input
                          name="immunizations.tt1"
                          value={
                            formData.immunizations?.tt1?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          TT2
                        </label>
                        <Input
                          name="immunizations.tt2"
                          value={
                            formData.immunizations?.tt2?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          TT3
                        </label>
                        <Input
                          name="immunizations.tt3"
                          value={
                            formData.immunizations?.tt3?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Tdap
                        </label>
                        <Input
                          name="immunizations.tdap"
                          value={
                            formData.immunizations?.tdap?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 border-b pb-2">
                        Influenza
                      </h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Flu
                        </label>
                        <Input
                          name="immunizations.flu"
                          value={
                            formData.immunizations?.flu?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 border-b pb-2">
                        Other Vaccines
                      </h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          COVID-19 Brand
                        </label>
                        <Input
                          name="immunizations.covid19.brand"
                          value={
                            formData.immunizations?.covid19?.brand || ""
                          }
                          onChange={handleChange}
                          placeholder="COVID-19 vaccine brand"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          COVID-19 Primary
                        </label>
                        <Input
                          name="immunizations.covid19.primary"
                          value={
                            formData.immunizations?.covid19?.primary?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          COVID-19 Booster
                        </label>
                        <Input
                          name="immunizations.covid19.booster"
                          value={
                            formData.immunizations?.covid19?.booster?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          HPV
                        </label>
                        <Input
                          name="immunizations.hpv"
                          value={
                            formData.immunizations?.hpv?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          PCV
                        </label>
                        <Input
                          name="immunizations.pcv"
                          value={
                            formData.immunizations?.pcv?.split("T")[0] || ""
                          }
                          onChange={handleChange}
                          type="date"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-8 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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

export default EditObGynePatientModal;
