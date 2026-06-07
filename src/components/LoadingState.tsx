import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2, Image as ImageIcon } from "lucide-react";

interface LoadingStateProps {
  productDescription: string;
}

const MESSAGES = [
  "Formulating visual consistency standards...",
  "Running brand asset mapping pipelines...",
  "Structuring lighting and composition grids...",
  "Invoking Nano-Banana for City Billboard (landscape)...",
  "Engraving high-contrast details for Print Newspaper (3:4)...",
  "Snapping organic lighting shadows for Social Feed (square)...",
  "Verifying campaign alignment: enforcing human-free environment...",
  "Finalizing visual renders..."
];

export default function LoadingState({ productDescription }: LoadingStateProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg min-h-[400px]" id="loading-container">
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-[#1C1917]/10 border-t-[#C2410C]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-16 h-16 rounded-full bg-[#1C1917] flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
        </motion.div>
      </div>

      <h3 className="font-sans font-bold text-xl text-[#1C1917] mb-2" id="loading-title">
        Generating Brand Materials
      </h3>
      
      <p className="font-mono text-xs text-stone-500 uppercase tracking-widest mb-6">
        Model: Gemini Nano-Banana
      </p>

      <div className="max-w-md text-center px-4 mb-8">
        <p className="text-stone-600 text-sm italic font-sans border-l-2 border-[#C2410C] pl-3 py-1 bg-white/50 rounded-r">
          &ldquo;{productDescription}&rdquo;
        </p>
      </div>

      <div className="h-6 overflow-hidden flex justify-center items-center w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessageIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-stone-700 font-mono text-[11px] uppercase tracking-wider text-center"
          >
            {MESSAGES[currentMessageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
