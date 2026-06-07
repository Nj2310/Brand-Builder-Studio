import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  HelpCircle, 
  History, 
  CheckSquare, 
  Square, 
  Layers, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Smartphone,
  Compass
} from "lucide-react";

import { Campaign, Shot, MediumOption, StyleOption } from "./types";
import Navbar from "./components/Navbar";
import LoadingState from "./components/LoadingState";
import CampaignCard from "./components/CampaignCard";
import HistoryList from "./components/HistoryList";

const MEDIUMS: MediumOption[] = [
  {
    id: "billboard",
    label: "Highway Billboard",
    icon: "🗺️",
    description: "High-impact wide landscape render (16:9)",
    defaultPromptOutline: "An outdoor digital billboard overlooking a main junction"
  },
  {
    id: "newspaper",
    label: "Press Newspaper",
    icon: "📰",
    description: "Ink-printed retro portrait layout (3:4)",
    defaultPromptOutline: "A printed advertisement in the Sunday morning newspaper columns"
  },
  {
    id: "social_post",
    label: "Social Feed Post",
    icon: "📱",
    description: "Close-up premium square mockup (1:1)",
    defaultPromptOutline: "An elegant minimalist Instagram commercial visual"
  }
];

const STYLE_PRESETS: StyleOption[] = [
  {
    id: "minimal-lux",
    label: "Minimalist Luxe",
    description: "Clean off-whites, neutral shadows, organic textures.",
    bgClass: "bg-[#FAFAF9]",
    textClass: "text-[#1C1917]"
  },
  {
    id: "vintage-classic",
    label: "Vintage Heritage",
    description: "Golden hour hues, subtle noise grain, warm wood backgrounds.",
    bgClass: "bg-[#FDF6E2]",
    textClass: "text-[#5C4033]"
  },
  {
    id: "bold-brutalist",
    label: "Industrial Edge",
    description: "Monochrome, heavy concrete slabs, sharp key lighting.",
    bgClass: "bg-[#F3F4F6]",
    textClass: "text-[#111827]"
  },
  {
    id: "vibrant-pop",
    label: "Vibrant Cyber",
    description: "Bold fluorescent blocks, dark neon backdrops, futuristic vibes.",
    bgClass: "bg-[#0F172A]",
    textClass: "text-white"
  }
];

const QUICK_SAMPLES = [
  {
    title: "Retro Thermos Flask",
    description: "A mid-century retro neon-orange stainless steel water thermos with a rugged matte-black polymer lid clip.",
    preset: "vintage-classic",
    mediums: ["billboard", "newspaper", "social_post"]
  },
  {
    title: "Minimalist Earbud Case",
    description: "Sleek matte-black wireless earbuds nested in an architectural sliding case milled from space-gray sandblasted alloy.",
    preset: "minimal-lux",
    mediums: ["billboard", "newspaper", "social_post"]
  },
  {
    title: "Heavy Raw Ceramic Mug",
    description: "A thick brutalist coffee mug sculpted with a coarse concrete sand texture, accented with a vibrant terracotta clay glazed handle.",
    preset: "bold-brutalist",
    mediums: ["billboard", "newspaper", "social_post"]
  },
  {
    title: "Vial Elixir Studio",
    description: "A dramatic eye-level studio photograph of a 15cm tall cylindrical heavy-glass vintage apothecary vial with deep vertical ribbed glass fluting, containing a hyper-saturated, self-illuminating glowing radioactive neon-lime green elixir. The elixir casts a vibrant lime-colored glow. A matte-black metal band is clamped around the center, stenciled with distressed industrial bio-hazard typography 'BIO-HAZ-09' in stark white. The top is sealed with an aged black rubber stopper and rusted copper wire cage. The vial is placed on a glossy, highly reflective hot-pink acrylic surface, creating a sharp mirrored reflection of neon-lime and hot-pink. The background is a clean, split duo-tone wall of vibrant electric blue and bright magenta, creating a high-contrast pop art aesthetic. Sharp studio lighting, completely devoid of people.",
    preset: "vibrant-pop",
    mediums: ["billboard", "newspaper", "social_post"]
  }
];

