import { AuthLivingCityVisual } from '@/components/auth/AuthLivingCityVisual';
import { AuthForm } from '@/components/auth/AuthForm';

export function LoginPage() {
  return (
    <div className="w-full h-full min-h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] flex flex-col lg:flex-row bg-[#F7F8F4] overflow-y-auto lg:overflow-hidden font-sans antialiased">
      {/* LEFT: Living City Digital Twin Visual Panel (~55% on desktop) */}
      <div className="w-full lg:w-[54%] xl:w-[56%] shrink-0 h-[420px] sm:h-[480px] lg:h-full relative">
        <AuthLivingCityVisual />
      </div>

      {/* RIGHT: Clean Human-Centered Authentication Panel (~45% on desktop) */}
      <div className="w-full lg:w-[46%] xl:w-[44%] flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10 bg-white lg:bg-[#F7F8F4] overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white lg:shadow-civic-card lg:border lg:border-[#D9E2EC] rounded-2xl lg:p-8">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
