import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Plus, Search, Filter, Baby, Heart } from 'lucide-react';

export default function Patients() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Baby className="h-4 w-4" />
            New Pediatric
          </Button>
          <Button variant="clinic" className="flex items-center gap-2">
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
                <input
                  type="text"
                  placeholder="Search patients by name, ID, or contact..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clinic-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +15 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pediatric Patients</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">
              46% of total patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OB-GYNE Patients</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">667</div>
            <p className="text-xs text-muted-foreground">
              54% of total patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-sky-600" />
              Recent Pediatric Patients
            </CardTitle>
            <CardDescription>
              Latest pediatric patient registrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="doctor-card-pediatric p-3 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Baby Rodriguez</p>
                  <p className="text-sm text-gray-600">PED000123</p>
                  <p className="text-xs text-gray-500">Mother: Maria Rodriguez</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">6 months</p>
                  <p className="text-xs text-gray-500">Registered today</p>
                </div>
              </div>
            </div>
            
            <div className="doctor-card-pediatric p-3 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Miguel Santos</p>
                  <p className="text-sm text-gray-600">PED000122</p>
                  <p className="text-xs text-gray-500">Mother: Ana Santos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">2 years</p>
                  <p className="text-xs text-gray-500">Registered yesterday</p>
                </div>
              </div>
            </div>

            <div className="doctor-card-pediatric p-3 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Sofia Cruz</p>
                  <p className="text-sm text-gray-600">PED000121</p>
                  <p className="text-xs text-gray-500">Mother: Lisa Cruz</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">1 year</p>
                  <p className="text-xs text-gray-500">Registered 2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Recent OB-GYNE Patients
            </CardTitle>
            <CardDescription>
              Latest OB-GYNE patient registrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="doctor-card-ob-gyne p-3 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Maria Santos</p>
                  <p className="text-sm text-gray-600">OBG000456</p>
                  <p className="text-xs text-gray-500">Contact: +63 912 345 6789</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">28 years</p>
                  <p className="text-xs text-gray-500">Registered today</p>
                </div>
              </div>
            </div>

            <div className="doctor-card-ob-gyne p-3 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Ana Cruz</p>
                  <p className="text-sm text-gray-600">OBG000455</p>
                  <p className="text-xs text-gray-500">Contact: +63 912 345 6788</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">32 years</p>
                  <p className="text-xs text-gray-500">Registered yesterday</p>
                </div>
              </div>
            </div>

            <div className="doctor-card-ob-gyne p-3 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Lisa Garcia</p>
                  <p className="text-sm text-gray-600">OBG000454</p>
                  <p className="text-xs text-gray-500">Contact: +63 912 345 6787</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">25 years</p>
                  <p className="text-xs text-gray-500">Registered 2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>
            Complete patient database with search and filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Patient list table will be implemented here</p>
              <p className="text-sm text-gray-400 mt-2">
                With pagination, sorting, and advanced filtering
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 