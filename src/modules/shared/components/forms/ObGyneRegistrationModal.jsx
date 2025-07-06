import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Checkbox } from '../ui/checkbox';
import { X, Baby, Heart, User, FileText, PlusCircle, ShieldCheck, Beaker, Stethoscope } from 'lucide-react';
import { patientsAPI } from '../../lib/api';
import { toast } from '../ui/toast';

const initialObGyneState = {
  // Personal Info
  patientName: '',
  address: '',
    contactNumber: '',
  birthDate: '',
  age: '',
  civilStatus: '',
  occupation: '',
  religion: '',
  referredBy: '',
  emergencyContact: {
    name: '',
    contactNumber: ''
  },
  
  // Past Medical History
  pastMedicalHistory: {
    hypertension: false,
    diabetes: false,
    bronchialAsthma: false,
    lastAttack: '', // Will be date picker
    heartDisease: false,
    thyroidDisease: false,
    previousSurgery: '', // Will be date picker
    allergies: '',
    others: '', // For additional medical history comments
  },
  
  // Family History
  familyHistory: {
    smoker: false,
    alcohol: false,
    drugs: false,
    others: '', // For custom entries
  },

  // Gynecologic History
  gynecologicHistory: {
    obScore: '',
    gravidity: '',
    parity: '',
    lmp: '',
    pmp: '',
    aog: '',
    earlyUltrasound: '',
    aogByEutz: '',
    eddByLmp: '',
    eddByEutz: '',
    menarche: '',
    intervalIsRegular: true,
    intervalDays: '',
    durationDays: '',
    amountPads: '',
    dysmenorrhea: false,
    coitarche: '',
    sexualPartners: '',
    contraceptiveUse: '',
    lastPapSmear: {
      date: '',
      result: ''
    }
  },
  
  // Obstetric History (Dynamic table)
  obstetricHistory: [],
  
  // Immunizations
  immunizations: {
    tt1: '', tt2: '', tt3: '', tdap: '', flu: '', hpv: '', pcv: '',
    covid19: {
      brand: '',
      primary: '',
      booster: ''
    }
  },

  // Baseline Diagnostics
  baselineDiagnostics: {
    cbc: { hgb: '', hct: '', plt: '', wbc: '' },
    urinalysis: '',
    bloodType: '',
    fbs: '',
    hbsag: '',
    vdrlRpr: '',
    hiv: '',
    ogtt75g: { fbs: '', firstHour: '', secondHour: '' },
    other: ''
  }
};

