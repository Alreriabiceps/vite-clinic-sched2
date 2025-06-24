// Debug API configuration
console.log('=== API DEBUG INFO ===');
console.log('import.meta.env.MODE:', import.meta.env.MODE);
console.log('import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);

// Test the API base URL
import { authAPI } from './modules/shared/lib/api.js';

// Log the actual axios instance configuration
console.log('authAPI axios config:', authAPI.login.toString());

export default function debugAPI() {
  console.log('Debug API called');
} 