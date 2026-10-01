import { Link } from 'react-router-dom';

export function AuthFooter() {
  return (
    <footer className="h-13 md:h-14 w-full bg-white/90 border-t border-[#D9E2EC]/70 px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-[#526777] font-sans shrink-0 z-30 select-none">
      <div className="flex items-center gap-2">
        <span className="font-medium text-[#102A43]">© 2026 CivicPulse</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="hidden sm:inline text-[11px] text-slate-400">
          Municipal Operations Infrastructure
        </span>
      </div>

      <div className="flex items-center gap-5 sm:gap-6 text-xs">
        <a
          href="#privacy"
          onClick={(e) => e.preventDefault()}
          className="hover:text-[#102A43] transition-colors"
        >
          Privacy
        </a>
        <a
          href="#terms"
          onClick={(e) => e.preventDefault()}
          className="hover:text-[#102A43] transition-colors"
        >
          Terms
        </a>
        <a
          href="#help"
          onClick={(e) => e.preventDefault()}
          className="hover:text-[#102A43] transition-colors"
        >
          Help
        </a>
      </div>
    </footer>
  );
}
