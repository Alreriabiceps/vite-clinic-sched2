import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LoadingSpinner } from "../ui/loading-spinner";
import { X, Plus, Syringe } from "lucide-react";
import { patientsAPI } from "../../lib/api";
import { toast } from "../ui/toaster";

const AddImmunizationModal = ({ patientId, immunization, onClose, onSuccess }) => {
  const isEditing = !!immunization;
  const [formData, setFormData] = useState(() => {
    if (isEditing && immunization) {
      return {
        vaccine: immunization.vaccine || immunization.vaccineName || "",
        date: immunization.date ? new Date(immunization.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        remarks: immunization.remarks || immunization.notes || "",
        batchNumber: immunization.batchNumber || "",
        manufacturer: immunization.manufacturer || "",
        site: immunization.site || "",
        route: immunization.route || "",
      };
    }
    return {
      vaccine: "",
      date: new Date().toISOString().split("T")[0],
      remarks: "",
      batchNumber: "",
      manufacturer: "",
      site: "",
      route: "",
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const vaccineOptions = [
    { value: "BCG", label: "BCG (Bacillus Calmette-Guérin)" },
    { value: "HEPATITIS_B", label: "Hepatitis B" },
    { value: "DPT_1", label: "DPT 1st Dose" },
    { value: "DPT_2", label: "DPT 2nd Dose" },
    { value: "DPT_3", label: "DPT 3rd Dose" },
    { value: "POLIO_1", label: "Polio 1st Dose" },
    { value: "POLIO_2", label: "Polio 2nd Dose" },
    { value: "POLIO_3", label: "Polio 3rd Dose" },
    { value: "MMR", label: "MMR (Measles, Mumps, Rubella)" },
    { value: "VARICELLA", label: "Varicella (Chickenpox)" },
    { value: "PNEUMOCOCCAL", label: "Pneumococcal" },
    { value: "ROTAVIRUS", label: "Rotavirus" },
    { value: "INFLUENZA", label: "Influenza" },
    { value: "OTHER", label: "Other" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.vaccine) {
      setError("Please select a vaccine.");
      return false;
    }
    if (!formData.date) {
      setError("Please select a date.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Map vaccine value to vaccineName for display
      const vaccineName = vaccineOptions.find(opt => opt.value === formData.vaccine)?.label || formData.vaccine;
      const dataToSend = {
        ...formData,
        vaccineName: vaccineName,
        date: formData.date
      };

      if (isEditing && immunization?._id) {
        await patientsAPI.updateImmunization(patientId, immunization._id, dataToSend);
        toast.success("Immunization record updated successfully!");
      } else {
        await patientsAPI.addImmunization(patientId, dataToSend);
        toast.success("Immunization record added successfully!");
      }
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Error adding immunization:", error);
      setError("Failed to add immunization record. Please try again.");
      toast.error("Failed to add immunization record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Syringe className="h-5 w-5" />
              <span>{isEditing ? "Edit Immunization Record" : "Add Immunization Record"}</span>
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
              {/* Vaccine Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine *
                </label>
                <select
                  value={formData.vaccine}
                  onChange={(e) => handleInputChange("vaccine", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a vaccine</option>
                  {vaccineOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Administered *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks/Notes
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any additional notes, reactions, or observations..."
                />
              </div>

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
                  <span>{loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Immunization" : "Add Immunization")}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddImmunizationModal;
