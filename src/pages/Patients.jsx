import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Users, Plus, Search, Filter, Baby, Heart, Calendar, Phone, MapPin, Edit, Eye } from 'lucide-react';
import { patientsAPI } from '../lib/api';
import ObGyneRegistrationModal from '../components/forms/ObGyneRegistrationModal';
import PediatricRegistrationModal from '../components/forms/PediatricRegistrationModal';
import { toast } from '../components/ui/toast';
import { useNavigate } from 'react-router-dom';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    pediatricPatients: 0,
    obgynePatients: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [isObGyneModalOpen, setIsObGyneModalOpen] = useState(false);
  const [isPediatricModalOpen, setIsPediatricModalOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchStats();
  }, [currentPage, selectedType]);

  useEffect(() => {
    // Debounced search
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        fetchPatients();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: 10,
        status: ['Active', 'New'],
        ...(selectedType && { type: selectedType })
      };

      console.log('Fetching patients with params:', params);
      const response = await patientsAPI.getAll(params);
      const data = response.data.data;
      
      console.log('Patient list response:', data);
      console.log('Patients found:', data.patients?.length || 0);
      
      setPatients(data.patients || []);
      setTotalPages(data.pagination?.pages || 1);
      setHasMore(currentPage < (data.pagination?.pages || 1));
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await patientsAPI.getStats();
      const data = response.data;
      
      console.log('Patient stats response:', data);

      setStats({
        totalPatients: data.totalPatients || 0,
        pediatricPatients: data.pediatricPatients || 0,
        obgynePatients: data.obgynePatients || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to search method if stats endpoint fails
      try {
        const response = await patientsAPI.search({ limit: 1 });
        const total = response.data?.pagination?.total || 0;
        
        setStats({
          totalPatients: total,
          pediatricPatients: 0,
          obgynePatients: 0
        });
      } catch (fallbackError) {
        console.error('Fallback stats error:', fallbackError);
      }
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setError('');
      
      const params = {
        query: searchQuery,
        ...(selectedType && { type: selectedType }),
        limit: 20
      };

      const response = await patientsAPI.search(params);
      const data = response.data;
      
      setPatients(data.patients || []);
      setTotalPages(data.pagination?.pages || 1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching patients:', error);
      setError('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegistrationSuccess = (newPatient) => {
    // Add the new patient to the list
    setPatients(prev => [newPatient.patient, ...prev]);
    
    // Update stats
    setStats(prev => ({
      totalPatients: prev.totalPatients + 1,
      pediatricPatients: newPatient.patient.patientType === 'pediatric' 
        ? prev.pediatricPatients + 1 
        : prev.pediatricPatients,
      obgynePatients: newPatient.patient.patientType === 'obgyne' 
        ? prev.obgynePatients + 1 
        : prev.obgynePatients
    }));

    // Show success message
    toast.success(`Patient registered successfully! Patient ID: ${newPatient.patient.patientNumber}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // For babies under 2 years, show months
    if (age < 2) {
      const months = (today.getFullYear() - birth.getFullYear()) * 12 + monthDiff;
      return months <= 0 ? 'Newborn' : `${months} months`;
    }
    
    return `${age} years`;
  };

  const getPatientDisplayName = (patient) => {
    if (patient.patientType === 'pediatric') {
      return patient.pediatricRecord?.nameOfChildren || 'Pediatric Patient';
    } else {
      return patient.obGyneRecord?.patientName || 'OB-GYNE Patient';
    }
  };

  const getPatientSecondaryInfo = (patient) => {
    if (patient.patientType === 'pediatric') {
      return `Mother: ${patient.pediatricRecord?.nameOfMother || 'N/A'}`;
    }
    return `Contact: ${patient.obGyneRecord?.contactNumber || 'N/A'}`;
  };

  const getPatientBirthDate = (patient) => {
    if (patient.patientType === 'pediatric') {
      return patient.pediatricRecord?.birthDate;
    } else {
      return patient.obGyneRecord?.birthDate;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsPediatricModalOpen(true)}
          >
            <Baby className="h-4 w-4" />
            New Pediatric
          </Button>
          <Button 
            variant="clinic" 
            className="flex items-center gap-2"
            onClick={() => setIsObGyneModalOpen(true)}
          >
            <Heart className="h-4 w-4" />
            New OB-GYNE
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search patients by name, ID, or contact..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="pediatric">Pediatric</option>
                <option value="obgyne">OB-GYNE</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setError(''); fetchPatients(); }}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Patient Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Registered patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pediatric Patients</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pediatricPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPatients > 0 ? Math.round((stats.pediatricPatients / stats.totalPatients) * 100) : 0}% of total patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OB-GYNE Patients</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.obgynePatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPatients > 0 ? Math.round((stats.obgynePatients / stats.totalPatients) * 100) : 0}% of total patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>
            Complete patient database with search and filtering
            {searchQuery && ` - Showing results for "${searchQuery}"`}
            {selectedType && ` - Filtered by ${selectedType} patients`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery ? 'No patients found' : 'No patients registered yet'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters' 
                  : 'Start by registering your first patient'
                }
              </p>
              {!searchQuery && (
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setIsPediatricModalOpen(true)}
                  >
                    <Baby className="h-4 w-4 mr-2" />
                    Register Pediatric Patient
                  </Button>
                  <Button 
                    variant="clinic"
                    onClick={() => setIsObGyneModalOpen(true)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Register OB-GYNE Patient
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Patient Cards */}
              <div className="grid gap-4">
                {patients.map((patient) => (
                  <div 
                    key={patient._id} 
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      patient.patientType === 'pediatric' 
                        ? 'doctor-card-pediatric' 
                        : 'doctor-card-ob-gyne'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {patient.patientType === 'pediatric' ? (
                            <Baby className="h-5 w-5 text-sky-600" />
                          ) : (
                            <Heart className="h-5 w-5 text-pink-600" />
                          )}
                          <h3 className="font-semibold text-gray-900">
                            {getPatientDisplayName(patient)}
                          </h3>
                          <span className="text-xs bg-white px-2 py-1 rounded border">
                            {patient.patientId || patient._id}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Age: {calculateAge(getPatientBirthDate(patient))}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{patient.contactInfo?.phoneNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(patient.status)}`}>
                              {patient.status || 'New'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {getPatientSecondaryInfo(patient)}
                        </p>
                        
                        <p className="text-xs text-gray-400 mt-1">
                          Registered: {formatDate(patient.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/patients/${patient._id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/patients/${patient._id}`)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasMore}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ObGyneRegistrationModal 
        isOpen={isObGyneModalOpen} 
        onClose={() => setIsObGyneModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
      <PediatricRegistrationModal 
        isOpen={isPediatricModalOpen}
        onClose={() => setIsPediatricModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
} 