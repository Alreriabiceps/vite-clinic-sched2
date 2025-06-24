import { useState } from 'react';
import { useAuth, Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, LoadingSpinner } from '../../shared';
import { Heart, Stethoscope, Baby } from 'lucide-react';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(credentials);
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
            <CardTitle className="text-2xl">Staff Login</CardTitle>
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
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

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

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Staff:</strong> staff / staff123</p>
                <p><strong>Doctor:</strong> doctor / doctor123</p>
              </div>
            </div>
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