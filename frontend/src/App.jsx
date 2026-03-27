import { Suspense, lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import OrganizerRoute from './components/OrganizerRoute';

// Public pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const SpeakersPage = lazy(() => import('./pages/SpeakersPage'));
const WorkshopsPage = lazy(() => import('./pages/WorkshopsPage'));
const TicketsPage = lazy(() => import('./pages/TicketsPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const CertificateValidatorPage = lazy(() => import('./pages/CertificateValidatorPage'));

// Dashboard pages
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const MyTicketPage = lazy(() => import('./pages/dashboard/MyTicketPage'));
const MyWorkshopsPage = lazy(() => import('./pages/dashboard/MyWorkshopsPage'));
const PurchasePage = lazy(() => import('./pages/dashboard/PurchasePage'));
const CertificatesPage = lazy(() => import('./pages/dashboard/CertificatesPage'));

// Organizer pages
const OrgDashboard = lazy(() => import('./pages/organizer/OrgDashboard'));
const ParticipantsListPage = lazy(() => import('./pages/organizer/ParticipantsListPage'));
const PaymentsReportPage = lazy(() => import('./pages/organizer/PaymentsReportPage'));
const AccreditationPage = lazy(() => import('./pages/organizer/AccreditationPage'));
const WorkshopsReportPage = lazy(() => import('./pages/organizer/WorkshopsReportPage'));
const GenerateCertificatesPage = lazy(() => import('./pages/organizer/GenerateCertificatesPage'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/speakers" element={<SpeakersPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/validate-certificate" element={<CertificateValidatorPage />} />
      </Route>

      {/* Dashboard routes (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/dashboard/my-ticket" element={<MyTicketPage />} />
          <Route path="/dashboard/my-workshops" element={<MyWorkshopsPage />} />
          <Route path="/dashboard/purchase" element={<PurchasePage />} />
          <Route path="/dashboard/certificates" element={<CertificatesPage />} />
        </Route>
      </Route>

      {/* Organizer routes (protected + organizer role) */}
      <Route element={<OrganizerRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/organizer" element={<OrgDashboard />} />
          <Route path="/organizer/participants" element={<ParticipantsListPage />} />
          <Route path="/organizer/payments" element={<PaymentsReportPage />} />
          <Route path="/organizer/accreditation" element={<AccreditationPage />} />
          <Route path="/organizer/workshops" element={<WorkshopsReportPage />} />
          <Route path="/organizer/certificates" element={<GenerateCertificatesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
