import { Building2, UserRound, HardHat, ShieldCheck, KeyRound } from 'lucide-react';

interface DemoAccount {
  role: string;
  name: string;
  email: string;
  icon: typeof Building2;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Department Manager',
    name: 'Sarah Chen',
    email: 'manager.chen@civicpulse.org',
    icon: Building2,
  },
  {
    role: 'Citizen',
    name: 'Elena Rostova',
    email: 'citizen.elena@civicpulse.org',
    icon: UserRound,
  },
  {
    role: 'Field Officer',
    name: 'Marcus Vance',
    email: 'officer.vance@civicpulse.org',
    icon: HardHat,
  },
  {
    role: 'Platform Admin',
    name: 'David Miller',
    email: 'admin.miller@civicpulse.org',
    icon: ShieldCheck,
  },
];

interface DemoAccountPanelProps {
  currentEmail: string;
  onSelectEmail: (email: string) => void;
}

export function DemoAccountPanel({ currentEmail, onSelectEmail }: DemoAccountPanelProps) {
  // Only render in development environment
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="pt-3 border-t border-slate-100">
      <div className="bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#102A43]">
            <KeyRound className="w-3.5 h-3.5 text-[#2878E5]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-sans">
              Development Access
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-[#D9E2EC]">
            Pass: Password123!
          </span>
        </div>

        <p className="text-[11px] text-slate-500 font-sans leading-tight">
          Select a profile to autofill its email. Enter the demo password above to authenticate.
        </p>

        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            const isSelected = currentEmail.toLowerCase() === account.email.toLowerCase();

            return (
              <button
                key={account.email}
                type="button"
                onClick={() => onSelectEmail(account.email)}
                className={`p-2 rounded-lg text-left transition-all flex items-center gap-2 border text-xs font-sans ${
                  isSelected
                    ? 'bg-blue-50/70 border-[#2878E5] text-[#102A43] shadow-2xs'
                    : 'bg-white border-[#D9E2EC] hover:border-slate-300 text-slate-700 hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#2878E5] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="font-semibold text-[11px] truncate leading-tight text-[#102A43]">
                    {account.role}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                    {account.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
