import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  LoadingSpinner,
  usePatientAuth,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../shared";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Eye, EyeOff } from "lucide-react";
export default function PatientRegister() {
  const navigate = useNavigate();
  const { register, loading } = usePatientAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  // Consent modal
  const [showConsent, setShowConsent] = useState(false);
  const [consentTimer, setConsentTimer] = useState(0);
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Timer effect for consent modal
  useEffect(() => {
    let interval;
    if (showConsent && consentTimer < 3) {
      interval = setInterval(() => {
        setConsentTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showConsent, consentTimer]);

  // Reset timer when modal opens
  useEffect(() => {
    if (showConsent) {
      setConsentTimer(0);
      setConsentAccepted(false);
    }
  }, [showConsent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.consent)
      newErrors.consent = "You must agree to the terms and conditions";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Age validation (must be at least 1 year old)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 1) {
        newErrors.dateOfBirth = "Patient must be at least 1 year old";
      }

      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prepare data for submission
    const registrationData = {
      ...formData,
    };

    // Remove confirmPassword from the data sent to backend
    delete registrationData.confirmPassword;

    const result = await register(registrationData);

    if (result.success) {
      navigate("/patient/dashboard");
    }
  };

  return (
    <div className="min-h-screen clinic-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/patient"
            className="inline-flex items-center gap-2 text-warm-pink hover:text-warm-pink-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-warm-pink" />
            <h1 className="text-2xl font-bold text-charcoal">
              VM Mother and Child Clinic
            </h1>
          </div>
          <p className="text-muted-gold">Create your patient account</p>
        </div>

        <Card className="shadow-lg bg-off-white border-soft-olive-200">
          <CardHeader>
            <CardTitle className="text-charcoal">
              Patient Registration
            </CardTitle>
            <CardDescription className="text-muted-gold">
              Fill in your information to create your patient portal account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-charcoal">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      First Name *
                      <span className="block text-xs text-muted-gold italic font-normal">
                        Unang Pangalan
                      </span>
                    </label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className={
                        errors.firstName
                          ? "border-red-500"
                          : "border-soft-olive-300 focus:border-warm-pink"
                      }
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Last Name *
                      <span className="block text-xs text-muted-gold italic font-normal">
                        Apelyido
                      </span>
                    </label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className={
                        errors.lastName
                          ? "border-red-500"
                          : "border-soft-olive-300 focus:border-warm-pink"
                      }
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Email Address *
                    <span className="block text-xs text-muted-gold italic font-normal">
                      Email Address (E-mail)
                    </span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className={
                      errors.email
                        ? "border-red-500"
                        : "border-soft-olive-300 focus:border-warm-pink"
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Phone Number *
                      <span className="block text-xs text-muted-gold italic font-normal">
                        Numero ng Telepono
                      </span>
                    </label>
                    <Input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className={
                        errors.phoneNumber
                          ? "border-red-500"
                          : "border-soft-olive-300 focus:border-warm-pink"
                      }
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Date of Birth *
                      <span className="block text-xs text-muted-gold italic font-normal">
                        Araw ng Kapanganakan
                      </span>
                    </label>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={
                        errors.dateOfBirth
                          ? "border-red-500"
                          : "border-soft-olive-300 focus:border-warm-pink"
                      }
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Gender *
                    <span className="block text-xs text-muted-gold italic font-normal">
                      Kasarian
                    </span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-warm-pink focus:border-transparent ${
                      errors.gender ? "border-red-500" : "border-soft-olive-300"
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-charcoal">
                  Account Security
                </h3>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Password *
                    <span className="block text-xs text-muted-gold italic font-normal">
                      Lihim na Salita
                    </span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className={
                        errors.password
                          ? "border-red-500"
                          : "border-soft-olive-300 focus:border-warm-pink"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-gold hover:text-warm-pink"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Confirm Password *
                    <span className="block text-xs text-muted-gold italic font-normal">
                      Kumpirmahin ang Lihim na Salita
                    </span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-soft-olive-300 focus:border-warm-pink"
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-gold hover:text-warm-pink"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Consent */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    disabled={!consentAccepted}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, consent: Boolean(checked) })
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-charcoal"
                    >
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowConsent(true)}
                        className="text-warm-pink hover:underline"
                      >
                        Data Privacy Consent
                      </button>
                    </label>
                    {!consentAccepted && (
                      <p className="text-xs text-gray-500">
                        Please read the Data Privacy Consent to enable this
                        checkbox.
                      </p>
                    )}
                  </div>
                </div>
                {errors.consent && (
                  <p className="text-sm text-red-500">{errors.consent}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full bg-warm-pink hover:bg-warm-pink-600 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-gold">
                  Already have an account?{" "}
                  <Link
                    to="/patient/login"
                    className="text-warm-pink hover:text-warm-pink-700 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Data Privacy Consent Modal */}
      <Dialog open={showConsent} onOpenChange={setShowConsent}>
        <DialogContent className="sm:max-w-[720px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Data Privacy Consent</DialogTitle>
          </DialogHeader>
          <div className="border p-6 rounded text-gray-700 leading-relaxed">
            <p className="mb-4">
              Sa pag-participate ko sa patient portal system na pinapatakbo ng
              VM Mother and Child Clinic, kusa kong ibinibigay ang personal data
              ko, alam kong ang pagkolekta, pagproseso, at paggamit nito ay
              susunod sa Data Privacy Act of 2012 sa Pilipinas.
            </p>
            <p className="mb-4">
              Ibinibigay ko ang malinaw na consent na gamitin ng VM Mother and
              Child Clinic ang data ko para lang sa medical care, appointment
              management, at health record purposes, tinitiyak na mananatiling
              confidential ito at hindi ise-share sa third parties o aabusuhin,
              maliban kung hinihingi ng batas.
            </p>
            <p className="mb-4">
              Alam ko rin na may karapatan akong bawiin ang consent o
              mag-request na burahin ang data ko ayon sa Data Privacy Act. Ang
              pagpayag ko ay tanda ng informed consent, pag-unawa, at pagsunod
              ko sa mga prinsipyong ito, at klaro sa akin na puwede akong
              umatras o magpa-delete ng data anumang oras basta naaayon sa
              batas.
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                Contact Information:
              </h4>
              <p className="text-sm">Phone: 0962 695 2050</p>
              <p className="text-sm">Address: San Nicolas, Arayat, Pampanga</p>
              <p className="text-xs text-gray-500">
                (Beside "Buff. It Up Auto Spa and Detailing" and in front of
                INC‑San Nicolas)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsent(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setConsentAccepted(true);
                setShowConsent(false);
              }}
              disabled={consentTimer < 3}
            >
              {consentTimer < 3
                ? `Please wait ${3 - consentTimer} second${
                    3 - consentTimer !== 1 ? "s" : ""
                  }...`
                : "I have read and understood"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
