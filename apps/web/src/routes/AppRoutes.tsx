import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { CitizenLayout } from '@/layouts/CitizenLayout';
import { OfficerLayout } from '@/layouts/OfficerLayout';
import { ManagerLayout } from '@/layouts/ManagerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute, GuestRoute, RootRoute } from '@/components/auth/ProtectedRoute';

// Public & Auth Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage';

// Citizen Experience Pages
import { CitizenHomePage } from '@/pages/citizen/CitizenHomePage';
import { ReportIssuePage } from '@/pages/citizen/ReportIssuePage';
import { MyIncidentsPage } from '@/pages/citizen/MyIncidentsPage';
import { NearbyIssuesPage } from '@/pages/citizen/NearbyIssuesPage';
import { NotificationsPage } from '@/pages/citizen/NotificationsPage';
import { ProfilePage } from '@/pages/citizen/ProfilePage';

// Officer Experience Pages
import { OfficerDashboardPage } from '@/pages/officer/OfficerDashboardPage';
import { InspectionPage } from '@/pages/officer/InspectionPage';
import { OfficerHistoryPage } from '@/pages/officer/OfficerHistoryPage';

// Manager / Operations Pages
import { CommandCenterPage } from '@/pages/manager/CommandCenterPage';
import { LiveMapPage } from '@/pages/manager/LiveMapPage';
import { IncidentsPage } from '@/pages/manager/IncidentsPage';
import { DepartmentsPage } from '@/pages/manager/DepartmentsPage';
import { DispatchPage } from '@/pages/manager/DispatchPage';
import { FieldTeamsPage } from '@/pages/manager/FieldTeamsPage';
import { AnalyticsPage } from '@/pages/manager/AnalyticsPage';
import { ReportsPage } from '@/pages/manager/ReportsPage';
import { SettingsPage } from '@/pages/manager/SettingsPage';

// Platform Admin / AI Command Pages
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AgentControlCenterPage } from '@/pages/admin/AgentControlCenterPage';
import { PoliciesPage } from '@/pages/admin/PoliciesPage';
import { DecisionAuditPage } from '@/pages/admin/DecisionAuditPage';
import { SystemTelemetryPage } from '@/pages/admin/SystemTelemetryPage';
import { UserGovernancePage } from '@/pages/admin/UserGovernancePage';
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage';
import { AdminDepartmentsPage } from '@/pages/admin/AdminDepartmentsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminIncidentsPage } from '@/pages/admin/AdminIncidentsPage';
import { AdminIncidentDossierPage } from '@/pages/admin/AdminIncidentDossierPage';

// Shared Canonical Incident Dossier
import { IncidentDossierPage } from '@/pages/common/IncidentDossierPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* ───────────────────────────────────────────────────────
          1. Public Pages — accessible to everyone
          ─────────────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        {/* Root route: if authenticated, redirect to portal; if not, show landing */}
        <Route path="/" element={<RootRoute><LandingPage /></RootRoute>} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Auth pages — if already logged in, redirect to user's portal */}
        <Route path="/auth/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="/auth/register" element={
          <GuestRoute><RegisterPage /></GuestRoute>
        } />
        <Route path="/auth/forgot-password" element={
          <GuestRoute><ForgotPasswordPage /></GuestRoute>
        } />
        <Route path="/auth/reset-password" element={
          <GuestRoute><ResetPasswordPage /></GuestRoute>
        } />
      </Route>

      {/* ───────────────────────────────────────────────────────
          2. Citizen Portal — CITIZEN role ONLY
          ─────────────────────────────────────────────────────── */}
      <Route path="/citizen" element={
        <ProtectedRoute allowedRoles={['CITIZEN']}>
          <CitizenLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CitizenHomePage />} />
        <Route path="report" element={<ReportIssuePage />} />
        <Route path="incidents" element={<MyIncidentsPage />} />
        <Route path="incidents/:id" element={<IncidentDossierPage />} />
        <Route path="nearby" element={<NearbyIssuesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ───────────────────────────────────────────────────────
          3. Field Officer Portal — FIELD_OFFICER role ONLY
          ─────────────────────────────────────────────────────── */}
      <Route path="/officer" element={
        <ProtectedRoute allowedRoles={['FIELD_OFFICER']}>
          <OfficerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<OfficerDashboardPage />} />
        <Route path="tasks" element={<OfficerDashboardPage />} />
        <Route path="tasks/:id" element={<IncidentDossierPage />} />
        <Route path="inspection" element={<InspectionPage />} />
        <Route path="history" element={<OfficerHistoryPage />} />
      </Route>

      {/* ───────────────────────────────────────────────────────
          4. Department Manager Portal — DEPARTMENT_MANAGER role ONLY
          ─────────────────────────────────────────────────────── */}
      <Route path="/manager" element={
        <ProtectedRoute allowedRoles={['DEPARTMENT_MANAGER']}>
          <ManagerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CommandCenterPage />} />
        <Route path="command-center" element={<CommandCenterPage />} />
        <Route path="3d-map" element={<LiveMapPage />} />
        <Route path="map" element={<LiveMapPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="incidents/:id" element={<IncidentDossierPage />} />
        <Route path="intelligence" element={<AgentControlCenterPage />} />
        <Route path="ai-decisions" element={<DecisionAuditPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="dispatch" element={<DispatchPage />} />
        <Route path="teams" element={<FieldTeamsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="sla" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ───────────────────────────────────────────────────────
          5. Platform Admin Portal — PLATFORM_ADMIN role ONLY
          ─────────────────────────────────────────────────────── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminOverviewPage />} />
        <Route path="agents" element={<AgentControlCenterPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="audit" element={<DecisionAuditPage />} />
        <Route path="system" element={<SystemTelemetryPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="users" element={<UserGovernancePage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="incidents" element={<AdminIncidentsPage />} />
        <Route path="incidents/:id" element={<AdminIncidentDossierPage />} />
      </Route>

      {/* Catch-all — redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
