import { Sparkles, Key, AlertCircle, HelpCircle } from "lucide-react";

interface NavbarProps {
  isConfigured: boolean;
}

export default function Navbar({ isConfigured }: NavbarProps) {
  return (
    <header className="border-b border-[#E7E5E4] bg-[#FAF9F6] sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1C1917] rounded flex items-center justify-center text-[#FAFAF9]" id="nav-logo">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="font-sans font-bold tracking-tight text-lg text-[#1C1917]" id="nav-title">
            Brand Builder Studio
          </h1>
          <p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest">
            Cross-Channel Product Imagining
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isConfigured ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono">GEMINI API CONNECTED</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
            <AlertCircle className="w-4 h-4" />
            <span className="font-mono">KEY MISSING (SETUP IN SECRETS)</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-stone-400 text-xs hover:text-stone-600 transition" title="Using Gemini-2.5-flash-image (Nano Banana)">
          <HelpCircle className="w-4 h-4" />
          <span className="font-mono text-[11px]">Nano-Banana Model</span>
        </div>
      </div>
    </header>
  );
}
