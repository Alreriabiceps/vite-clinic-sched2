import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, buttonVariants, cn } from '../../shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Stethoscope, Baby, Calendar, Clock, Shield, Phone, MapPin } from 'lucide-react';

export default function PatientPortal() {
  return (
    <div className="min-h-screen clinic-gradient">
      {/* Header */}
      <header className="bg-off-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-warm-pink rounded-full">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="p-2 bg-muted-gold rounded-full">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div className="p-2 bg-soft-olive-500 rounded-full">
                  <Baby className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">VM Mother and Child Clinic</h1>
                <p className="text-sm text-muted-gold">Patient Portal</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/patient/login" 
                className={cn(buttonVariants({ variant: "outline" }), "border-warm-pink text-warm-pink hover:bg-warm-pink hover:text-white")}
              >
                Login
              </Link>
              <Link 
                to="/patient/register" 
                className={cn(buttonVariants(), "bg-warm-pink hover:bg-warm-pink-600 text-white")}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-charcoal mb-4">
            Book Your Appointment Online
          </h2>
          <p className="text-xl text-muted-gold max-w-3xl mx-auto">
            Schedule appointments with our experienced doctors, manage your medical records, 
            and access quality healthcare services from the comfort of your home.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center bg-off-white border-soft-olive-200">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 text-warm-pink mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">Easy Booking</h3>
              <p className="text-sm text-muted-gold">
                Schedule appointments online 24/7 with real-time availability
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-off-white border-soft-olive-200">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 text-muted-gold mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">Save Time</h3>
              <p className="text-sm text-muted-gold">
                No more waiting on hold or visiting in person to book
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-off-white border-soft-olive-200">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-soft-olive-600 mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">Secure</h3>
              <p className="text-sm text-muted-gold">
                Your personal and medical information is protected and private
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-off-white border-soft-olive-200">
            <CardContent className="pt-6">
              <Phone className="h-12 w-12 text-warm-pink mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">Support</h3>
              <p className="text-sm text-muted-gold">
                Get help from our friendly staff whenever you need it
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* OB-GYNE Services */}
          <Card className="bg-gradient-to-br from-light-blush to-light-blush-200 border-warm-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warm-pink-700">
                <Heart className="h-5 w-5" />
                OB-GYNE Services
              </CardTitle>
              <CardDescription className="text-muted-gold">
                Dr. Maria Sarah L. Manaloto - Obstetrics & Gynecology Specialist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-charcoal">
                <p className="text-sm">• Prenatal & Postnatal Care</p>
                <p className="text-sm">• Family Planning Consultation</p>
                <p className="text-sm">• Women's Health Screening</p>
                <p className="text-sm">• PCOS & Fertility Consultation</p>
              </div>
              <div className="text-sm text-warm-pink-700 bg-light-blush p-2 rounded">
                <strong>Schedule:</strong> Mon 8AM-12PM, Wed 9AM-2PM, Fri 1PM-5PM
              </div>
            </CardContent>
          </Card>

          {/* Pediatric Services */}
          <Card className="bg-gradient-to-br from-soft-olive-100 to-soft-olive-200 border-soft-olive-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-gold-700">
                <Baby className="h-5 w-5" />
                Pediatric Services
              </CardTitle>
              <CardDescription className="text-muted-gold">
                Dr. Shara Laine S. Vino - Pediatrics Specialist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-charcoal">
                <p className="text-sm">• Well-Baby & Well-Child Checkups</p>
                <p className="text-sm">• Child Vaccination Programs</p>
                <p className="text-sm">• Newborn Consultations</p>
                <p className="text-sm">• Pediatric Health Evaluations</p>
              </div>
              <div className="text-sm text-muted-gold-700 bg-soft-olive-100 p-2 rounded">
                <strong>Schedule:</strong> Mon 1PM-5PM, Tue 1PM-5PM, Thu 8AM-12PM
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-warm-pink to-muted-gold text-white">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of families who trust VM Mother and Child Clinic for their healthcare needs.
              Create your account today and start booking appointments online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/patient/register" 
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "bg-white text-warm-pink border-white hover:bg-off-white")}
              >
                Create Account
              </Link>
              <Link 
                to="/patient/login" 
                className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "text-white border-white hover:bg-white hover:text-warm-pink")}
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <h4 className="text-lg font-semibold text-charcoal mb-4">Need Help?</h4>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-muted-gold">
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:09626952050" className="hover:text-warm-pink">
                0962 695 2050
              </a>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>San Nicolas Arayat Pampanga</span>
            </div>
            <div>
              <span className="text-muted-gold/70">(Beside "Buff. It Up Auto Spa and Detailing" and In front of INC-San Nicolas)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/70">
            © 2025 VM Mother and Child Clinic. All rights reserved.
          </p>
          <p className="text-white/70 mt-2">
            Secure • Reliable • Professional Healthcare
          </p>
        </div>
      </footer>
    </div>
  );
} 