export default function App() {
  const [productDescription, setProductDescription] = useState("A dramatic eye-level studio photograph of a 15cm tall cylindrical heavy-glass vintage apothecary vial with deep vertical ribbed glass fluting, containing a hyper-saturated, self-illuminating glowing radioactive neon-lime green elixir. The elixir casts a vibrant lime-colored glow. A matte-black metal band is clamped around the center, stenciled with distressed industrial bio-hazard typography 'BIO-HAZ-09' in stark white. The top is sealed with an aged black rubber stopper and rusted copper wire cage. The vial is placed on a glossy, highly reflective hot-pink acrylic surface, creating a sharp mirrored reflection of neon-lime and hot-pink. The background is a clean, split duo-tone wall of vibrant electric blue and bright magenta, creating a high-contrast pop art aesthetic. Sharp studio lighting, completely devoid of people.");
  const [selectedMediums, setSelectedMediums] = useState<string[]>(["billboard", "newspaper", "social_post"]);
  const [stylePreset, setStylePreset] = useState("minimal-lux");
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved campaigns and check key state in backend
  useEffect(() => {
    const saved = localStorage.getItem("brand_builder_campaigns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Campaign[];
        setCampaigns(parsed);
        if (parsed.length > 0) {
          setActiveCampaignId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed loading local campaigns history", e);
      }
    }

    // Check Gemini key registration
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setIsConfigured(data.configured);
      })
      .catch((err) => {
        console.error("Config check error", err);
        setIsConfigured(false);
      });
  }, []);

  // Save to persistence on change
  const saveCampaignsHistory = (updatedHistory: Campaign[]) => {
    setCampaigns(updatedHistory);
    localStorage.setItem("brand_builder_campaigns", JSON.stringify(updatedHistory));
  };

  const handleSelectSample = (sample: typeof QUICK_SAMPLES[number]) => {
    setProductDescription(sample.description);
    setStylePreset(sample.preset);
    setSelectedMediums(sample.mediums);
    setError(null);
  };

  const toggleMedium = (id: string) => {
    if (selectedMediums.includes(id)) {
      if (selectedMediums.length > 1) {
        setSelectedMediums(selectedMediums.filter((m) => m !== id));
      }
    } else {
      setSelectedMediums([...selectedMediums, id]);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productDescription.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription,
          selectedMediums,
          stylePreset
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "An integration error occurred during model invocation.");
      }

      const newCampaign: Campaign = {
        id: `campaign_${Date.now()}`,
        timestamp: new Date().toISOString(),
        productDescription,
        campaignName: data.campaignName,
        brandSlogan: data.brandSlogan,
        consistencyAnchor: data.consistencyAnchor,
        shots: data.shots,
        stylePreset
      };

      const updated = [newCampaign, ...campaigns];
      saveCampaignsHistory(updated);
      setActiveCampaignId(newCampaign.id);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed connecting to model pipelines. Verify your setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = (id: string) => {
    const updated = campaigns.filter((c) => c.id !== id);
    saveCampaignsHistory(updated);
    if (activeCampaignId === id) {
      setActiveCampaignId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleShotUpdate = (updatedShot: Shot) => {
    if (!activeCampaignId) return;
    const updatedCampaigns = campaigns.map((c) => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          shots: c.shots.map((s) => (s.medium === updatedShot.medium ? updatedShot : s))
        };
      }
      return c;
    });
    saveCampaignsHistory(updatedCampaigns);
  };

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || null;
  const currentActivePreset = STYLE_PRESETS.find((p) => p.id === (activeCampaign?.stylePreset || stylePreset));

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans transition-colors duration-200">
      <Navbar isConfigured={isConfigured} />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left hand Setup Panel & Campaign Side list: col-span-4 */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Creative Studio Inputs */}
          <div className="bg-white border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-stone-800" />
              <h2 className="font-sans font-bold text-base text-[#1C1917]">
                Concept Hub
              </h2>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              
              {/* Product description query */}
              <div>
                <label className="block text-xs font-mono text-stone-500 uppercase tracking-wider mb-1.5 font-bold">
                  Product Description
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="e.g., A heavyweight minimalist ceramic coffee storage cup in split black granite matte and raw stone textures..."
                  className="w-full text-sm p-3 border border-stone-200 rounded-lg bg-[#FAF9F6] text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-stone-800 min-h-[100px] leading-relaxed resize-none"
                  id="product-input-area"
                />
              </div>

              {/* Quick Preset Ideas section */}
              <div>
                <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2">
                  Quick-Fill Samples
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_SAMPLES.map((sample) => (
                    <button
                      key={sample.title}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="text-left p-2 rounded-lg border border-stone-100 hover:border-stone-400 hover:bg-stone-50 transition text-xs"
                    >
                      <span className="font-bold block text-stone-800 truncate mb-0.5">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono uppercase block">
                        Preset: {sample.preset.split("-")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style presets */}
              <div>
                <label className="block text-xs font-mono text-stone-500 uppercase tracking-wider mb-1.5 font-bold">
                  Creative Mood Style
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_PRESETS.map((p) => {
                      const isSelected = stylePreset === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setStylePreset(p.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all relative ${
                            isSelected
                              ? "border-[#1C1917] bg-stone-50 ring-1 ring-[#1C1917]"
                              : "border-stone-200 hover:border-stone-400"
                          }`}
                        >
                          <span className="block text-xs font-bold text-stone-800">
                            {p.label}
                          </span>
                          <span className="block text-[10px] text-stone-450 leading-tight mt-0.5 max-h-[25px] overflow-hidden truncate">
                            {p.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Channels checkboxes */}
              <div>
                <label className="block text-xs font-mono text-stone-500 uppercase tracking-wider mb-2 font-bold">
                  Advertising Channels
                </label>
                <div className="space-y-2">
                  {MEDIUMS.map((med) => {
                    const isSelected = selectedMediums.includes(med.id);
                    return (
                      <div
                        key={med.id}
                        onClick={() => toggleMedium(med.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition select-none ${
                          isSelected
                            ? "border-stone-700 bg-stone-50/50"
                            : "border-stone-200 hover:border-stone-400 opacity-70"
                        }`}
                      >
                        <button type="button" className="mt-0.5">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-stone-800" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs flex items-center gap-1.5 text-stone-800">
                            <span>{med.icon}</span>
                            <span>{med.label}</span>
                          </span>
                          <span className="text-[10px] text-stone-500 block truncate font-mono">
                            {med.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form submit call */}
              <button
                type="submit"
                disabled={loading || !productDescription.trim()}
                className="w-full mt-2 py-3 px-4 bg-[#1C1917] hover:bg-stone-800 text-white rounded-xl text-sm font-sans font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                id="generate-button"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Launch Creative Campaign</span>
              </button>

            </form>
          </div>

          {/* Historical Saved campaigns list */}
          <div className="bg-white border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-stone-600" />
                <h3 className="font-sans font-bold text-sm text-[#1C1917]">
                  Creative History
                </h3>
              </div>
              <span className="text-[10px] font-mono text-stone-400 bg-stone-100 py-0.5 px-2 rounded-full">
                {campaigns.length} total
              </span>
            </div>

            <HistoryList
              campaigns={campaigns}
              activeId={activeCampaignId}
              onSelect={(camp) => setActiveCampaignId(camp.id)}
              onDelete={handleDeleteCampaign}
            />
          </div>

        </div>

        {/* Right hand Showcase / Display stage: col-span-8 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main system alert banners */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold leading-tight">Generation Blocked Or Timeout</h4>
                <p className="mt-1 text-xs text-red-700 leading-relaxed font-sans">
                  {error}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setError(null)}
                    className="text-xs font-mono uppercase font-bold text-red-900 bg-red-100 hover:bg-red-200 py-1 px-2.5 rounded transition"
                  >
                    Clear Alert
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <h4 className="font-bold leading-tight">Missing API Key</h4>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed font-sans">
                  GEMINI_API_KEY environment variable is not defined or represents placeholder bytes.
                  The backend requests will fail. Please add your Gemini credentials in the **Settings &gt; Secrets** panel.
                </p>
              </div>
            </div>
          )}

          {/* Interactive display context */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingState productDescription={productDescription} />
              </motion.div>
            ) : activeCampaign ? (
              /* Campaign Details Output Present */
              <motion.div
                key={activeCampaign.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Campaign Header details */}
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm relative">
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-stone-100 py-1 px-2 rounded font-mono text-[9px] uppercase font-bold text-stone-500">
                    <span>Preset Mode</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800"></span>
                    <span>{activeCampaign.stylePreset.replace("-", " ")}</span>
                  </div>

                  <p className="font-mono text-xs text-[#C2410C] font-semibold uppercase tracking-widest mb-1.5">
                    Advertising Campaign Launch
                  </p>
                  
                  <h2 className="font-sans font-bold text-3xl text-[#1C1917] tracking-tight">
                    {activeCampaign.campaignName}
                  </h2>
                  
                  <p className="font-serif italic text-lg text-stone-600 mt-1 pl-4 border-l border-stone-300">
                    &ldquo;{activeCampaign.brandSlogan}&rdquo;
                  </p>

                  <div className="mt-5 pt-5 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <BookOpen className="w-4 h-4 text-stone-500" />
                      <h4 className="font-sans font-bold text-xs text-stone-500 uppercase tracking-widest">
                        Visual Consistency Specifications
                      </h4>
                    </div>
                    <div className="bg-[#FAF9F6] p-4 rounded-lg border border-stone-200/50">
                      <p className="font-serif text-sm leading-relaxed text-stone-700">
                        {activeCampaign.consistencyAnchor}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-stone-200/50 flex justify-between items-center text-[10px] font-mono text-stone-400">
                        <span>ESTABLISHED PHYSICAL STABLE LABELS</span>
                        <span>DETERMINED HUMAN-FREE SHOT LIMIT</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated medium shots display */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-sans font-bold text-base text-[#1C1917] flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Campaign Visual Outputs</span>
                    </h3>
                    <p className="text-xs text-stone-400 font-mono uppercase">
                      Rendered {activeCampaign.shots.length} shots utilizing Nano-Banana
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeCampaign.shots.map((shot) => (
                      <div key={shot.medium} className="h-full">
                        <CampaignCard 
                          shot={shot} 
                          campaignName={activeCampaign.campaignName} 
                          brandSlogan={activeCampaign.brandSlogan} 
                          onShotUpdate={handleShotUpdate}
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              /* Greeting/Welcome Screen: Nothing generated yet */
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-[#E7E5E4] rounded-xl p-8 text-center min-h-[500px] flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#1C1917]/5 flex items-center justify-center text-stone-800 mb-6 border border-stone-100">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                
                <h2 className="font-sans font-bold text-2xl text-[#1C1917] tracking-tight mb-2">
                  Your Creative Space Awaits
                </h2>
                
                <p className="text-stone-600 text-sm max-w-md leading-relaxed font-sans mb-8">
                  Describe a signature product idea or select one of our pre-built premium samples. Imagined assets are perfectly reconciled across creative billboard posters, newspaper prints, and close-up social media details.
                </p>

                {/* Guide banner on rules */}
                <div className="bg-[#FAF9F6] border border-stone-200/60 p-4 rounded-xl text-left max-w-lg mb-8">
                  <h4 className="font-mono text-[10px] text-stone-500 uppercase tracking-wider mb-2 font-bold">
                    Pristine Agency Constraints Checked:
                  </h4>
                  <ul className="text-stone-700 text-xs space-y-2 font-sans">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Product consistency</strong> is maintained in all advertising mediums.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Absolutely no people</strong> (or human features, hands, etc.) are rendered.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Calculated specifically via the <strong>Nano-Banana model</strong> (gemini-2.5-flash-image) backend pipelines.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <button
                    onClick={() => handleSelectSample(QUICK_SAMPLES[0])}
                    className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-sans font-medium text-stone-800 transition flex items-center gap-1"
                  >
                    Load Sample Product
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Humble branding credits */}
      <footer className="mt-auto border-t border-[#E7E5E4] py-6 px-6 text-center text-stone-400 font-mono text-[10px] uppercase tracking-wider bg-white">
        <span>© Brand Builder Studio • Created with Google AI Studio</span>
      </footer>
    </div>
  );
}
