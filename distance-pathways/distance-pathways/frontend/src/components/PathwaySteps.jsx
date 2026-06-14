import React from "react";
import { PlayCircle, NotebookPen, FileEdit, Award } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: PlayCircle,
    title: "Watch",
    desc: "Subject-wise recorded video lectures from experienced distance-program faculty.",
  },
  {
    icon: NotebookPen,
    title: "Revise",
    desc: "Crisp notes and previous year question papers to revise faster before exams.",
  },
  {
    icon: FileEdit,
    title: "Write",
    desc: "Get expert help with your synopsis, project work, or research paper.",
  },
  {
    icon: Award,
    title: "Succeed",
    desc: "Walk into your IGNOU / DU SOL / Amity exam and viva fully prepared.",
  },
];

const PathwaySteps = () => {
  return (
    <div className="relative">
      {/* Connecting path - desktop */}
      <svg
        className="hidden lg:block absolute top-9 left-0 w-full h-10 -z-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 75 20 C 300 20, 300 20, 425 20 C 550 20, 550 20, 725 20 C 900 20, 900 20, 1125 20"
          stroke="#D2DCFC"
          strokeWidth="3"
        />
        <path
          d="M 75 20 C 300 20, 300 20, 425 20 C 550 20, 550 20, 725 20 C 900 20, 900 20, 1125 20"
          stroke="#2A4DD0"
          strokeWidth="3"
          strokeDasharray="10 10"
          className="animate-dashMove"
        />
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative">
                <span className="h-[72px] w-[72px] rounded-full bg-white border-2 border-pathway-100 shadow-card flex items-center justify-center text-pathway">
                  <Icon size={28} />
                </span>
                <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-amber text-ink text-xs font-display font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display font-semibold text-lg mt-4 mb-1.5 text-ink">{step.title}</h3>
              <p className="text-sm text-slate-500 max-w-[230px] leading-relaxed">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PathwaySteps;
