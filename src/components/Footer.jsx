import { Link } from 'react-router-dom';
import { Heart, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Heart className="h-6 w-6 text-clinic-600" />
            <span className="text-lg font-semibold text-gray-900">VM Mother and Child Clinic</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <Link to="/privacy-policy" className="hover:text-clinic-600">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-clinic-600">
              Terms of Service
            </Link>
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <a href="tel:09626952050" className="hover:text-clinic-600">
                0962 695 2050
              </a>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span className="text-gray-600">
                San Nicolas Arayat Pampanga
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">Beside "Buff. It Up Auto Spa and Detailing" and In front of INC-San Nicolas</p>
          <p>&copy; {new Date().getFullYear()} VM Mother and Child Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 