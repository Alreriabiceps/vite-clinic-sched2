import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading-spinner';
import { X, User, Baby, Heart, Stethoscope, ShieldCheck, Beaker, PlusCircle } from 'lucide-react';
import { patientsAPI } from '../../lib/api';
import { toast } from '../ui/toast';
import { Checkbox } from '../ui/checkbox';

const EditObGynePatientModal = ({ patient, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // When the patient data is available, populate the form
    if (patient && patient.obGyneRecord) {
      // Merge emergencyContact from contactInfo if present
      setFormData({
        ...patient.obGyneRecord,
        emergencyContact: patient.contactInfo?.emergencyContact || patient.obGyneRecord.emergencyContact || { name: '', contactNumber: '' }
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    const keys = name.split('.');
    if (keys.length > 1) {
      setFormData(prev => {
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
        return newState;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleObstetricHistoryChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...(formData.obstetricHistory || [])];
    list[index][name] = value;
    setFormData(prev => ({ ...prev, obstetricHistory: list }));
  };

  const addObstetricHistoryRow = () => {
    const newRow = { year: '', place: '', typeOfDelivery: '', bw: '', complications: '' };
    setFormData(prev => ({
      ...prev,
      obstetricHistory: [...(prev.obstetricHistory || []), newRow]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean the form data: convert empty strings to null
      let cleanedForm = JSON.parse(JSON.stringify(formData), (key, value) => value === '' ? null : value);

      // Convert number fields to numbers (or null)
      const toNumberOrNull = v => v === null || v === undefined || v === '' ? null : isNaN(Number(v)) ? null : Number(v);
      cleanedForm.age = toNumberOrNull(cleanedForm.age);
      if (cleanedForm.gynecologicHistory) {
        cleanedForm.gynecologicHistory.gravidity = toNumberOrNull(cleanedForm.gynecologicHistory.gravidity);
        cleanedForm.gynecologicHistory.parity = toNumberOrNull(cleanedForm.gynecologicHistory.parity);
        cleanedForm.gynecologicHistory.menarche = toNumberOrNull(cleanedForm.gynecologicHistory.menarche);
        cleanedForm.gynecologicHistory.intervalDays = toNumberOrNull(cleanedForm.gynecologicHistory.intervalDays);
        cleanedForm.gynecologicHistory.durationDays = toNumberOrNull(cleanedForm.gynecologicHistory.durationDays);
        cleanedForm.gynecologicHistory.coitarche = toNumberOrNull(cleanedForm.gynecologicHistory.coitarche);
        cleanedForm.gynecologicHistory.sexualPartners = toNumberOrNull(cleanedForm.gynecologicHistory.sexualPartners);
      }
      if (Array.isArray(cleanedForm.obstetricHistory)) {
        cleanedForm.obstetricHistory = cleanedForm.obstetricHistory.map(row => ({
          ...row,
          year: toNumberOrNull(row.year)
        }));
      }
      // Build the payload: move emergencyContact to contactInfo
      const dataToSend = {
        obGyneRecord: { ...cleanedForm, emergencyContact: undefined },
        contactInfo: { emergencyContact: cleanedForm.emergencyContact }
      };

      console.log('Sending update data:', JSON.stringify(dataToSend, null, 2));

      await patientsAPI.update(patient._id, dataToSend);

      toast.success('Patient updated successfully!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating patient:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update patient. Please try again.';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    {`Edit ${formData.patientName || 'Patient'} Information`}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <CardDescription>Update the patient's information below.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="h-5 w-5" /> Patient Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input name="patientName" value={formData.patientName || ''} onChange={handleChange} placeholder="Patient's Name (Surname, First, Middle)" className="md:col-span-2" />
                        <Input name="age" value={formData.age || ''} onChange={handleChange} placeholder="Age" type="number" />
                        <Input name="birthDate" value={formData.birthDate?.split('T')[0] || ''} onChange={handleChange} placeholder="Date of Birth" type="date" />
                        
                        <Input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" className="md:col-span-4" />
                        
                        <Input name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} placeholder="Contact #" />
                        <Input name="occupation" value={formData.occupation || ''} onChange={handleChange} placeholder="Occupation" />
                        
                        <select name="civilStatus" value={formData.civilStatus || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select Civil Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                        
                        <Input name="religion" value={formData.religion || ''} onChange={handleChange} placeholder="Religion" />

                        <Input name="referredBy" value={formData.referredBy || ''} onChange={handleChange} placeholder="Referred By" className="md:col-span-2"/>
                        <Input name="emergencyContact.name" value={formData.emergencyContact?.name || ''} onChange={handleChange} placeholder="Emergency Contact Person" />
                        <Input name="emergencyContact.contactNumber" value={formData.emergencyContact?.contactNumber || ''} onChange={handleChange} placeholder="Emergency Contact #" />
                    </div>
                </div>

                {/* History Section */}
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Stethoscope className="h-5 w-5" /> History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Past Medical History</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.hypertension" checked={formData.pastMedicalHistory?.hypertension || false} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.hypertension', value: c, type: 'checkbox', checked: c}})} /> Hypertension</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.diabetes" checked={formData.pastMedicalHistory?.diabetes || false} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.diabetes', value: c, type: 'checkbox', checked: c}})} /> Diabetes</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.bronchialAsthma" checked={formData.pastMedicalHistory?.bronchialAsthma || false} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.bronchialAsthma', value: c, type: 'checkbox', checked: c}})} /> Bronchial Asthma</label>
                            <div>
                                <label className="text-xs text-gray-500">Last Attack Date</label>
                                <Input name="pastMedicalHistory.lastAttack" value={formData.pastMedicalHistory?.lastAttack?.split('T')[0] || ''} onChange={handleChange} type="date" />
                            </div>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.heartDisease" checked={formData.pastMedicalHistory?.heartDisease || false} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.heartDisease', value: c, type: 'checkbox', checked: c}})} /> Heart Disease</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.thyroidDisease" checked={formData.pastMedicalHistory?.thyroidDisease || false} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.thyroidDisease', value: c, type: 'checkbox', checked: c}})} /> Thyroid Disease</label>
                            <div>
                                <label className="text-xs text-gray-500">Previous Surgery Date</label>
                                <Input name="pastMedicalHistory.previousSurgery" value={formData.pastMedicalHistory?.previousSurgery?.split('T')[0] || ''} onChange={handleChange} type="date" />
                            </div>
                            <Input name="pastMedicalHistory.allergies" value={formData.pastMedicalHistory?.allergies || ''} onChange={handleChange} placeholder="Allergies" />
                            <div>
                                <label className="text-xs text-gray-500">Others (specify any additional medical history)</label>
                                <textarea 
                                    name="pastMedicalHistory.others" 
                                    value={formData.pastMedicalHistory?.others || ''} 
                                    onChange={handleChange} 
                                    placeholder="Any other medical conditions or history not listed above..."
                                    className="w-full p-2 border rounded-md text-sm"
                                    rows={3}
                                />
                            </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Family History</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="familyHistory.smoker" checked={formData.familyHistory?.smoker || false} onCheckedChange={(c) => handleChange({target: {name: 'familyHistory.smoker', value: c, type: 'checkbox', checked: c}})} /> Smoker</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="familyHistory.alcohol" checked={formData.familyHistory?.alcohol || false} onCheckedChange={(c) => handleChange({target: {name: 'familyHistory.alcohol', value: c, type: 'checkbox', checked: c}})} /> Alcohol</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="familyHistory.drugs" checked={formData.familyHistory?.drugs || false} onCheckedChange={(c) => handleChange({target: {name: 'familyHistory.drugs', value: c, type: 'checkbox', checked: c}})} /> Drugs</label>
                        </div>
                      </div>
                  </div>
                </div>

                {/* Obstetric History Table */}
                <div className="p-4 border rounded-lg">
                     <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Baby className="h-5 w-5" /> Obstetric History</h3>
                     <div className="grid grid-cols-5 gap-2 font-medium text-sm text-gray-600 px-2 mb-1">
                        <span>Year</span><span>Place</span><span>Type of Delivery</span><span>BW</span><span>Complications</span>
                     </div>
                     {(formData.obstetricHistory || []).map((x, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                            <Input name="year" value={x.year || ''} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="Year" />
                            <Input name="place" value={x.place || ''} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="Place" />
                            <Input name="typeOfDelivery" value={x.typeOfDelivery || ''} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="AOG/Type" />
                            <Input name="bw" value={x.bw || ''} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="BW" />
                            <Input name="complications" value={x.complications || ''} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="Complications" />
                        </div>
                     ))}
                     <Button type="button" variant="outline" size="sm" onClick={addObstetricHistoryRow} className="mt-2 flex items-center gap-1">
                        <PlusCircle className="h-4 w-4" /> Add Row
                     </Button>
                </div>
              
                {/* Gynecologic History */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Heart className="h-5 w-5" /> Gynecologic History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input name="gynecologicHistory.obScore" value={formData.gynecologicHistory?.obScore || ''} onChange={handleChange} placeholder="OB Score" />
                        <Input name="gynecologicHistory.gravidity" value={formData.gynecologicHistory?.gravidity || ''} onChange={handleChange} placeholder="Gravidity" />
                        <Input name="gynecologicHistory.parity" value={formData.gynecologicHistory?.parity || ''} onChange={handleChange} placeholder="Parity" />
                        <Input name="gynecologicHistory.aog" value={formData.gynecologicHistory?.aog || ''} onChange={handleChange} placeholder="AOG" />
                        
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500">LMP</label>
                            <Input name="gynecologicHistory.lmp" value={formData.gynecologicHistory?.lmp?.split('T')[0] || ''} onChange={handleChange} type="date" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500">PMP</label>
                            <Input name="gynecologicHistory.pmp" value={formData.gynecologicHistory?.pmp?.split('T')[0] || ''} onChange={handleChange} type="date" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500">Early Ultrasound</label>
                            <Input name="gynecologicHistory.earlyUltrasound" value={formData.gynecologicHistory?.earlyUltrasound?.split('T')[0] || ''} onChange={handleChange} type="date" />
                        </div>
                        <Input name="gynecologicHistory.aogByEutz" value={formData.gynecologicHistory?.aogByEutz || ''} onChange={handleChange} placeholder="AOG by EUTZ" />
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500">EDD by LMP</label>
                            <Input name="gynecologicHistory.eddByLmp" value={formData.gynecologicHistory?.eddByLmp?.split('T')[0] || ''} onChange={handleChange} type="date" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500">EDD by EUTZ</label>
                            <Input name="gynecologicHistory.eddByEutz" value={formData.gynecologicHistory?.eddByEutz?.split('T')[0] || ''} onChange={handleChange} type="date" />
                        </div>

                        <Input name="gynecologicHistory.menarche" value={formData.gynecologicHistory?.menarche || ''} onChange={handleChange} placeholder="Menarche (Age)" type="number" />
                        <Input name="gynecologicHistory.intervalDays" value={formData.gynecologicHistory?.intervalDays || ''} onChange={handleChange} placeholder="Interval (Days)" type="number" />
                        <Input name="gynecologicHistory.durationDays" value={formData.gynecologicHistory?.durationDays || ''} onChange={handleChange} placeholder="Duration (Days)" type="number" />
                        <Input name="gynecologicHistory.amountPads" value={formData.gynecologicHistory?.amountPads || ''} onChange={handleChange} placeholder="Amount (Pads/Day)" />

                        <label className="flex items-center gap-2 text-sm md:col-span-2"><Checkbox name="gynecologicHistory.dysmenorrhea" checked={formData.gynecologicHistory?.dysmenorrhea || false} onCheckedChange={(c) => handleChange({target: {name: 'gynecologicHistory.dysmenorrhea', value: c, type: 'checkbox', checked: c}})} /> Dysmenorrhea</label>
                        
                        <Input name="gynecologicHistory.coitarche" value={formData.gynecologicHistory?.coitarche || ''} onChange={handleChange} placeholder="Coitarche (Age)" type="number" />
                        <Input name="gynecologicHistory.sexualPartners" value={formData.gynecologicHistory?.sexualPartners || ''} onChange={handleChange} placeholder="# of Sexual Partners" type="number" />
                        <Input name="gynecologicHistory.contraceptiveUse" value={formData.gynecologicHistory?.contraceptiveUse || ''} onChange={handleChange} placeholder="Contraceptive Use" />

                        <div className="md:col-span-2">
                             <label className="text-xs text-gray-500">Last Pap Smear</label>
                            <Input name="gynecologicHistory.lastPapSmear.date" value={formData.gynecologicHistory?.lastPapSmear?.date?.split('T')[0] || ''} onChange={handleChange} type="date" />
                        </div>
                        <Input name="gynecologicHistory.lastPapSmear.result" value={formData.gynecologicHistory?.lastPapSmear?.result || ''} onChange={handleChange} placeholder="Pap Smear Result" className="md:col-span-2" />
                    </div>
                </div>

                {/* Diagnostics and Immunizations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Baseline Diagnostics */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Beaker className="h-5 w-5" /> Baseline Diagnostics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="baselineDiagnostics.cbc.hgb" value={formData.baselineDiagnostics?.cbc?.hgb || ''} onChange={handleChange} placeholder="Hgb" />
                            <Input name="baselineDiagnostics.cbc.hct" value={formData.baselineDiagnostics?.cbc?.hct || ''} onChange={handleChange} placeholder="Hct" />
                            <Input name="baselineDiagnostics.cbc.plt" value={formData.baselineDiagnostics?.cbc?.plt || ''} onChange={handleChange} placeholder="Plt" />
                            <Input name="baselineDiagnostics.cbc.wbc" value={formData.baselineDiagnostics?.cbc?.wbc || ''} onChange={handleChange} placeholder="WBC" />
                            <Input name="baselineDiagnostics.bloodType" value={formData.baselineDiagnostics?.bloodType || ''} onChange={handleChange} placeholder="Blood Type" />
                            <Input name="baselineDiagnostics.fbs" value={formData.baselineDiagnostics?.fbs || ''} onChange={handleChange} placeholder="FBS" />
                            <Input name="baselineDiagnostics.hbsag" value={formData.baselineDiagnostics?.hbsag || ''} onChange={handleChange} placeholder="HBsAg" />
                            <Input name="baselineDiagnostics.vdrlRpr" value={formData.baselineDiagnostics?.vdrlRpr || ''} onChange={handleChange} placeholder="VDRL/RPR" />
                            <Input name="baselineDiagnostics.hiv" value={formData.baselineDiagnostics?.hiv || ''} onChange={handleChange} placeholder="HIV" />
                        </div>
                    </div>
                    {/* Immunizations */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><ShieldCheck className="h-5 w-5" /> Immunizations</h3>
                        <div className="space-y-3">
                            <div><label className="text-xs text-gray-500">TT1</label><Input name="immunizations.tt1" value={formData.immunizations?.tt1?.split('T')[0] || ''} onChange={handleChange} type="date" /></div>
                            <div><label className="text-xs text-gray-500">TT2</label><Input name="immunizations.tt2" value={formData.immunizations?.tt2?.split('T')[0] || ''} onChange={handleChange} type="date" /></div>
                            <div><label className="text-xs text-gray-500">TT3</label><Input name="immunizations.tt3" value={formData.immunizations?.tt3?.split('T')[0] || ''} onChange={handleChange} type="date" /></div>
                            <div><label className="text-xs text-gray-500">TDAP</label><Input name="immunizations.tdap" value={formData.immunizations?.tdap?.split('T')[0] || ''} onChange={handleChange} type="date" /></div>
                            <div><label className="text-xs text-gray-500">Flu</label><Input name="immunizations.flu" value={formData.immunizations?.flu?.split('T')[0] || ''} onChange={handleChange} type="date" /></div>
                            <div><label className="text-xs text-gray-500">HPV</label><Input name="immunizations.hpv" value={formData.immunizations?.hpv?.split('T')[0] || ''} onChange={handleChange} type="date" /></div>
                            <div><label className="text-xs text-gray-500">PCV</label><Input name="immunizations.pcv" value={formData.immunizations?.pcv?.split('T')[0] || ''} onChange={handleChange} type="date" /></div>
                        </div>
                    </div>
                </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" variant="clinic" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Save Changes'}
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