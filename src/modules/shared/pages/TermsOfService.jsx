import { Card, CardContent, CardHeader, CardTitle } from '../../shared';
import { Heart } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen clinic-gradient py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-clinic-600" />
            <h1 className="text-2xl font-bold text-gray-900">VM Mother and Child Clinic</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Terms of Service</h2>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-600">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
              <p>
                By accessing and using the services of VM Mother and Child Clinic, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Medical Services</h3>
              <p className="mb-2">Our services include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pediatric care and consultations</li>
                <li>OB-GYNE services and consultations</li>
                <li>Appointment scheduling and management</li>
                <li>Medical record management</li>
                <li>Emergency care services</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Patient Responsibilities</h3>
              <p className="mb-2">As a patient, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete personal information</li>
                <li>Keep your account credentials secure</li>
                <li>Attend scheduled appointments on time</li>
                <li>Follow medical advice and treatment plans</li>
                <li>Pay for services rendered</li>
                <li>Notify us of any changes in your information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Appointment Policy</h3>
              <p className="mb-2">Our appointment policies include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>24-hour cancellation notice required</li>
                <li>Late arrival may result in rescheduling</li>
                <li>Emergency cases may be prioritized</li>
                <li>Appointments can be rescheduled through our portal</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Payment Terms</h3>
              <p className="mb-2">Payment policies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment is due at the time of service</li>
                <li>We accept various payment methods</li>
                <li>Insurance claims will be processed as per policy</li>
                <li>Outstanding balances must be settled promptly</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Emergency Services</h3>
              <p>
                In case of medical emergencies, please call emergency services immediately. Our clinic provides emergency care during operating hours, but for life-threatening situations, please go to the nearest emergency room.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h3>
              <p>
                While we strive to provide the best possible care, we cannot guarantee specific outcomes. We are not liable for any indirect, incidental, or consequential damages arising from the use of our services.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h3>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website. Continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Information</h3>
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-2">
                <p>Phone: 0962 695 2050</p>
                <p>Address: San Nicolas Arayat Pampanga</p>
                <p className="text-sm text-gray-500">(Beside "Buff. It Up Auto Spa and Detailing" and In front of INC-San Nicolas)</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 