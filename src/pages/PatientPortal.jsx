import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Heart, Stethoscope, Baby, Calendar, Clock, Shield, Phone, MapPin } from 'lucide-react';

export default function PatientPortal() {
  return (
    <div className="min-h-screen clinic-gradient">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-clinic-600 rounded-full">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="p-2 bg-medical-600 rounded-full">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div className="p-2 bg-pink-500 rounded-full">
                  <Baby className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VM Mother and Child Clinic</h1>
                <p className="text-sm text-gray-600">Patient Portal</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/patient/login">Login</Link>
              </Button>
              <Button asChild variant="clinic">
                <Link to="/patient/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Appointment Online
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Schedule appointments with our experienced doctors, manage your medical records, 
            and access quality healthcare services from the comfort of your home.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 text-clinic-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-sm text-gray-600">
                Schedule appointments online 24/7 with real-time availability
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 text-medical-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
              <p className="text-sm text-gray-600">
                No more waiting on hold or visiting in person to book
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-sm text-gray-600">
                Your personal and medical information is protected and private
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-sm text-gray-600">
                Get help from our friendly staff whenever you need it
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* OB-GYNE Services */}
          <Card className="bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-800">
                <Heart className="h-5 w-5" />
                OB-GYNE Services
              </CardTitle>
              <CardDescription>
                Dr. Maria Sarah L. Manaloto - Obstetrics & Gynecology Specialist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm">• Prenatal & Postnatal Care</p>
                <p className="text-sm">• Family Planning Consultation</p>
                <p className="text-sm">• Women's Health Screening</p>
                <p className="text-sm">• PCOS & Fertility Consultation</p>
              </div>
              <div className="text-sm text-pink-700 bg-pink-50 p-2 rounded">
                <strong>Schedule:</strong> Mon 8AM-12PM, Wed 9AM-2PM, Fri 1PM-5PM
              </div>
            </CardContent>
          </Card>

          {/* Pediatric Services */}
          <Card className="bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sky-800">
                <Baby className="h-5 w-5" />
                Pediatric Services
              </CardTitle>
              <CardDescription>
                Dr. Shara Laine S. Vino - Pediatrics Specialist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm">• Well-Baby & Well-Child Checkups</p>
                <p className="text-sm">• Child Vaccination Programs</p>
                <p className="text-sm">• Newborn Consultations</p>
                <p className="text-sm">• Pediatric Health Evaluations</p>
              </div>
              <div className="text-sm text-sky-700 bg-sky-50 p-2 rounded">
                <strong>Schedule:</strong> Mon 1PM-5PM, Tue 1PM-5PM, Thu 8AM-12PM
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-clinic-600 to-medical-600 text-white">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-clinic-100 mb-6 max-w-2xl mx-auto">
              Join thousands of families who trust VM Mother and Child Clinic for their healthcare needs.
              Create your account today and start booking appointments online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="bg-white text-clinic-600 hover:bg-gray-50">
                <Link to="/patient/register">Create Account</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white border-white hover:bg-white hover:text-clinic-600">
                <Link to="/patient/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h4>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:09626952050" className="hover:text-clinic-600">
                0962 695 2050
              </a>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>San Nicolas Arayat Pampanga</span>
            </div>
            <div>
              <span className="text-gray-500">(Beside "Buff. It Up Auto Spa and Detailing" and In front of INC-San Nicolas)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 VM Mother and Child Clinic. All rights reserved.
          </p>
          <p className="text-gray-400 mt-2">
            Secure • Reliable • Professional Healthcare
          </p>
        </div>
      </footer>
    </div>
  );
} 