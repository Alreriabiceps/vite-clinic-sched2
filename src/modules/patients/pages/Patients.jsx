import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  LoadingSpinner,
  patientsAPI,
  appointmentsAPI,
  extractData,
  ObGyneRegistrationModal,
  PediatricRegistrationModal,
  toast,
} from "../../shared";
import { useState, useEffect, useRef } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Baby,
  Heart,
  Calendar,
  Phone,
  MapPin,
  Edit,
  Eye,
  GripVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [patientLastVisits, setPatientLastVisits] = useState({});
  const [stats, setStats] = useState({
    totalPatients: 0,
    pediatricPatients: 0,
    obgynePatients: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [isObGyneModalOpen, setIsObGyneModalOpen] = useState(false);
  const [isPediatricModalOpen, setIsPediatricModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Resizable columns
  const tableRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({
    0: 100, 1: 180, 2: 200, 3: 120, 4: 100, 5: 140
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeColumn, setResizeColumn] = useState(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchPatients();
    fetchStats();
    fetchLastVisits();
  }, [currentPage, selectedType]);

  const fetchLastVisits = async () => {
    try {
      const response = await appointmentsAPI.getAll({ limit: 1000 });
      const data = extractData(response);
      const appointments = data.appointments || [];
      
      // Group appointments by patient and get the latest one
      const lastVisits = {};
      appointments.forEach((apt) => {
        if (apt.patient?._id || apt.patient) {
          const patientId = apt.patient._id || apt.patient;
          if (!lastVisits[patientId] || new Date(apt.appointmentDate) > new Date(lastVisits[patientId])) {
            lastVisits[patientId] = apt.appointmentDate;
          }
        }
      });
      
      setPatientLastVisits(lastVisits);
    } catch (error) {
      console.error("Error fetching last visits:", error);
    }
  };

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
      setError("");
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (selectedType) {
        params.type = selectedType;
      }
      const response = await patientsAPI.getAll(params);
      const data = response.data.data;
      setPatients(data.patients || []);
      setTotalPages(data.pagination?.pages || 1);
      setHasMore(currentPage < (data.pagination?.pages || 1));
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to load patients");
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await patientsAPI.getStats();
      const data = response.data;

      console.log("Patient stats response:", data);

      setStats({
        totalPatients: data.totalPatients || 0,
        pediatricPatients: data.pediatricPatients || 0,
        obgynePatients: data.obgynePatients || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to search method if stats endpoint fails
      try {
        const response = await patientsAPI.search({ limit: 1 });
        const total = response.data?.pagination?.total || 0;

        setStats({
          totalPatients: total,
          pediatricPatients: 0,
          obgynePatients: 0,
        });
      } catch (fallbackError) {
        console.error("Fallback stats error:", fallbackError);
      }
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setError("");

      const params = {
        query: searchQuery,
        limit: 20,
      };
      if (selectedType) {
        params.type = selectedType;
      }

      const response = await patientsAPI.search(params);
      const data = response.data;

      setPatients(data.patients || []);
      setTotalPages(data.pagination?.pages || 1);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching patients:", error);
      setError("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegistrationSuccess = (newPatient) => {
    // Add the new patient to the list
    setPatients((prev) => [newPatient.patient, ...prev]);

    // Update stats
    setStats((prev) => ({
      totalPatients: prev.totalPatients + 1,
      pediatricPatients:
        newPatient.patient.patientType === "pediatric"
          ? prev.pediatricPatients + 1
          : prev.pediatricPatients,
      obgynePatients:
        newPatient.patient.patientType === "obgyne"
          ? prev.obgynePatients + 1
          : prev.obgynePatients,
    }));

    // Show success message
    toast.success(
      `Patient registered successfully! Patient ID: ${newPatient.patient.patientNumber}`
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Parse date correctly to avoid timezone issues
    if (typeof dateString === "string") {
      const datePart = dateString.split("T")[0];
      const [year, month, day] = datePart.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getLastVisit = (patient) => {
    const patientId = patient._id;
    const lastVisit = patientLastVisits[patientId];
    return lastVisit ? formatDate(lastVisit) : "N/A";
  };

  const getContactInfo = (patient) => {
    const email = patient.contactInfo?.email || patient.obGyneRecord?.email || "";
    const phone = patient.contactInfo?.phoneNumber || 
                  patient.obGyneRecord?.contactNumber || 
                  patient.pediatricRecord?.contactNumber || 
                  "";
    
    if (email && phone) {
      return `${email}, ${phone}`;
    } else if (email) {
      return email;
    } else if (phone) {
      return phone;
    }
    return "N/A";
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    // For babies under 2 years, show months
    if (age < 2) {
      const months =
        (today.getFullYear() - birth.getFullYear()) * 12 + monthDiff;
      return months <= 0 ? "Newborn" : `${months} months`;
    }

    return `${age} years`;
  };

  const getPatientDisplayName = (patient) => {
    if (patient.patientType === "pediatric") {
      return patient.pediatricRecord?.nameOfChildren || "Pediatric Patient";
    } else {
      return patient.obGyneRecord?.patientName || "OB-GYNE Patient";
    }
  };

  const getPatientSecondaryInfo = (patient) => {
    if (patient.patientType === "pediatric") {
      return `Mother: ${patient.pediatricRecord?.nameOfMother || "N/A"}`;
    }
    return `Contact: ${patient.obGyneRecord?.contactNumber || "N/A"}`;
  };

  const getPatientBirthDate = (patient) => {
    if (patient.patientType === "pediatric") {
      return patient.pediatricRecord?.birthDate;
    } else {
      return patient.obGyneRecord?.birthDate;
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

  const handleResize = (e, columnIndex) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeColumn(columnIndex);
    const startX = e.pageX;
    const startWidth = columnWidths[columnIndex];

    const handleMouseMove = (e) => {
      const diff = e.pageX - startX;
      // Complete freedom - allow any width from 5px to unlimited
      const newWidth = Math.max(5, startWidth + diff);
      setColumnWidths(prev => ({
        ...prev,
        [columnIndex]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPatients((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Sortable row component
  function SortableRow({ patient }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: patient._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className="hover:bg-gray-50"
      >
        <td className="px-1 py-2 border-r border-gray-100">
          <div className="flex items-center gap-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-3 w-3" />
            </button>
            <span className="text-gray-900">
              {patient.patientId || patient.patientNumber || "N/A"}
            </span>
          </div>
        </td>
        <td className="px-1 py-2 font-medium border-r border-gray-100 truncate">
          {getPatientDisplayName(patient)}
        </td>
        <td className="px-1 py-2 truncate border-r border-gray-100 text-gray-600">
          {getContactInfo(patient)}
        </td>
        <td className="px-1 py-2 border-r border-gray-100 text-gray-600">
          {getLastVisit(patient)}
        </td>
        <td className="px-1 py-2 border-r border-gray-100">
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(
              patient.status
            )}`}
          >
            {patient.status || "New"}
          </span>
        </td>
        <td className="px-1 py-2">
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => navigate(`/patients/${patient._id}`)}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => navigate(`/patients/${patient._id}`)}
            >
              Edit
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        </div>
        <Button
          variant="clinic"
          className="flex items-center gap-2"
          onClick={() => {
            // Show a dialog to choose patient type or default to OB-GYNE
            setIsObGyneModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Patient Management Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Management</h2>
        <p className="text-gray-600 mb-4">Manage patient records and information</p>
      </div>

      {/* Search and Tabs */}
      <Card className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
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
              <Button
                variant={selectedType === "" ? "clinic" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedType("");
                  setCurrentPage(1);
                }}
              >
                All
              </Button>
              <Button
                variant={selectedType === "ob-gyne" ? "clinic" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedType("ob-gyne");
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" /> OB-GYNE
              </Button>
              <Button
                variant={selectedType === "pediatric" ? "clinic" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedType("pediatric");
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2"
              >
                <Baby className="h-4 w-4" /> Pediatric
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
            onClick={() => {
              setError("");
              fetchPatients();
            }}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Patient Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-charcoal">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warm-pink">
              {stats.totalPatients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-gold">Registered patients</p>
          </CardContent>
        </Card>

        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-charcoal">
              Pediatric Patients
            </CardTitle>
            <Baby className="h-4 w-4 text-muted-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warm-pink">
              {stats.pediatricPatients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-gold">
              {stats.totalPatients > 0
                ? Math.round(
                    (stats.pediatricPatients / stats.totalPatients) * 100
                  )
                : 0}
              % of total patients
            </p>
          </CardContent>
        </Card>

        <Card className="bg-off-white border-soft-olive-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-charcoal">
              OB-GYNE Patients
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warm-pink">
              {stats.obgynePatients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-gold">
              {stats.totalPatients > 0
                ? Math.round((stats.obgynePatients / stats.totalPatients) * 100)
                : 0}
              % of total patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card className="bg-white border-soft-olive-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">All Patients</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery
                  ? "No patients found"
                  : "No patients registered yet"}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "Start by registering your first patient"}
              </p>
              {!searchQuery && (
                <Button
                  variant="clinic"
                  onClick={() => setIsObGyneModalOpen(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add New Patient
                </Button>
              )}
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="overflow-x-auto">
                  <table ref={tableRef} className="min-w-full text-sm border-collapse">
                    <colgroup>
                      <col style={{ width: `${columnWidths[0]}px`, minWidth: '80px' }} />
                      <col style={{ width: `${columnWidths[1]}px`, minWidth: '120px' }} />
                      <col style={{ width: `${columnWidths[2]}px`, minWidth: '150px' }} />
                      <col style={{ width: `${columnWidths[3]}px`, minWidth: '120px' }} />
                      <col style={{ width: `${columnWidths[4]}px`, minWidth: '90px' }} />
                      <col style={{ width: `${columnWidths[5]}px`, minWidth: '120px' }} />
                    </colgroup>
                    <thead className="bg-gray-50 text-charcoal">
                      <tr>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 0)}></div>
                          Patient ID
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 1)}></div>
                          Name
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 2)}></div>
                          Contact
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 3)}></div>
                          Last Visit
                        </th>
                        <th className="px-1 py-2 text-left relative group">
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 group-hover:bg-blue-200 transition-colors" 
                               onMouseDown={(e) => handleResize(e, 4)}></div>
                          Status
                        </th>
                        <th className="px-1 py-2 text-left relative">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <SortableContext
                        items={patients.map((p) => p._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {patients.map((patient) => (
                          <SortableRow key={patient._id} patient={patient} />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                </div>
              </DndContext>
                
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={!hasMore}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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
