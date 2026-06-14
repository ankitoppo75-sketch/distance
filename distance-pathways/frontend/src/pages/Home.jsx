import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  PlayCircle,
  FileText,
  FileQuestion,
  FileEdit,
  ShieldCheck,
  Sparkles,
  Quote,
  ArrowRight,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import HeroGraphic from "../components/HeroGraphic";
import PathwaySteps from "../components/PathwaySteps";

const services = [
  {
    icon: PlayCircle,
    title: "Recorded video lectures",
    desc: "Subject-wise YouTube-style lectures for every unit, taught the way distance learners actually need - exam-focused and to the point.",
    tag: "Free + paid unlocks",
    color: "pathway",
  },
  {
    icon: FileText,
    title: "Notes & study material",
    desc: "Concise, easy-to-revise notes written specifically for IGNOU, DU SOL and Amity Online syllabi.",
    tag: "From ₹49",
    color: "amber",
  },
  {
    icon: FileQuestion,
    title: "Previous year question papers",
    desc: "Years of solved papers so you know exactly what to expect and how to structure your answers.",
    tag: "From ₹49",
    color: "teal",
  },
  {
    icon: FileEdit,
    title: "Synopsis, project & research help",
    desc: "Our mentors help you choose a topic, structure your synopsis, and prepare your project or research paper - at student-friendly prices.",
    tag: "Custom quote",
    color: "pathway",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    course: "IGNOU · BCA, 4th Semester",
    text: "The recorded lectures explained Data Structures better than my actual study centre. The PYQs were a lifesaver right before exams.",
  },
  {
    name: "Rohit Mehta",
    course: "DU SOL · B.Com Programme",
    text: "I was stuck on my project synopsis for weeks. Distance Pathways' team reviewed it, suggested changes, and I got it approved on the first try.",
  },
  {
    name: "Sneha Kapoor",
    course: "Amity Online · MBA",
    text: "Affordable, clear, and exactly aligned to my syllabus. I paid only for the two subjects I was weak in - no unnecessary bundles.",
  },
];

const colorMap = {
  pathway: "bg-pathway-50 text-pathway",
  amber: "bg-amber-50 text-amber-600",
  teal: "bg-teal-50 text-teal-600",
};

const Home = () => {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses${query ? `?search=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-pathway-50/60 via-transparent to-transparent" />
        <div className="section relative py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow mb-5">
              <Sparkles size={14} /> For IGNOU · DU SOL · Amity Online &amp; more
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] text-ink mb-5">
              Your pathway through{" "}
              <span className="text-gradient">distance education</span>, mapped out for you.
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed max-w-xl mb-8">
              {settings.tagline}. Watch recorded lectures, download notes &amp; previous year papers, and get
              expert help with your synopsis, project, or research paper - pay only for what you need.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search subject, course or university..."
                  className="input pl-11"
                />
              </div>
              <button type="submit" className="btn-primary">
                Find my course <ArrowRight size={16} />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              {settings.supportedUniversities?.map((u) => (
                <span key={u} className="text-xs font-mono font-semibold px-3 py-1.5 rounded-full bg-white border border-ink-100 text-ink-600">
                  {u}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <HeroGraphic />
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="section pb-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Video lectures", value: "1,200+" },
              { label: "Subjects covered", value: "180+" },
              { label: "Students helped", value: "25,000+" },
              { label: "Projects guided", value: "3,500+" },
            ].map((s) => (
              <div key={s.label} className="card p-5 text-center">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-pathway">{s.value}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS / PATHWAY ---------------- */}
      <section className="section py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow justify-center mb-4">The Distance Pathways method</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-3">
            One pathway, from your first lecture to your final submission
          </h2>
          <p className="text-slate-500">
            Every subject follows the same simple route - so you always know what to do next.
          </p>
        </div>
        <PathwaySteps />
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section className="bg-ink py-20">
        <div className="section">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <span className="eyebrow mb-3 text-teal-400">Everything in one app</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What you get with Distance Pathways</h2>
            </div>
            <Link to="/courses" className="btn-accent self-start sm:self-auto">
              Browse all courses <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white/5 border border-white/10 rounded-xl2 p-6 hover:bg-white/10 transition-colors"
                >
                  <span className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${colorMap[s.color]}`}>
                    <Icon size={22} />
                  </span>
                  <h3 className="font-display font-semibold text-white text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-ink-100/80 leading-relaxed mb-4">{s.desc}</p>
                  <span className="text-xs font-mono font-semibold text-teal-400">{s.tag}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- PROJECT HELP CALLOUT ---------------- */}
      <section className="section py-20">
        <div className="card p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center overflow-hidden relative">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-50" />
          <div className="relative">
            <span className="eyebrow mb-4"><ShieldCheck size={14} /> Trusted by 1000s of distance students</span>
            <h2 className="text-3xl font-extrabold text-ink mb-4">
              Stuck on your synopsis, project work or research paper?
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Tell us your university, programme and topic. Our mentors review your requirements and send you a
              clear, affordable quote - then guide you step-by-step until you're ready to submit.
            </p>
            <Link to="/project-help" className="btn-primary">
              Request project help <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative grid grid-cols-2 gap-4">
            {["Topic selection", "Synopsis drafting", "Full project report", "Research paper writing"].map((t, i) => (
              <div key={t} className="card p-4 text-sm font-semibold text-ink-600">
                <span className="block h-7 w-7 rounded-full bg-pathway-50 text-pathway font-display font-bold flex items-center justify-center mb-3">
                  {i + 1}
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="section py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow justify-center mb-4">From students like you</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">Real results from real distance learners</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-6"
            >
              <Quote className="text-pathway-100" size={28} />
              <p className="text-sm text-slate-600 leading-relaxed mt-3 mb-5">{t.text}</p>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-pathway-50 text-pathway font-display font-bold flex items-center justify-center">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-ink text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.course}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="section pb-24">
        <div className="rounded-xl2 bg-gradient-to-r from-pathway to-teal p-10 lg:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 relative">Ready to find your pathway?</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-8 relative">
            Create your free account, browse courses for your university, and unlock only the lectures, notes and
            help you actually need.
          </p>
          <div className="flex flex-wrap justify-center gap-3 relative">
            <Link to="/register" className="btn bg-white text-ink px-6 py-3 hover:-translate-y-0.5 shadow-soft">
              Create free account <ArrowRight size={16} />
            </Link>
            <Link to="/courses" className="btn border-2 border-white/60 text-white px-6 py-3 hover:bg-white/10">
              Explore courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
