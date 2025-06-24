import { Card, CardContent, CardHeader, CardTitle } from '../../shared';
import { Heart } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen clinic-gradient py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-clinic-600" />
            <h1 className="text-2xl font-bold text-gray-900">VM Mother and Child Clinic</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Privacy Policy</h2>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-600">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h3>
              <p>
                VM Mother and Child Clinic ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h3>
              <p className="mb-2">We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal Information (name, contact details, date of birth, gender)</li>
                <li>Medical Information (medical history, diagnoses, treatments)</li>
                <li>Payment Information (for billing purposes)</li>
                <li>Usage Data (how you interact with our services)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h3>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide medical services and care</li>
                <li>Schedule and manage appointments</li>
                <li>Process payments and insurance claims</li>
                <li>Send appointment reminders and updates</li>
                <li>Improve our services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Data Protection</h3>
              <p>
                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All medical records are kept confidential and are only accessible to authorized personnel.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h3>
              <p className="mb-2">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Healthcare providers involved in your care</li>
                <li>Insurance companies for billing purposes</li>
                <li>Legal authorities when required by law</li>
                <li>Service providers who assist in our operations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h3>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Request corrections to your information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Information</h3>
              <p>
                For questions about our Privacy Policy, please contact us at:
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