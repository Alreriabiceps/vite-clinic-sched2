import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { formatDate } from '../../../shared/lib/utils';
import { 
  Heart, User, Stethoscope, Beaker, ShieldCheck,
  AlertCircle, CheckCircle 
} from 'lucide-react';

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

export const ObGyneOverview = ({ patient }) => {
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
            <InfoItem label="Last Attack Date" value={formatDate(record.pastMedicalHistory?.lastAttack)} />
            <InfoItem label="Previous Surgery Date" value={formatDate(record.pastMedicalHistory?.previousSurgery)} />
            <InfoItem label="Allergies" value={record.pastMedicalHistory?.allergies} />
            {record.pastMedicalHistory?.others && (
              <div className="col-span-2">
                <InfoItem label="Other Medical History" value={record.pastMedicalHistory?.others} />
              </div>  
            )}
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
            <InfoItem label="75g OGTT FBS" value={record.baselineDiagnostics?.ogtt75g?.fbs} />
            <InfoItem label="OGTT 1st hr" value={record.baselineDiagnostics?.ogtt75g?.firstHour} />
            <InfoItem label="OGTT 2nd hr" value={record.baselineDiagnostics?.ogtt75g?.secondHour} />
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
            <InfoItem label="Tdap" value={formatDate(record.immunizations?.tdap)} />
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