import { Outlet } from 'react-router-dom';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';

export function AuthLayout() {
  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#F7F8F4] text-[#102A43] font-sans selection:bg-[#2878E5] selection:text-white antialiased overflow-x-hidden">
      {/* Focused 64px Auth Header */}
      <AuthHeader />

      {/* Main Authentication Workspace — 100vh Balanced Split */}
      <main className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden relative">
        <Outlet />
      </main>

      {/* Minimal 52px Municipal Footer */}
      <AuthFooter />
    </div>
  );
}

export default AuthLayout;