export default function ObGyneRegistrationModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(initialObGyneState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialObGyneState);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    const keys = name.split('.');
    if (keys.length > 1) {
      setFormData(prev => {
        const newState = { ...prev };
        let current = newState;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = val;
        
        // Auto-calculate AOG when LMP is entered
        if (name === 'gynecologicHistory.lmp' && val) {
          const lmpDate = new Date(val);
          const today = new Date();
          const diffTime = today - lmpDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(diffDays / 7);
          const days = diffDays % 7;
          
          // Handle both past and future dates
          if (diffDays >= 0) {
            const weekText = weeks === 1 ? 'week' : 'weeks';
            const dayText = days === 1 ? 'day' : 'days';
            newState.gynecologicHistory.aog = `${weeks} ${weekText} ${days} ${dayText}`;
          } else {
            // For future dates (which shouldn't happen in real scenarios)
            const absDays = Math.abs(diffDays);
            const absWeeks = Math.floor(absDays / 7);
            const remainingDays = absDays % 7;
            const weekText = absWeeks === 1 ? 'week' : 'weeks';
            const dayText = remainingDays === 1 ? 'day' : 'days';
            newState.gynecologicHistory.aog = `Future date: ${absWeeks} ${weekText} ${remainingDays} ${dayText} ahead`;
          }
          
          // Auto-calculate EDD by LMP (LMP + 280 days)
          const eddDate = new Date(lmpDate);
          eddDate.setDate(eddDate.getDate() + 280);
          newState.gynecologicHistory.eddByLmp = eddDate.toISOString().split('T')[0];
        }
        
        return newState;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };
  
  const handleObstetricHistoryChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...formData.obstetricHistory];
    list[index][name] = value;
    setFormData(prev => ({ ...prev, obstetricHistory: list }));
  };

  const addObstetricHistoryRow = () => {
    setFormData(prev => ({
      ...prev,
      obstetricHistory: [...prev.obstetricHistory, { year: '', place: '', typeOfDelivery: '', bw: '', complications: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.patientName || !formData.patientName.trim()) {
      setError("Patient's Name is a required field.");
      return;
    }

    setIsLoading(true);
    
    const cleanedRecord = JSON.parse(JSON.stringify(formData), (key, value) => {
        if (value === '') return null;
        return value;
    });

    const patientDataPayload = {
        patientType: 'ob-gyne',
        record: cleanedRecord 
    };
    
    try {
      const response = await patientsAPI.create(patientDataPayload);
      toast.success('Patient registered successfully!');
      if(onSuccess) onSuccess(response.data);
      onClose();
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data) {
        console.error('Backend Response Error:', JSON.stringify(err.response.data, null, 2));
      }
      setError(err.response?.data?.message || 'Failed to register patient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b sticky top-0 bg-white z-10 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-pink-600" />
                <div>
                  <CardTitle className="text-xl">New OB-GYNE Patient</CardTitle>
                  <CardDescription>Register a new patient record in the system.</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}><X className="h-5 w-5" /></Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {error && <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-800 text-sm font-medium">{error}</p></div>}
              
              <div className="space-y-8">
                {/* Personal Info */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="h-5 w-5" /> Patient Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input name="patientName" value={formData.patientName} onChange={handleChange} placeholder="Patient's Name (Surname, First, Middle)" className="md:col-span-2" />
                        <Input name="age" value={formData.age} onChange={handleChange} placeholder="Age" type="number" />
                        <Input name="birthDate" value={formData.birthDate} onChange={handleChange} placeholder="Date of Birth" type="date" />
                        <Input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="md:col-span-4" />
                        <Input name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact #" />
                        <Input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" />
                        <select 
                          name="civilStatus" 
                          value={formData.civilStatus} 
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:border-transparent border-gray-300"
                        >
                          <option value="">Select Civil Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                        <Input name="religion" value={formData.religion} onChange={handleChange} placeholder="Religion" />
                        <Input name="referredBy" value={formData.referredBy} onChange={handleChange} placeholder="Referred By" className="md:col-span-2"/>
                        <Input name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} placeholder="Emergency Contact Person" />
                        <Input name="emergencyContact.contactNumber" value={formData.emergencyContact.contactNumber} onChange={handleChange} placeholder="Emergency Contact #" />
                    </div>
                </div>

                {/* History Section */}
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Stethoscope className="h-5 w-5" /> History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Past Medical History</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.hypertension" checked={formData.pastMedicalHistory.hypertension} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.hypertension', value: c, type: 'checkbox', checked: c}})} /> Hypertension</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.diabetes" checked={formData.pastMedicalHistory.diabetes} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.diabetes', value: c, type: 'checkbox', checked: c}})} /> Diabetes</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.bronchialAsthma" checked={formData.pastMedicalHistory.bronchialAsthma} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.bronchialAsthma', value: c, type: 'checkbox', checked: c}})} /> Bronchial Asthma</label>
                            <div>
                                <label className="text-xs text-gray-500">Last Attack Date</label>
                                <Input name="pastMedicalHistory.lastAttack" value={formData.pastMedicalHistory.lastAttack} onChange={handleChange} type="date" />
                            </div>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.heartDisease" checked={formData.pastMedicalHistory.heartDisease} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.heartDisease', value: c, type: 'checkbox', checked: c}})} /> Heart Disease</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="pastMedicalHistory.thyroidDisease" checked={formData.pastMedicalHistory.thyroidDisease} onCheckedChange={(c) => handleChange({target: {name: 'pastMedicalHistory.thyroidDisease', value: c, type: 'checkbox', checked: c}})} /> Thyroid Disease</label>
                            <div>
                                <label className="text-xs text-gray-500">Previous Surgery Date</label>
                                <Input name="pastMedicalHistory.previousSurgery" value={formData.pastMedicalHistory.previousSurgery} onChange={handleChange} type="date" />
                            </div>
                            <Input name="pastMedicalHistory.allergies" value={formData.pastMedicalHistory.allergies} onChange={handleChange} placeholder="Allergies" />
                            <div>
                                <label className="text-xs text-gray-500">Others (specify any additional medical history)</label>
                                <textarea 
                                    name="pastMedicalHistory.others" 
                                    value={formData.pastMedicalHistory.others} 
                                    onChange={handleChange} 
                                    placeholder="Any other medical conditions or history not listed above..."
                                    className="w-full p-2 border rounded-md text-sm"
                                    rows={3}
                                />
                            </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Personal / Social History</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="familyHistory.smoker" checked={formData.familyHistory.smoker} onCheckedChange={(c) => handleChange({target: {name: 'familyHistory.smoker', value: c, type: 'checkbox', checked: c}})} /> Smoker</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="familyHistory.alcohol" checked={formData.familyHistory.alcohol} onCheckedChange={(c) => handleChange({target: {name: 'familyHistory.alcohol', value: c, type: 'checkbox', checked: c}})} /> Alcohol</label>
                            <label className="flex items-center gap-2 text-sm"><Checkbox name="familyHistory.drugs" checked={formData.familyHistory.drugs} onCheckedChange={(c) => handleChange({target: {name: 'familyHistory.drugs', value: c, type: 'checkbox', checked: c}})} /> Drugs</label>
                            <div>
                                <label className="text-xs text-gray-500">Others (specify any custom entries)</label>
                                <textarea 
                                    name="familyHistory.others" 
                                    value={formData.familyHistory.others} 
                                    onChange={handleChange} 
                                    placeholder="Any other personal or social history not listed above..."
                                    className="w-full p-2 border rounded-md text-sm"
                                    rows={3}
                                />
                            </div>
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
                     {formData.obstetricHistory.map((x, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                            <Input name="year" value={x.year} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="Year" />
                            <Input name="place" value={x.place} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="Place" />
                            <Input name="typeOfDelivery" value={x.typeOfDelivery} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="AOG/Type" />
                            <Input name="bw" value={x.bw} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="BW" />
                            <Input name="complications" value={x.complications} onChange={e => handleObstetricHistoryChange(i, e)} placeholder="Complications" />
                        </div>
                     ))}
                     <Button type="button" variant="outline" size="sm" onClick={addObstetricHistoryRow} className="mt-2 flex items-center gap-2"><PlusCircle className="h-4 w-4" /> Add Row</Button>
                </div>

                {/* Gynecologic History */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Heart className="h-5 w-5 text-pink-600" /> Gynecologic History</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label htmlFor="gynecologicHistory.lmp" className="text-sm font-medium">LMP (Last Menstrual Period)</label><Input id="gynecologicHistory.lmp" name="gynecologicHistory.lmp" value={formData.gynecologicHistory.lmp} onChange={handleChange} type="date" /></div>
                        <div><label htmlFor="gynecologicHistory.pmp" className="text-sm font-medium">PMP</label><Input id="gynecologicHistory.pmp" name="gynecologicHistory.pmp" value={formData.gynecologicHistory.pmp} onChange={handleChange} type="date" /></div>
                        <div>
                            <label htmlFor="gynecologicHistory.aog" className="text-sm font-medium">
                                AOG (Age of Gestation) 
                                <span className="text-xs text-gray-500 font-normal"> - Auto-calculated</span>
                            </label>
                            <Input 
                                id="gynecologicHistory.aog" 
                                name="gynecologicHistory.aog" 
                                value={formData.gynecologicHistory.aog} 
                                readOnly 
                                className="bg-gray-50 text-gray-700"
                                placeholder="Will auto-calculate when LMP is entered"
                            />
                        </div>
                        <div>
                            <label htmlFor="gynecologicHistory.eddByLmp" className="text-sm font-medium">
                                EDD by LMP (Expected Date of Delivery)
                                <span className="text-xs text-gray-500 font-normal"> - Auto-calculated</span>
                            </label>
                            <Input 
                                id="gynecologicHistory.eddByLmp" 
                                name="gynecologicHistory.eddByLmp" 
                                value={formData.gynecologicHistory.eddByLmp} 
                                readOnly 
                                className="bg-gray-50 text-gray-700"
                                type="date"
                            />
                        </div>
                        <div><label htmlFor="gynecologicHistory.earlyUltrasound" className="text-sm font-medium">Early Ultrasound</label><Input id="gynecologicHistory.earlyUltrasound" name="gynecologicHistory.earlyUltrasound" value={formData.gynecologicHistory.earlyUltrasound} onChange={handleChange} type="date" /></div>
                        <div><label htmlFor="gynecologicHistory.aogByEutz" className="text-sm font-medium">AOG by EUTZ</label><Input id="gynecologicHistory.aogByEutz" name="gynecologicHistory.aogByEutz" value={formData.gynecologicHistory.aogByEutz} onChange={handleChange} /></div>
                        <div><label htmlFor="gynecologicHistory.eddByEutz" className="text-sm font-medium">EDD by EUTZ</label><Input id="gynecologicHistory.eddByEutz" name="gynecologicHistory.eddByEutz" value={formData.gynecologicHistory.eddByEutz} onChange={handleChange} type="date" /></div>
                        <div><label htmlFor="gynecologicHistory.menarche" className="text-sm font-medium">Menarche (Age)</label><Input id="gynecologicHistory.menarche" name="gynecologicHistory.menarche" value={formData.gynecologicHistory.menarche} onChange={handleChange} type="number" /></div>
                        <div><label htmlFor="gynecologicHistory.coitarche" className="text-sm font-medium">Coitarche (Age)</label><Input id="gynecologicHistory.coitarche" name="gynecologicHistory.coitarche" value={formData.gynecologicHistory.coitarche} onChange={handleChange} type="number" /></div>
                        <div><label htmlFor="gynecologicHistory.sexualPartners" className="text-sm font-medium"># of Sexual Partners</label><Input id="gynecologicHistory.sexualPartners" name="gynecologicHistory.sexualPartners" value={formData.gynecologicHistory.sexualPartners} onChange={handleChange} type="number" /></div>
                        <div><label htmlFor="gynecologicHistory.contraceptiveUse" className="text-sm font-medium">Contraceptive Use</label><Input id="gynecologicHistory.contraceptiveUse" name="gynecologicHistory.contraceptiveUse" value={formData.gynecologicHistory.contraceptiveUse} onChange={handleChange} /></div>
                        <div><label htmlFor="gynecologicHistory.lastPapSmear.date" className="text-sm font-medium">Last Pap Smear</label><Input id="gynecologicHistory.lastPapSmear.date" name="gynecologicHistory.lastPapSmear.date" value={formData.gynecologicHistory.lastPapSmear.date} onChange={handleChange} type="date" /></div>
                        <div className="md:col-span-2"><label htmlFor="gynecologicHistory.lastPapSmear.result" className="text-sm font-medium">Pap Smear Result</label><Input id="gynecologicHistory.lastPapSmear.result" name="gynecologicHistory.lastPapSmear.result" value={formData.gynecologicHistory.lastPapSmear.result} onChange={handleChange} /></div>
                    </div>
                </div>

                {/* Immunizations & Diagnostics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><ShieldCheck className="h-5 w-5" /> Immunizations</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label htmlFor="immunizations.tt1" className="text-sm font-medium">TT1</label><Input id="immunizations.tt1" name="immunizations.tt1" value={formData.immunizations.tt1} onChange={handleChange} type="date" /></div>
                            <div><label htmlFor="immunizations.tt2" className="text-sm font-medium">TT2</label><Input id="immunizations.tt2" name="immunizations.tt2" value={formData.immunizations.tt2} onChange={handleChange} type="date" /></div>
                            <div><label htmlFor="immunizations.tt3" className="text-sm font-medium">TT3</label><Input id="immunizations.tt3" name="immunizations.tt3" value={formData.immunizations.tt3} onChange={handleChange} type="date" /></div>
                            <div><label htmlFor="immunizations.tdap" className="text-sm font-medium">Tdap</label><Input id="immunizations.tdap" name="immunizations.tdap" value={formData.immunizations.tdap} onChange={handleChange} type="date" /></div>
                            <div><label htmlFor="immunizations.flu" className="text-sm font-medium">Flu</label><Input id="immunizations.flu" name="immunizations.flu" value={formData.immunizations.flu} onChange={handleChange} type="date" /></div>
                            <div><label htmlFor="immunizations.hpv" className="text-sm font-medium">HPV</label><Input id="immunizations.hpv" name="immunizations.hpv" value={formData.immunizations.hpv} onChange={handleChange} type="date" /></div>
                            <div><label htmlFor="immunizations.pcv" className="text-sm font-medium">PCV</label><Input id="immunizations.pcv" name="immunizations.pcv" value={formData.immunizations.pcv} onChange={handleChange} type="date" /></div>
                            <div><label htmlFor="immunizations.covid19.brand" className="text-sm font-medium">COVID-19 Brand</label><Input id="immunizations.covid19.brand" name="immunizations.covid19.brand" value={formData.immunizations.covid19.brand} onChange={handleChange} /></div>
                            <div><label htmlFor="immunizations.covid19.primary" className="text-sm font-medium">COVID-19 Primary</label><Input id="immunizations.covid19.primary" name="immunizations.covid19.primary" value={formData.immunizations.covid19.primary} onChange={handleChange} type="date" /></div>
                            <div><label htmlFor="immunizations.covid19.booster" className="text-sm font-medium">COVID-19 Booster</label><Input id="immunizations.covid19.booster" name="immunizations.covid19.booster" value={formData.immunizations.covid19.booster} onChange={handleChange} type="date" /></div>
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Beaker className="h-5 w-5" /> Baseline Diagnostics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><label htmlFor="baselineDiagnostics.cbc.hgb" className="text-sm font-medium">Hgb</label><Input id="baselineDiagnostics.cbc.hgb" name="baselineDiagnostics.cbc.hgb" value={formData.baselineDiagnostics.cbc.hgb} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.cbc.hct" className="text-sm font-medium">Hct</label><Input id="baselineDiagnostics.cbc.hct" name="baselineDiagnostics.cbc.hct" value={formData.baselineDiagnostics.cbc.hct} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.cbc.plt" className="text-sm font-medium">Plt</label><Input id="baselineDiagnostics.cbc.plt" name="baselineDiagnostics.cbc.plt" value={formData.baselineDiagnostics.cbc.plt} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.cbc.wbc" className="text-sm font-medium">WBC</label><Input id="baselineDiagnostics.cbc.wbc" name="baselineDiagnostics.cbc.wbc" value={formData.baselineDiagnostics.cbc.wbc} onChange={handleChange} /></div>
                            <div className="md:col-span-2"><label htmlFor="baselineDiagnostics.urinalysis" className="text-sm font-medium">Urinalysis</label><Input id="baselineDiagnostics.urinalysis" name="baselineDiagnostics.urinalysis" value={formData.baselineDiagnostics.urinalysis} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.bloodType" className="text-sm font-medium">Blood Type</label><Input id="baselineDiagnostics.bloodType" name="baselineDiagnostics.bloodType" value={formData.baselineDiagnostics.bloodType} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.fbs" className="text-sm font-medium">FBS</label><Input id="baselineDiagnostics.fbs" name="baselineDiagnostics.fbs" value={formData.baselineDiagnostics.fbs} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.hbsag" className="text-sm font-medium">HBsAg</label><Input id="baselineDiagnostics.hbsag" name="baselineDiagnostics.hbsag" value={formData.baselineDiagnostics.hbsag} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.vdrlRpr" className="text-sm font-medium">VDRL/RPR</label><Input id="baselineDiagnostics.vdrlRpr" name="baselineDiagnostics.vdrlRpr" value={formData.baselineDiagnostics.vdrlRpr} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.hiv" className="text-sm font-medium">HIV</label><Input id="baselineDiagnostics.hiv" name="baselineDiagnostics.hiv" value={formData.baselineDiagnostics.hiv} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.ogtt75g.fbs" className="text-sm font-medium">75g OGTT FBS</label><Input id="baselineDiagnostics.ogtt75g.fbs" name="baselineDiagnostics.ogtt75g.fbs" value={formData.baselineDiagnostics.ogtt75g.fbs} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.ogtt75g.firstHour" className="text-sm font-medium">OGTT 1st hr</label><Input id="baselineDiagnostics.ogtt75g.firstHour" name="baselineDiagnostics.ogtt75g.firstHour" value={formData.baselineDiagnostics.ogtt75g.firstHour} onChange={handleChange} /></div>
                            <div><label htmlFor="baselineDiagnostics.ogtt75g.secondHour" className="text-sm font-medium">OGTT 2nd hr</label><Input id="baselineDiagnostics.ogtt75g.secondHour" name="baselineDiagnostics.ogtt75g.secondHour" value={formData.baselineDiagnostics.ogtt75g.secondHour} onChange={handleChange} /></div>
                            <div className="md:col-span-4"><label htmlFor="baselineDiagnostics.other" className="text-sm font-medium">Other</label><Input id="baselineDiagnostics.other" name="baselineDiagnostics.other" value={formData.baselineDiagnostics.other} onChange={handleChange} /></div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" variant="clinic" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : `Register Patient`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 