import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Plus, Search, Filter } from 'lucide-react';

export default function Appointments() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage patient appointments and schedules</p>
        </div>
        <Button variant="clinic" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              Dr. Maria Sarah L. Manaloto
            </CardTitle>
            <CardDescription>OB-GYNE - Today's Schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-blue-900">Maria Santos</p>
                  <p className="text-sm text-blue-700">Prenatal Checkup</p>
                </div>
                <span className="text-sm font-medium text-blue-800">9:00 AM</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-green-900">Ana Cruz</p>
                  <p className="text-sm text-green-700">Follow-up Consultation</p>
                </div>
                <span className="text-sm font-medium text-green-800">10:30 AM</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-yellow-900">Lisa Garcia</p>
                  <p className="text-sm text-yellow-700">PAP Smear</p>
                </div>
                <span className="text-sm font-medium text-yellow-800">11:00 AM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 bg-sky-500 rounded-full"></div>
              Dr. Shara Laine S. Vino
            </CardTitle>
            <CardDescription>Pediatrician - Today's Schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sky-900">Baby Rodriguez</p>
                  <p className="text-sm text-sky-700">Well-baby Checkup</p>
                </div>
                <span className="text-sm font-medium text-sky-800">2:00 PM</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-purple-900">Miguel Santos</p>
                  <p className="text-sm text-purple-700">Vaccination</p>
                </div>
                <span className="text-sm font-medium text-purple-800">3:30 PM</span>
              </div>
            </div>
            <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-pink-900">Sofia Cruz</p>
                  <p className="text-sm text-pink-700">Consultation</p>
                </div>
                <span className="text-sm font-medium text-pink-800">4:00 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>
            Weekly appointment overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Calendar view will be implemented here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 