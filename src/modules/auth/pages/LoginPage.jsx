import { useState, useEffect } from 'react';
import { useAuth, Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, LoadingSpinner, Checkbox } from '../../shared';
import { Heart, Stethoscope, Baby, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, error } = useAuth();

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('admin_remembered_username');
    const savedPassword = localStorage.getItem('admin_remembered_password');
    const rememberMeChecked = localStorage.getItem('admin_remember_me') === 'true';
    
    if (rememberMeChecked && savedUsername && savedPassword) {
      setCredentials({
        username: savedUsername,
        password: savedPassword
      });
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(credentials);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('admin_remembered_username', credentials.username);
        localStorage.setItem('admin_remembered_password', credentials.password);
        localStorage.setItem('admin_remember_me', 'true');
      } else {
        // Clear saved credentials if remember me is unchecked
        localStorage.removeItem('admin_remembered_username');
        localStorage.removeItem('admin_remembered_password');
        localStorage.removeItem('admin_remember_me');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen clinic-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="p-3 bg-clinic-600 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div className="p-3 bg-medical-600 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div className="p-3 bg-pink-500 rounded-full">
              <Baby className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VM Mother and Child Clinic
          </h1>
          <p className="text-gray-600">
            Patient Information & Reservation System
          </p>
        </div>

        {/* Login Card */}
        <Card className="medical-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the clinic system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  Remember password
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="clinic"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 VM Mother and Child Clinic. All rights reserved.</p>
          <p className="mt-1">Secure • Reliable • Professional</p>
        </div>
      </div>
    </div>
  );
} 