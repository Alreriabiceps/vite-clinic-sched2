import { Card, CardContent, CardHeader, CardTitle } from "../../shared";
import { Heart } from "lucide-react";

export default function TermsOfService() {
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
          <h2 className="text-3xl font-bold text-gray-900">Terms of Service</h2>
          <p className="text-gray-600 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-600">
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1) What this portal is for
              </h3>
              <p>
                The VM Mother and Child Clinic portal lets you: create a patient
                account, book and manage appointments with our OB‑GYNE and
                Pediatric doctors, view basic appointment history, and receive
                reminders/updates by SMS or email. It is not an emergency
                service and does not replace in‑person consultations.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2) Booking, rescheduling, cancellations
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Staff and patient users can request available time slots shown
                  in the system. Staff may adjust slots based on clinical
                  priorities.
                </li>
                <li>
                  Cancel or reschedule at least 24 hours before your visit
                  through the portal or by contacting the clinic.
                </li>
                <li>
                  No‑show policy: after 3 documented no‑shows in 12 months, your
                  account may be flagged and future bookings may require
                  confirmation by phone.
                </li>
                <li>
                  Late arrival over 15 minutes may result in re‑queuing or
                  rescheduling to the next available time.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3) Medical records and results
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  The portal stores appointment details and selected clinical
                  notes to support your care within our clinic.
                </li>
                <li>
                  Only authorized clinic staff can edit medical entries.
                  Patients may request corrections to their demographic
                  information through the portal.
                </li>
                <li>
                  Do not upload photos or documents that contain other people’s
                  data without their consent.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                4) Payments
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Professional fees and services are payable at the clinic. If
                  online payments are offered, the exact amount will be shown
                  before you confirm.
                </li>
                <li>
                  Refunds for cancelled services follow clinic policy and
                  applicable law.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                5) Acceptable use
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Provide true, accurate information and keep your login secure.
                  You are responsible for actions taken under your account.
                </li>
                <li>
                  Do not attempt to access other patients’ data, bypass
                  security, or misuse the portal.
                </li>
                <li>
                  The portal may send transactional messages (e.g., reminders,
                  status updates). Message and data rates may apply.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                6) Disclaimers and liability
              </h3>
              <p>
                Information in the portal is for your care at our clinic. We
                provide the portal on an “as is” basis and do not guarantee
                uninterrupted access. To the extent allowed by law, the clinic
                is not liable for indirect or consequential damages from use of
                the portal.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                7) Changes
              </h3>
              <p>
                We may update these terms to reflect operational or legal
                changes. The effective date appears at the top. Continued use
                means you accept the updated terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                8) Contact
              </h3>
              <p>Questions about these terms:</p>
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
