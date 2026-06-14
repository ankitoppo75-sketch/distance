import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Users, BookOpen, PlayCircle, FileText, FileQuestion, CheckCircle2, Loader2 } from "lucide-react";
import api from "../api/axios";
import Loader from "../components/Loader";
import ContentCard from "../components/ContentCard";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { payForItem } from "../utils/payment";

const TABS = [
  { key: "video", label: "Recorded lectures", icon: PlayCircle },
  { key: "notes", label: "Notes", icon: FileText },
  { key: "questionPaper", label: "Question papers", icon: FileQuestion },
];

const CourseDetail = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const { settings } = useSettings();
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [tab, setTab] = useState("video");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);
      setContent(data.content);
      setIsEnrolled(data.isEnrolled);
    } catch {
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUnlockContent = async () => {
    await refreshUser();
    fetchCourse();
  };

  const handleEnroll = async () => {
    setError("");
    setSuccess("");
    if (!user) {
      setError("Please log in to enroll in this course.");
      return;
    }

    if (course.isFree || course.price === 0) {
      setEnrolling(true);
      try {
        await api.post(`/courses/${id}/enroll`);
        setSuccess("Enrolled successfully!");
        await refreshUser();
        fetchCourse();
      } catch (err) {
        setError(err.response?.data?.message || "Could not enroll");
      } finally {
        setEnrolling(false);
      }
      return;
    }

    setEnrolling(true);
    payForItem({
      itemType: "course",
      itemRef: id,
      user,
      theme: { primaryColor: settings.primaryColor, siteName: settings.siteName, logoUrl: settings.logoUrl },
      onSuccess: async () => {
        setEnrolling(false);
        setSuccess("Payment successful! You're enrolled.");
        await refreshUser();
        fetchCourse();
      },
      onError: (msg) => {
        setEnrolling(false);
        setError(msg);
      },
    });
  };

  if (loading) return <Loader label="Loading course..." />;
  if (!course) return <div className="section py-20 text-center text-slate-500">Course not found.</div>;

  const filtered = content.filter((c) => c.type === tab);

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="section py-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-white/10">{course.university}</span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/10">{course.program}</span>
              {course.semester && <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/10">{course.semester}</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">{course.title}</h1>
            <p className="text-ink-100/80 leading-relaxed max-w-2xl mb-5">{course.description}</p>
            <div className="flex items-center gap-5 text-sm text-ink-100/80">
              <span className="flex items-center gap-1.5"><Star size={15} className="text-amber fill-amber" /> {course.rating?.toFixed(1)} rating</span>
              <span className="flex items-center gap-1.5"><Users size={15} /> {course.studentsEnrolled || 0} students</span>
              <span className="flex items-center gap-1.5"><BookOpen size={15} /> {content.length} resources</span>
            </div>
            {course.instructor && (
              <div className="flex items-center gap-3 mt-6">
                <span className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center font-display font-bold">
                  {course.instructor.name?.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{course.instructor.name}</p>
                  <p className="text-xs text-ink-100/70">Course instructor</p>
                </div>
              </div>
            )}
          </div>

          <div className="card p-6 self-start">
            <p className="text-3xl font-display font-extrabold text-ink mb-1">
              {course.isFree || course.price === 0 ? "Free" : `₹${course.price}`}
            </p>
            <p className="text-sm text-slate-400 mb-5">
              {course.isFree || course.price === 0
                ? "Full access to all course resources"
                : "One-time payment · lifetime access to this course"}
            </p>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            {success && (
              <p className="text-sm text-teal-600 mb-3 flex items-center gap-1.5"><CheckCircle2 size={15} /> {success}</p>
            )}

            {isEnrolled ? (
              <div className="btn-outline w-full pointer-events-none">
                <CheckCircle2 size={16} /> Enrolled
              </div>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full">
                {enrolling ? <Loader2 size={16} className="animate-spin" /> : null}
                {course.isFree || course.price === 0 ? "Enroll for free" : "Enroll & pay"}
              </button>
            )}

            <ul className="mt-5 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-500" /> Recorded video lectures</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-500" /> Downloadable notes</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-500" /> Previous year question papers</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-500" /> Pay-per-item, no subscription needed</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => {
            const Icon = t.icon;
            const count = content.filter((c) => c.type === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition ${
                  tab === t.key ? "bg-pathway text-white" : "bg-white border border-ink-100 text-slate-500 hover:border-pathway"
                }`}
              >
                <Icon size={16} /> {t.label} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            No {TABS.find((t) => t.key === tab)?.label.toLowerCase()} available yet for this course.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <ContentCard key={item._id} item={item} onUnlock={handleUnlockContent} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CourseDetail;
