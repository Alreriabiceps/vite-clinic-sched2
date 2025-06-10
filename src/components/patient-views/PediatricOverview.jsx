import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatDate } from '../../lib/utils';
import { User, ShieldCheck } from 'lucide-react';

const InfoItem = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="text-sm text-gray-900">{value || 'N/A'}</p>
  </div>
);

export const PediatricOverview = ({ patient }) => {
  const record = patient.pediatricRecord;
  if (!record) return null;

  const renderDoses = (vaccineData, doses) => {
    if (!vaccineData) return null;
    return doses.map(dose => (
      <InfoItem key={dose.key} label={dose.label} value={vaccineData[dose.key]?.date ? formatDate(vaccineData[dose.key].date) : 'N/A'} />
    ));
  };
  
  const renderSingleDose = (vaccineData) => {
     if (!vaccineData) return 'N/A';
     return vaccineData.date ? formatDate(vaccineData.date) : 'N/A';
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoItem label="Patient Name" value={record.nameOfChildren} className="col-span-full" />
          <InfoItem label="Mother's Name" value={record.nameOfMother} />
          <InfoItem label="Father's Name" value={record.nameOfFather} />
          <InfoItem label="Contact Number" value={record.contactNumber} />
          <InfoItem label="Address" value={record.address} className="col-span-full" />
          <InfoItem label="Date of Birth" value={formatDate(record.birthDate)} />
          <InfoItem label="Age" value={record.age} />
          <InfoItem label="Sex" value={record.sex} />
          <InfoItem label="Birth Weight" value={record.birthWeight} />
          <InfoItem label="Birth Length" value={record.birthLength} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck/> Immunization History</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <h4 className="font-semibold text-md mb-2">DPT</h4>
              {renderDoses(record.immunizations?.dpt, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}, {key: 'd3', label: 'Dose 3'}])}
              {renderDoses(record.immunizations?.dpt, [{key: 'b1', label: 'Booster 1'}, {key: 'b2', label: 'Booster 2'}])}
            </div>
            <div>
              <h4 className="font-semibold text-md mb-2">OPV/IPV</h4>
              {renderDoses(record.immunizations?.opvIpv, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}, {key: 'd3', label: 'Dose 3'}])}
              {renderDoses(record.immunizations?.opvIpv, [{key: 'b1', label: 'Booster 1'}, {key: 'b2', label: 'Booster 2'}])}
            </div>
            <div>
              <h4 className="font-semibold text-md mb-2">H. Influenza (HIB)</h4>
              {renderDoses(record.immunizations?.hInfluenzaHib, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}, {key: 'd3', label: 'Dose 3'}, {key: 'd4', label: 'Dose 4'}])}
            </div>
             <div>
              <h4 className="font-semibold text-md mb-2">Measles, MMR</h4>
              {renderDoses(record.immunizations?.measlesMmr, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}])}
            </div>
            <div>
              <h4 className="font-semibold text-md mb-2">Pneumococcal (PCV)</h4>
              {renderDoses(record.immunizations?.pneumococcalPcv, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}, {key: 'd3', label: 'Dose 3'}, {key: 'd4', label: 'Dose 4'}])}
            </div>
             <div>
              <h4 className="font-semibold text-md mb-2">Rotavirus</h4>
              {renderDoses(record.immunizations?.rotavirus, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}, {key: 'd3', label: 'Dose 3'}])}
            </div>
            <div>
              <h4 className="font-semibold text-md mb-2">Hepatitis A</h4>
              {renderDoses(record.immunizations?.hepatitisA, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}])}
            </div>
             <div>
              <h4 className="font-semibold text-md mb-2">TdaP/Tdp</h4>
              {renderDoses(record.immunizations?.tdaPTdp, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}])}
            </div>
            <div>
              <h4 className="font-semibold text-md mb-2">Meningococcal</h4>
              {renderDoses(record.immunizations?.meningococcal, [{key: 'd1', label: 'Dose 1'}, {key: 'd2', label: 'Dose 2'}])}
            </div>
            <div className="col-span-full grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <InfoItem label="Pneumococcal (PPV)" value={renderSingleDose(record.immunizations?.pneumococcalPpv)} />
              <InfoItem label="Varicella" value={renderSingleDose(record.immunizations?.varicella)} />
              <InfoItem label="Mantoux Test" value={renderSingleDose(record.immunizations?.mantouxTest)} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}; 