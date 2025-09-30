import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { LoadingSpinner } from "../ui/loading-spinner";
import { X, Baby, User, ShieldCheck } from "lucide-react";
import { patientsAPI } from "../../lib/api";
import { toast } from "../ui/toaster";

export default function EditPediatricPatientModal({
  patient,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (patient && patient.pediatricRecord) {
      setFormData(patient.pediatricRecord);
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
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = val;
        return newState;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nameOfChildren || !formData.nameOfChildren.trim()) {
      setError("Child's Name is a required field.");
      return;
    }

    setIsLoading(true);

    const cleanedRecord = JSON.parse(JSON.stringify(formData), (key, value) => {
      if (value === "") return null;
      return value;
    });

    const patientDataPayload = {
      pediatricRecord: cleanedRecord,
    };

    try {
      await patientsAPI.update(patient._id, patientDataPayload);
      toast.success("Patient updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update patient. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderDoseFields = (vaccine, doses) => (
    <div>
      <h4 className="font-medium text-sm mb-2">{vaccine.label}</h4>
      <div className="space-y-2">
        {doses.map((dose) => (
          <div
            className="grid grid-cols-12 gap-2"
            key={`${vaccine.key}-${dose.key}`}
          >
            <label className="col-span-2 text-xs text-gray-600 flex items-center">
              {dose.label}
            </label>
            <div className="col-span-5">
              <Input
                type="date"
                className="p-1 text-xs h-8"
                name={`immunizations.${vaccine.key}.${dose.key}.date`}
                value={
                  formData.immunizations?.[vaccine.key]?.[
                    dose.key
                  ]?.date?.split("T")[0] || ""
                }
                onChange={handleChange}
              />
            </div>
            <div className="col-span-5">
              <Input
                className="p-1 text-xs h-8"
                placeholder="Remarks"
                name={`immunizations.${vaccine.key}.${dose.key}.remarks`}
                value={
                  formData.immunizations?.[vaccine.key]?.[dose.key]?.remarks ||
                  ""
                }
                onChange={handleChange}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSingleDose = (vaccine) => (
    <div className="grid grid-cols-12 gap-2 items-center">
      <label className="col-span-4 text-sm font-medium">{vaccine.label}</label>
      <div className="col-span-4">
        <Input
          type="date"
          className="p-1 text-xs h-8"
          name={`immunizations.${vaccine.key}.date`}
          value={
            formData.immunizations?.[vaccine.key]?.date?.split("T")[0] || ""
          }
          onChange={handleChange}
        />
      </div>
      <div className="col-span-4">
        <Input
          placeholder="Remarks"
          className="p-1 text-xs h-8"
          name={`immunizations.${vaccine.key}.remarks`}
          value={formData.immunizations?.[vaccine.key]?.remarks || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b sticky top-0 bg-white z-10 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Baby className="h-6 w-6 text-sky-600" />
                <div>
                  <CardTitle className="text-xl">
                    Edit Pediatric Patient
                  </CardTitle>
                  <CardDescription>
                    Update the patient's information.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-clinic-600" /> Patient
                      Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="space-y-4">
                        <div>
                          <label className="font-medium">
                            Name of Patient *
                          </label>
                          <Input
                            name="nameOfChildren"
                            value={formData.nameOfChildren || ""}
                            onChange={handleChange}
                            placeholder="Full name of the child"
                          />
                        </div>
                        <div>
                          <label className="font-medium">Address</label>
                          <Input
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                            placeholder="Home address"
                          />
                        </div>
                        <div>
                          <label className="font-medium">Name of Mother</label>
                          <Input
                            name="nameOfMother"
                            value={formData.nameOfMother || ""}
                            onChange={handleChange}
                            placeholder="Mother's full name"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-medium">Age</label>
                            <Input
                              name="age"
                              value={formData.age || ""}
                              onChange={handleChange}
                              placeholder="e.g., 2 years"
                            />
                          </div>
                          <div>
                            <label className="font-medium">Sex *</label>
                            <select
                              name="sex"
                              value={formData.sex || ""}
                              onChange={handleChange}
                              className="w-full mt-1 p-2 border rounded-md"
                            >
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium">
                            Contact Number *
                          </label>
                          <Input
                            name="contactNumber"
                            value={formData.contactNumber || ""}
                            onChange={handleChange}
                            placeholder="Parent/Guardian contact"
                          />
                        </div>
                        <div>
                          <label className="font-medium">Name of Father</label>
                          <Input
                            name="nameOfFather"
                            value={formData.nameOfFather || ""}
                            onChange={handleChange}
                            placeholder="Father's full name"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div>
                        <label className="font-medium">Date of Birth *</label>
                        <Input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate?.split("T")[0] || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="font-medium">Birth Weight</label>
                        <Input
                          name="birthWeight"
                          value={formData.birthWeight || ""}
                          onChange={handleChange}
                          placeholder="e.g., 3.2 kg"
                        />
                      </div>
                      <div>
                        <label className="font-medium">Birth Length</label>
                        <Input
                          name="birthLength"
                          value={formData.birthLength || ""}
                          onChange={handleChange}
                          placeholder="e.g., 50 cm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-clinic-600" />{" "}
                      Immunization History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="space-y-6">
                      {renderDoseFields({ key: "dpt", label: "DPT" }, [
                        { key: "d1", label: "1" },
                        { key: "d2", label: "2" },
                        { key: "d3", label: "3" },
                      ])}
                      {renderDoseFields({ key: "dpt", label: "Booster" }, [
                        { key: "b1", label: "1" },
                        { key: "b2", label: "2" },
                      ])}
                      {renderDoseFields({ key: "opvIpv", label: "OPV/IPV" }, [
                        { key: "d1", label: "1" },
                        { key: "d2", label: "2" },
                        { key: "d3", label: "3" },
                      ])}
                      {renderDoseFields({ key: "opvIpv", label: "Booster" }, [
                        { key: "b1", label: "1" },
                        { key: "b2", label: "2" },
                      ])}
                    </div>
                    <div className="space-y-6">
                      {renderDoseFields(
                        { key: "hInfluenzaHib", label: "H. Influenza (HIB)" },
                        [
                          { key: "d1", label: "1" },
                          { key: "d2", label: "2" },
                          { key: "d3", label: "3" },
                          { key: "d4", label: "4" },
                        ]
                      )}
                      {renderDoseFields(
                        { key: "measlesMmr", label: "Measles, MMR" },
                        [
                          { key: "d1", label: "1" },
                          { key: "d2", label: "2" },
                        ]
                      )}
                      {renderDoseFields(
                        { key: "pneumococcalPcv", label: "Pneumococcal (PCV)" },
                        [
                          { key: "d1", label: "1" },
                          { key: "d2", label: "2" },
                          { key: "d3", label: "3" },
                          { key: "d4", label: "4" },
                        ]
                      )}
                      {renderDoseFields(
                        { key: "rotavirus", label: "Rotavirus" },
                        [
                          { key: "d1", label: "1" },
                          { key: "d2", label: "2" },
                          { key: "d3", label: "3" },
                        ]
                      )}
                      <div className="pt-4">
                        {renderSingleDose({
                          key: "pneumococcalPpv",
                          label: "Pneumococcal (PPV)",
                        })}
                      </div>
                      {renderSingleDose({
                        key: "varicella",
                        label: "Varicella",
                      })}
                    </div>
                    <div className="space-y-6">
                      {renderDoseFields(
                        { key: "hepatitisA", label: "Hepatitis A" },
                        [
                          { key: "d1", label: "1" },
                          { key: "d2", label: "2" },
                        ]
                      )}
                      {renderDoseFields({ key: "tdaPTdp", label: "TdaP/Tdp" }, [
                        { key: "d1", label: "1" },
                        { key: "d2", label: "2" },
                      ])}
                      {renderDoseFields(
                        { key: "meningococcal", label: "Meningococcal" },
                        [
                          { key: "d1", label: "1" },
                          { key: "d2", label: "2" },
                        ]
                      )}
                      {renderDoseFields(
                        { key: "influenza", label: "Influenza" },
                        [
                          { key: "d1", label: "1" },
                          { key: "d2", label: "2" },
                          { key: "d3", label: "3" },
                          { key: "d4", label: "4" },
                          { key: "d5", label: "5" },
                        ]
                      )}
                      {renderDoseFields(
                        {
                          key: "japaneseEncephalitis",
                          label: "Japanese Encephalitis",
                        },
                        [
                          { key: "d1", label: "1" },
                          { key: "d2", label: "2" },
                        ]
                      )}
                      {renderDoseFields({ key: "hpv", label: "HPV" }, [
                        { key: "d1", label: "1" },
                        { key: "d2", label: "2" },
                        { key: "d3", label: "3" },
                      ])}
                      <div className="pt-4">
                        {renderSingleDose({
                          key: "mantouxTest",
                          label: "Mantoux Test",
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="clinic" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
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
}
