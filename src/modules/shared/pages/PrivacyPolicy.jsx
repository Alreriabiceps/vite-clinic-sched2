import { Card, CardContent, CardHeader, CardTitle } from "../../shared";
import { Heart } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen clinic-gradient py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-clinic-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              VM Mother and Child Clinic
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Privacy Policy</h2>
          <p className="text-gray-600 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-600">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1) Who we are
              </h3>
              <p>
                VM Mother and Child Clinic provides OB‑GYNE and Pediatric
                services. This policy explains how the portal handles your
                information.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2) Data we collect in this system
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Account data: name, email, phone, date of birth, gender.
                </li>
                <li>
                  Appointment data: doctor, date/time, service type, status,
                  notes.
                </li>
                <li>
                  Clinical notes entered by staff during care (limited to what’s
                  needed for your visit).
                </li>
                <li>
                  Technical data: device/browser info and usage for security and
                  reliability.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3) How we use it
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your portal account.</li>
                <li>
                  To schedule, confirm, reschedule, or cancel appointments.
                </li>
                <li>
                  To send reminders and updates (SMS/email/push if enabled).
                </li>
                <li>To support clinical care and maintain accurate records.</li>
                <li>To secure the system and prevent fraud or abuse.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                4) Sharing
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Within the clinic with authorized staff involved in your care.
                </li>
                <li>
                  With service providers that host or support the system (under
                  confidentiality agreements).
                </li>
                <li>
                  With insurers or authorities where required by law or for
                  billing, with appropriate safeguards.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                5) Retention and security
              </h3>
              <p>
                Records are retained as required by medical and accounting
                rules. We use role‑based access, transport encryption (HTTPS),
                and audit logging where applicable.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                6) Your choices
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Access or correct your details via the portal or by contacting
                  us.
                </li>
                <li>
                  Request a copy of your records subject to clinical review and
                  legal requirements.
                </li>
                <li>
                  Withdraw consent for reminders/marketing where applicable
                  (transactional messages may still be sent).
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                7) Children
              </h3>
              <p>
                For pediatric patients, parents or legal guardians manage the
                child’s records and consent.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                8) Contact
              </h3>
              <div className="mt-2">
                <p>Phone: 0962 695 2050</p>
                <p>Address: San Nicolas, Arayat, Pampanga</p>
                <p className="text-sm text-gray-500">
                  (Beside “Buff. It Up Auto Spa and Detailing” and in front of
                  INC‑San Nicolas)
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
