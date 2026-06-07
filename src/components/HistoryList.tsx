import { Campaign } from "../types";
import { FolderHeart, Trash2, Calendar, LayoutGrid } from "lucide-react";

interface HistoryListProps {
  campaigns: Campaign[];
  activeId: string | null;
  onSelect: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
}

export default function HistoryList({
  campaigns,
  activeId,
  onSelect,
  onDelete,
}: HistoryListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-[#E7E5E4] rounded-lg bg-[#FAF9F6]">
        <FolderHeart className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="font-sans text-sm text-stone-500 font-medium">No saved campaigns</p>
        <p className="font-sans text-[11px] text-stone-400 mt-1">
          Your created brands will persist locally in this drawer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" id="history-container">
      {campaigns.map((camp) => {
        const isActive = camp.id === activeId;
        const dateString = new Date(camp.timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={camp.id}
            onClick={() => onSelect(camp)}
            className={`group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
              isActive
                ? "bg-white border-[#1C1917] shadow-sm ring-1 ring-[#1C1917]"
                : "bg-white border-[#E7E5E4] hover:border-stone-400 hover:shadow-sm"
            }`}
            id={`campaign-history-item-${camp.id}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-sans font-bold text-sm text-[#1C1917] pr-6 truncate max-w-[200px]">
                  {camp.campaignName}
                </h4>
                <p className="font-sans text-[11px] text-stone-500 italic truncate max-w-[200px] mt-0.5">
                  &ldquo;{camp.brandSlogan}&rdquo;
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(camp.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-red-600 transition absolute right-3 top-3"
                title="Delete campaign"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{dateString}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3 h-3" />
                <span>{camp.shots.length} shots</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
