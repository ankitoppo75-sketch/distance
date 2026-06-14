import React, { useState } from "react";
import { PlayCircle, FileText, FileQuestion, Lock, Download, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { payForItem } from "../utils/payment";
import { resolveAssetUrl } from "../utils/assets";

const ICONS = {
  video: PlayCircle,
  notes: FileText,
  questionPaper: FileQuestion,
};

const LABELS = {
  video: "Recorded lecture",
  notes: "Notes (PDF)",
  questionPaper: "Question paper",
};

const ContentCard = ({ item, onUnlock }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const Icon = ICONS[item.type] || FileText;
  const isLocked = !!item.locked;

  const handlePay = () => {
    setError("");
    if (!user) {
      setError("Please log in to purchase this item.");
      return;
    }
    setPaying(true);
    payForItem({
      itemType: "content",
      itemRef: item._id,
      user,
      theme: { primaryColor: settings.primaryColor, siteName: settings.siteName, logoUrl: settings.logoUrl },
      onSuccess: () => {
        setPaying(false);
        onUnlock?.(item._id);
      },
      onError: (msg) => {
        setPaying(false);
        setError(msg);
      },
    });
  };

  const handleOpen = () => {
    if (item.fileUrl) window.open(resolveAssetUrl(item.fileUrl), "_blank");
  };

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-pathway-50 text-pathway flex items-center justify-center shrink-0">
        <Icon size={22} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">{LABELS[item.type]}</p>
        <h4 className="font-display font-semibold text-ink truncate">{item.title}</h4>
        {item.type === "video" && item.durationMinutes ? (
          <p className="text-xs text-slate-400 mt-0.5">{item.durationMinutes} min</p>
        ) : null}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <div className="shrink-0">
        {item.isFree || item.price === 0 ? (
          <button onClick={handleOpen} className="btn-outline btn-sm">
            {item.type === "video" ? <PlayCircle size={16} /> : <Download size={16} />}
            {item.type === "video" ? "Watch free" : "Download"}
          </button>
        ) : isLocked ? (
          <button onClick={handlePay} disabled={paying} className="btn-accent btn-sm">
            {paying ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            Unlock · ₹{item.price}
          </button>
        ) : (
          <button onClick={handleOpen} className="btn-primary btn-sm">
            {item.type === "video" ? <PlayCircle size={16} /> : <Download size={16} />}
            {item.type === "video" ? "Watch" : "Download"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
