import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, LoadingSpinner, usePatientAuth } from '../../shared';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function PatientLogin() {
  const navigate = useNavigate();
  const { login, patient, loading } = usePatientAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (patient && !loading) {
      navigate('/patient/dashboard');
    }
  }, [patient, loading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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

    const result = await login(formData);
    
    if (result.success) {
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="min-h-screen clinic-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/patient" className="inline-flex items-center gap-2 text-warm-pink hover:text-warm-pink-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-warm-pink" />
            <h1 className="text-2xl font-bold text-charcoal">VM Mother and Child Clinic</h1>
          </div>
          <p className="text-muted-gold">Sign in to your patient account</p>
        </div>

        <Card className="shadow-lg bg-off-white border-soft-olive-200">
          <CardHeader>
            <CardTitle className="text-charcoal">Patient Login</CardTitle>
            <CardDescription className="text-muted-gold">
              Enter your credentials to access your patient portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={errors.email ? 'border-red-500' : 'border-soft-olive-300 focus:border-warm-pink'}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={errors.password ? 'border-red-500' : 'border-soft-olive-300 focus:border-warm-pink'}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-gold hover:text-warm-pink"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-warm-pink hover:bg-warm-pink-600 text-white" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-gold">
                Don't have an account?{' '}
                <Link to="/patient/register" className="text-warm-pink hover:text-warm-pink-700 font-medium">
                  Create one here
                </Link>
              </p>
            </div>

            {/* Demo Account Info */}
            <div className="mt-6 p-4 bg-soft-olive-100 rounded-lg border border-soft-olive-200">
              <h4 className="text-sm font-medium text-muted-gold-700 mb-2">Demo Account</h4>
              <p className="text-xs text-muted-gold mb-2">
                For testing purposes, you can register with any email address to create a new patient account.
              </p>
              <p className="text-xs text-muted-gold">
                Once registered, you'll be able to book appointments with our available doctors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-gold">
            Secure login protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
} 