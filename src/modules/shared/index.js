// Shared Module Exports

// Components
export { default as DashboardLayout } from "./components/layout/DashboardLayout";
export { default as Footer } from "./components/Footer";

// Forms
export { default as ObGyneRegistrationModal } from "./components/forms/ObGyneRegistrationModal";
export { default as PediatricRegistrationModal } from "./components/forms/PediatricRegistrationModal";
export { default as EditObGynePatientModal } from "./components/forms/EditObGynePatientModal";
export { default as EditPediatricPatientModal } from "./components/forms/EditPediatricPatientModal";
export { default as AddConsultationModal } from "./components/forms/AddConsultationModal";
export { default as AddImmunizationModal } from "./components/forms/AddImmunizationModal";
export { default as CancellationRequestModal } from "./components/forms/CancellationRequestModal";
export { default as DeleteConfirmationModal } from "./components/forms/DeleteConfirmationModal";
export { default as RescheduleRequestModal } from "./components/forms/RescheduleRequestModal";

// UI Components
export { Button, buttonVariants } from "./components/ui/button";
export {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
export { Input } from "./components/ui/input";
export { Label } from "./components/ui/label";
export { Badge } from "./components/ui/badge";
export { Checkbox } from "./components/ui/checkbox";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "./components/ui/dialog";
export { LoadingSpinner } from "./components/ui/loading-spinner";
export { Toaster } from "./components/ui/toaster";
export { toast } from "./components/ui/toaster";

// Hooks
export { useAuth } from "./hooks/useAuth";
export { usePatientAuth } from "./hooks/usePatientAuth";

// Services/API
export * from "./lib/api";
export * from "./lib/utils";

// Pages
export { default as PrivacyPolicy } from "./pages/PrivacyPolicy";
export { default as TermsOfService } from "./pages/TermsOfService";
