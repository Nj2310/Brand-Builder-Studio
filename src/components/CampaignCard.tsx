import { useState } from "react";
import { Shot } from "../types";
import { 
  Eye, 
  Layers, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark,
  Share2,
  FileText,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface CampaignCardProps {
  shot: Shot;
  campaignName: string;
  brandSlogan: string;
  onShotUpdate?: (updatedShot: Shot) => void;
}

export default function CampaignCard({ shot, campaignName, brandSlogan, onShotUpdate }: CampaignCardProps) {
  const [viewMode, setViewMode] = useState<"pure" | "mock">("mock");
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(shot.imagePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!shot.imageUrl) return;
    const link = document.createElement("a");
    link.href = shot.imageUrl;
    link.download = `${campaignName.replace(/\s+/g, "_")}_${shot.medium}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    setRegenError(null);

    try {
      const response = await fetch("/api/generate-single-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePrompt: shot.imagePrompt,
          aspectRatio: shot.aspectRatio,
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed while invoking the image generator.");
      }

      const updatedShot: Shot = {
        ...shot,
        imageUrl: data.imageUrl,
        success: true,
        fallbackUsed: data.fallbackUsed || false,
        errorMsg: data.fallbackUsed ? data.errorMsg : undefined
      };

      if (onShotUpdate) {
        onShotUpdate(updatedShot);
      }
    } catch (err: any) {
      console.error("Failed regenerating single shot:", err);
      setRegenError(err.message || "Request timed out or quota exhausted.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const getCleanError = (rawErr: string | undefined | null): string => {
    if (!rawErr) return "Rate limit or content filter exception.";
    const cleanStr = String(rawErr).trim();
    try {
      if (cleanStr.startsWith("{")) {
        const parsed = JSON.parse(cleanStr);
        if (parsed.error && parsed.error.message) {
          return parsed.error.message;
        }
      }
    } catch (e) {
      // fallback
    }
    return rawErr;
  };

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full" id={`shot-${shot.medium}`}>
      {/* Top Header details */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <div>
          <h4 className="font-sans font-bold text-stone-800 text-sm">
            {shot.mediumTitle}
          </h4>
          <p className="font-mono text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">
            Medium: {shot.medium} • AR {shot.aspectRatio}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("mock")}
            disabled={!shot.success || isRegenerating}
            className={`px-2.5 py-1 text-xs rounded transition-all font-sans font-medium flex items-center gap-1 disabled:opacity-50 ${
              viewMode === "mock"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Mockup</span>
          </button>
          <button
            onClick={() => setViewMode("pure")}
            disabled={!shot.success || isRegenerating}
            className={`px-2.5 py-1 text-xs rounded transition-all font-sans font-medium flex items-center gap-1 disabled:opacity-50 ${
              viewMode === "pure"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Pure Ad</span>
          </button>
        </div>
      </div>

      {/* Main image output stage */}
      <div className="flex-1 bg-stone-900 flex items-center justify-center p-6 min-h-[300px] relative overflow-hidden">
        {shot.success && shot.fallbackUsed && (
          <div className="absolute top-3 right-3 bg-stone-950/85 border border-amber-500/30 px-2.5 py-1 rounded-md text-amber-500 text-[10px] font-sans font-medium flex items-center gap-1.5 backdrop-blur-md z-10 select-none pointer-events-none transition-all duration-200">
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500/10" />
            <span>Cohesive Design Backup Loaded</span>
          </div>
        )}
        {isRegenerating ? (
          <div className="text-center p-6 max-w-sm">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="font-sans text-sm font-semibold text-white mb-1">Rerendering Media...</p>
            <p className="font-mono text-[10px] text-stone-400 uppercase tracking-wider">
              Invoking Gemini Nano-Banana
            </p>
            <p className="text-stone-500 text-xs mt-3 leading-relaxed">
              Applying details, composition ratios, and ensuring human-free canvas alignment...
            </p>
          </div>
        ) : !shot.success ? (
          <div className="text-center p-6 max-w-sm bg-stone-850 border border-stone-800 rounded-lg text-stone-400">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-sans text-sm font-medium text-white mb-2">Shot generation failed</p>
            
            <p className="font-sans text-xs text-stone-500 mb-4 bg-black/30 p-2 rounded max-h-24 overflow-y-auto font-mono">
              {getCleanError(regenError || shot.errorMsg)}
            </p>

            <p className="font-sans text-[11px] text-stone-500 mb-5 leading-relaxed">
              This typically occurs when the Gemini API Free Tier hits short requests-per-minute limitations. Hover or copy the prompt layout to inspect parameters.
            </p>

            <button
              onClick={handleRegenerate}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-[#1C1917] font-sans font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1C1917]" />
              <span>Retry Re-render with Nano-Banana</span>
            </button>
          </div>
        ) : (
          /* Render pure image or device mockup */
          <div className="w-full h-full flex items-center justify-center">
            {viewMode === "pure" ? (
              <div className="max-w-full max-h-[400px] shadow-2xl relative">
                <img
                  src={shot.imageUrl}
                  alt={shot.mediumTitle}
                  className="rounded object-contain max-h-[360px]"
                  referrerPolicy="no-referrer"
                  id={`image-pure-${shot.medium}`}
                />
              </div>
            ) : (
              /* High loyalty medium frames */
              <div className="w-full max-w-sm animate-fade-in">
                {shot.medium === "billboard" && (
                  <div className="flex flex-col items-center">
                    {/* Billboard Board */}
                    <div className="bg-[#1C1917] p-2 rounded shadow-2xl border-4 border-stone-800 w-full relative">
                      <div className="overflow-hidden bg-black flex items-center justify-center">
                        <img
                          src={shot.imageUrl}
                          alt="Billboard mock"
                          className="w-full aspect-video object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {/* Billboard spot lights */}
                      <div className="flex justify-around mt-1">
                        <div className="w-1 h-2 bg-stone-600 rounded"></div>
                        <div className="w-1 h-2 bg-stone-600 rounded"></div>
                        <div className="w-1 h-2 bg-stone-600 rounded"></div>
                      </div>
                    </div>
                    {/* Metal support pole */}
                    <div className="w-3 h-16 bg-gradient-to-r from-stone-600 via-stone-400 to-stone-700"></div>
                    <div className="w-16 h-3 bg-stone-800 rounded-t"></div>
                    <p className="font-mono text-[9px] text-stone-500 mt-2 uppercase tracking-widest">
                      Steel Expressway Structure
                    </p>
                  </div>
                )}

                {shot.medium === "newspaper" && (
                  <div className="bg-[#EAE6DF] text-stone-800 p-4 shadow-2xl border-t-8 border-amber-900/10 rounded font-serif max-w-xs mx-auto">
                    {/* Newspaper header */}
                    <div className="border-b border-stone-400 pb-1 text-center mb-2">
                      <p className="text-[10px] uppercase font-bold font-mono tracking-widest text-stone-500">
                        THE BRAND DISPATCH
                      </p>
                      <div className="flex justify-between text-[8px] font-mono mt-0.5 text-stone-400">
                        <span>EST. 1884</span>
                        <span>SUNDAY EDITION</span>
                      </div>
                    </div>
                    {/* Main newsletter dummy layout around our image */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <h5 className="font-bold text-xs leading-none mb-1 text-stone-800 line-clamp-2 uppercase">
                          {campaignName} CAPTIVATES ADVERTISING SCENE
                        </h5>
                        <p className="text-[7.5px] leading-tight text-stone-600 font-serif line-clamp-3">
                          A magnificent display of modern design captured this weekend, unveiling the long-awaited product silhouette. Critics and industry insiders describe the branding direction as outstandingly consistent, elegant, and void of artificial distractions.
                        </p>
                      </div>
                      <div className="col-span-1 border-l border-stone-300 pl-1">
                        <h6 className="font-bold text-[7px] mb-0.5 uppercase tracking-wide">
                          EDITORIAL
                        </h6>
                        <p className="text-[6.5px] leading-none text-stone-500">
                          {brandSlogan} takes full stage without standard clutter.
                        </p>
                      </div>
                    </div>
                    {/* Print Ad placeholder containing our image */}
                    <div className="border border-stone-800 p-1 bg-[#FAF9F6] my-2">
                      <img
                        src={shot.imageUrl}
                        alt="Newspaper printed ad"
                        className="w-full object-cover filter grayscale contrast-125"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-center font-serif font-bold text-[8px] tracking-wide mt-1 uppercase">
                        {campaignName}
                      </p>
                    </div>
                    <p className="text-[6px] text-right text-stone-400 font-serif">
                      ADVERTISEMENT PAGE B5
                    </p>
                  </div>
                )}

                {shot.medium === "social_post" && (
                  <div className="bg-white rounded-lg shadow-2xl text-stone-800 overflow-hidden text-left max-w-xs mx-auto border border-stone-200">
                    {/* Top bar mockup */}
                    <div className="p-2.5 flex items-center justify-between border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1C1917] flex items-center justify-center text-white font-serif text-[10px] font-bold">
                          {campaignName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold font-sans tracking-tight">
                            {campaignName.toLowerCase().replace(/\s+/g, "")}
                          </p>
                          <p className="text-[9px] text-stone-400 font-sans tracking-tight leading-none">
                            Sponsored
                          </p>
                        </div>
                      </div>
                      <Bookmark className="w-4 h-4 text-stone-400" />
                    </div>
                    {/* Feed media */}
                    <div className="aspect-square w-full overflow-hidden bg-stone-50">
                      <img
                        src={shot.imageUrl}
                        alt="Social Feed Feed"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Feed footer metrics mockup */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-red-500 fill-current" />
                          <MessageCircle className="w-5 h-5 text-stone-600" />
                          <Send className="w-5 h-5 text-stone-600" />
                        </div>
                        <Share2 className="w-5 h-5 text-stone-600" />
                      </div>
                      <p className="text-xs font-bold font-sans mb-1">
                        1,482 likes
                      </p>
                      <p className="text-xs font-sans text-stone-600 leading-snug">
                        <span className="font-bold text-stone-800 mr-1.5">
                          {campaignName.toLowerCase().replace(/\s+/g, "")}
                        </span>
                        {brandSlogan}. Inspired by classic aesthetic layouts. #brandidentity #minimaldesign #{campaignName.replace(/\s+/g, "").toLowerCase()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Generic Medium Mockup frame (e.g. Bus Shelter, Magazine, etc.) */}
                {shot.medium !== "billboard" && shot.medium !== "newspaper" && shot.medium !== "social_post" && (
                  <div className="bg-[#1C1917] p-2.5 rounded-lg shadow-2xl border border-stone-800">
                    <div className="relative border-2 border-stone-700 bg-black rounded overflow-hidden">
                      <img
                        src={shot.imageUrl}
                        alt="Generic advertising placement"
                        className="w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-[#C2410C] text-white font-mono text-[8px] py-0.5 px-1.5 rounded uppercase tracking-wider">
                        {shot.mediumTitle}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-mono text-[9px] text-[#A8A29E] uppercase tracking-wider">
                        PREMIUM POSTER DISPLAY
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Narrative details and actions bottom pane */}
      <div className="p-4 border-t border-stone-100 flex-none bg-[#FCFBF9]">
        <p className="text-stone-700 text-xs font-sans italic mb-3 line-clamp-3">
          &ldquo;{shot.mediumDescription}&rdquo;
        </p>

        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <button
            onClick={handleCopyPrompt}
            className="flex-1 py-2 px-3 text-xs bg-stone-150 border border-stone-200 text-stone-600 hover:text-[#1C1917] hover:border-stone-400 rounded-lg font-sans font-medium transition flex items-center justify-center gap-1.5"
            title="Copy image generation prompt"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-stone-800 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>

          {shot.success && (
            <button
              onClick={handleDownload}
              className="py-2 px-3 bg-[#1C1917] text-white hover:bg-stone-800 rounded-lg text-xs font-sans font-medium transition flex items-center gap-1"
              title="Download print render"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}

          {/* Additional trigger option so they can regenerate anytime */}
          {shot.success && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="p-2 border border-stone-200 hover:border-stone-400 hover:bg-stone-50 rounded-lg transition"
              title="Re-render image variation"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isRegenerating ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
