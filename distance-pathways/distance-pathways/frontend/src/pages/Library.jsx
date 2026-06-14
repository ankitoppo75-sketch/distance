import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PlayCircle, FileText, FileQuestion, LayoutGrid } from "lucide-react";
import api from "../api/axios";
import ContentCard from "../components/ContentCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const TYPES = [
  { key: "", label: "All resources", icon: LayoutGrid },
  { key: "video", label: "Recorded lectures", icon: PlayCircle },
  { key: "notes", label: "Notes", icon: FileText },
  { key: "questionPaper", label: "Question papers", icon: FileQuestion },
];

const Library = () => {
  const [params, setParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeType = params.get("type") || "";

  const fetchContent = async () => {
    setLoading(true);
    try {
      const query = {};
      if (activeType) query.type = activeType;
      const { data } = await api.get("/content", { params: query });
      setItems(data.content);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, user]);

  const handleUnlock = (id) => {
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, locked: false } : i)));
    fetchContent();
  };

  if (authLoading) return <Loader label="Loading..." />;

  if (!user) {
    return (
      <div className="section py-20 text-center">
        <div className="card max-w-md mx-auto p-10">
          <h2 className="text-2xl font-extrabold text-ink mb-2">Log in to browse the library</h2>
          <p className="text-slate-500 text-sm mb-6">
            Create a free account to access recorded lectures, notes and previous year question papers across all
            courses.
          </p>
          <a href="/login" className="btn-primary inline-flex">Log in</a>
        </div>
      </div>
    );
  }

  return (
    <div className="section py-12">
      <div className="mb-10">
        <span className="eyebrow mb-3">Resource library</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-2">Video lectures, notes &amp; papers</h1>
        <p className="text-slate-500 max-w-2xl">
          Free previews are unlocked instantly. Paid items can be unlocked individually via card, UPI or
          netbanking.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setParams(t.key ? { type: t.key } : {})}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition ${
                activeType === t.key ? "bg-pathway text-white" : "bg-white border border-ink-100 text-slate-500 hover:border-pathway"
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Loader label="Loading resources..." />
      ) : items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">No resources available yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ContentCard key={item._id} item={item} onUnlock={handleUnlock} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
