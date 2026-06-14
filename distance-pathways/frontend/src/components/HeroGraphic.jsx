import React from "react";
import { motion } from "framer-motion";
import { PlayCircle, FileText, FileEdit, CheckCircle2 } from "lucide-react";

const HeroGraphic = () => {
  return (
    <div className="relative h-[420px] w-full max-w-[480px] mx-auto">
      {/* Dotted connecting path */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 420" fill="none">
        <path
          d="M60 90 C 180 60, 220 180, 340 170 C 420 165, 430 280, 360 330"
          stroke="#BFF3EC"
          strokeWidth="3"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
      </svg>

      {/* Card 1: Recorded video */}
      <motion.div
        className="absolute top-6 left-2 sm:left-6 w-60 card p-4 animate-floaty"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="h-9 w-9 rounded-lg bg-pathway-50 text-pathway flex items-center justify-center">
            <PlayCircle size={18} />
          </span>
          <div>
            <p className="text-sm font-display font-semibold text-ink leading-tight">Business Communication</p>
            <p className="text-xs text-slate-400">IGNOU · BBA · Unit 4</p>
          </div>
        </div>
        <div className="h-2 w-full bg-ink-50 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-pathway rounded-full" />
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">42 min lecture · 67% complete</p>
      </motion.div>

      {/* Card 2: Notes & question papers */}
      <motion.div
        className="absolute top-44 right-0 sm:right-2 w-56 card p-4"
        style={{ animationDelay: "1.5s" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="animate-floaty">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText size={18} />
            </span>
            <div>
              <p className="text-sm font-display font-semibold text-ink leading-tight">Notes + 5 yr PYQs</p>
              <p className="text-xs text-slate-400">DU SOL · B.Com Prog.</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="badge">PDF · Instant access</span>
            <span className="font-mono font-semibold text-ink text-sm">₹99</span>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Project / synopsis help */}
      <motion.div
        className="absolute bottom-2 left-4 sm:left-12 w-64 card p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="animate-floaty" style={{ animationDelay: "0.8s" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileEdit size={18} />
            </span>
            <div>
              <p className="text-sm font-display font-semibold text-ink leading-tight">Synopsis review</p>
              <p className="text-xs text-slate-400">Amity Online · MBA</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-teal-600 text-xs font-semibold">
            <CheckCircle2 size={14} /> Quote sent · Ready for review
          </div>
        </div>
      </motion.div>

      {/* Pulse markers on the path */}
      <span className="absolute top-[84px] left-[54px] h-2.5 w-2.5 rounded-full bg-pathway animate-pulseDot" />
      <span className="absolute top-[330px] left-[352px] h-2.5 w-2.5 rounded-full bg-teal animate-pulseDot" />
    </div>
  );
};

export default HeroGraphic;
