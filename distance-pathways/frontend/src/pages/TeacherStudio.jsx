import React, { useEffect, useState } from "react";
import { ShieldAlert, PlusCircle, Loader2, CheckCircle2, AlertCircle, FileEdit, IndianRupee } from "lucide-react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const CONTENT_TYPES = [
  { key: "video", label: "Recorded video lecture", permission: "canUploadVideos" },
  { key: "notes", label: "Notes (PDF link)", permission: "canUploadNotes" },
  { key: "questionPaper", label: "Question paper (PDF link)", permission: "canUploadQuestionPapers" },
];

const PermissionNotice = ({ allowed, children }) => {
  if (allowed) return children;
  return (
    <div className="card p-6 flex items-start gap-3 text-sm text-slate-500">
      <ShieldAlert className="text-amber-500 shrink-0" size={20} />
      <p>This feature has not been enabled for your account yet. Please contact the admin to request access.</p>
    </div>
  );
};

const TeacherStudio = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const permissions = user.teacherPermissions || {};

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Course form
  const [courseForm, setCourseForm] = useState({
    title: "", description: "", university: "", program: "", subject: "", semester: "", price: "", isFree: false,
  });
  const [courseStatus, setCourseStatus] = useState({ loading: false, message: "", error: "" });

  // Content form
  const [contentForm, setContentForm] = useState({
    type: "video", course: "", title: "", description: "", fileUrl: "", price: "", isFree: false, durationMinutes: "", year: "",
  });
  const [contentStatus, setContentStatus] = useState({ loading: false, message: "", error: "" });

  // Project requests (only if permitted)
  const [requests, setRequests] = useState([]);
  const [quotes, setQuotes] = useState({});

  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/courses");
      setCourses(data.courses);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/project-requests");
      setRequests(data.requests);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    fetchCourses();
    if (permissions.canManageProjectRequests) fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCourseStatus({ loading: true, message: "", error: "" });
    try {
      await api.post("/courses", { ...courseForm, price: Number(courseForm.price) || 0 });
      setCourseStatus({ loading: false, message: "Course created successfully.", error: "" });
      setCourseForm({ title: "", description: "", university: "", program: "", subject: "", semester: "", price: "", isFree: false });
      fetchCourses();
    } catch (err) {
      setCourseStatus({ loading: false, message: "", error: err.response?.data?.message || "Could not create course" });
    }
  };

  const handleUploadContent = async (e) => {
    e.preventDefault();
    setContentStatus({ loading: true, message: "", error: "" });
    try {
      await api.post("/content", {
        ...contentForm,
        price: Number(contentForm.price) || 0,
        durationMinutes: Number(contentForm.durationMinutes) || 0,
      });
      setContentStatus({ loading: false, message: "Content published successfully.", error: "" });
      setContentForm({ type: contentForm.type, course: contentForm.course, title: "", description: "", fileUrl: "", price: "", isFree: false, durationMinutes: "", year: "" });
    } catch (err) {
      setContentStatus({ loading: false, message: "", error: err.response?.data?.message || "Could not publish content" });
    }
  };

  const handleQuote = async (id) => {
    const price = Number(quotes[id]);
    if (!price) return;
    await api.put(`/project-requests/${id}/quote`, { quotedPrice: price });
    fetchRequests();
  };

  const handleStatus = async (id, status) => {
    await api.put(`/project-requests/${id}/status`, { status });
    fetchRequests();
  };

  const currentTypePermission = CONTENT_TYPES.find((t) => t.key === contentForm.type)?.permission;
  const canUploadCurrentType = permissions[currentTypePermission];

  if (loading) return <Loader label="Loading studio..." />;

  return (
    <div className="section py-12">
      <div className="mb-10">
        <span className="eyebrow mb-3">Teacher studio</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="text-slate-500 mt-2">Manage your courses and content for {settings.siteName}.</p>
      </div>

      {/* Permission summary */}
      <div className="card p-5 mb-10 flex flex-wrap gap-3">
        {[
          { key: "canManageCourses", label: "Create courses" },
          { key: "canUploadVideos", label: "Upload videos" },
          { key: "canUploadNotes", label: "Upload notes" },
          { key: "canUploadQuestionPapers", label: "Upload question papers" },
          { key: "canManageProjectRequests", label: "Handle project requests" },
        ].map((p) => (
          <span
            key={p.key}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              permissions[p.key] ? "bg-teal-50 text-teal-600" : "bg-ink-50 text-slate-400 line-through"
            }`}
          >
            {p.label}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Create course */}
        <div>
          <h2 className="text-xl font-extrabold text-ink mb-4">Create a course</h2>
          <PermissionNotice allowed={permissions.canManageCourses}>
            <form onSubmit={handleCreateCourse} className="card p-6 space-y-4">
              {courseStatus.error && <p className="text-sm text-red-500 flex items-center gap-1.5"><AlertCircle size={14} />{courseStatus.error}</p>}
              {courseStatus.message && <p className="text-sm text-teal-600 flex items-center gap-1.5"><CheckCircle2 size={14} />{courseStatus.message}</p>}

              <input required placeholder="Course title" className="input" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
              <textarea required placeholder="Description" rows={3} className="input" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select required className="input" value={courseForm.university} onChange={(e) => setCourseForm({ ...courseForm, university: e.target.value })}>
                  <option value="">University</option>
                  {settings.supportedUniversities?.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <input required placeholder="Programme (e.g. BBA)" className="input" value={courseForm.program} onChange={(e) => setCourseForm({ ...courseForm, program: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Subject" className="input" value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} />
                <input placeholder="Semester (optional)" className="input" value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                <input type="number" min="0" placeholder="Price (₹)" disabled={courseForm.isFree} className="input flex-1" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} />
                <label className="flex items-center gap-2 text-sm font-medium text-ink-600 shrink-0">
                  <input type="checkbox" checked={courseForm.isFree} onChange={(e) => setCourseForm({ ...courseForm, isFree: e.target.checked })} /> Free course
                </label>
              </div>
              <button type="submit" disabled={courseStatus.loading} className="btn-primary">
                {courseStatus.loading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />} Create course
              </button>
            </form>
          </PermissionNotice>
        </div>

        {/* Upload content */}
        <div>
          <h2 className="text-xl font-extrabold text-ink mb-4">Publish content</h2>
          <div className="card p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setContentForm({ ...contentForm, type: t.key })}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                    contentForm.type === t.key ? "bg-pathway text-white" : "bg-ink-50 text-slate-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {!canUploadCurrentType ? (
              <PermissionNotice allowed={false} />
            ) : (
              <form onSubmit={handleUploadContent} className="space-y-4">
                {contentStatus.error && <p className="text-sm text-red-500 flex items-center gap-1.5"><AlertCircle size={14} />{contentStatus.error}</p>}
                {contentStatus.message && <p className="text-sm text-teal-600 flex items-center gap-1.5"><CheckCircle2 size={14} />{contentStatus.message}</p>}

                <select required className="input" value={contentForm.course} onChange={(e) => setContentForm({ ...contentForm, course: e.target.value })}>
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title} ({c.university})</option>)}
                </select>
                <input required placeholder="Title" className="input" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} />
                <textarea placeholder="Description (optional)" rows={2} className="input" value={contentForm.description} onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })} />
                <input required placeholder={contentForm.type === "video" ? "YouTube embed URL" : "File URL (PDF link)"} className="input" value={contentForm.fileUrl} onChange={(e) => setContentForm({ ...contentForm, fileUrl: e.target.value })} />

                {contentForm.type === "video" && (
                  <input type="number" min="0" placeholder="Duration (minutes)" className="input" value={contentForm.durationMinutes} onChange={(e) => setContentForm({ ...contentForm, durationMinutes: e.target.value })} />
                )}
                {contentForm.type === "questionPaper" && (
                  <input placeholder="Year(s) e.g. 2021-2024" className="input" value={contentForm.year} onChange={(e) => setContentForm({ ...contentForm, year: e.target.value })} />
                )}

                <div className="flex items-center gap-3">
                  <input type="number" min="0" placeholder="Price (₹)" disabled={contentForm.isFree} className="input flex-1" value={contentForm.price} onChange={(e) => setContentForm({ ...contentForm, price: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm font-medium text-ink-600 shrink-0">
                    <input type="checkbox" checked={contentForm.isFree} onChange={(e) => setContentForm({ ...contentForm, isFree: e.target.checked })} /> Free
                  </label>
                </div>

                <button type="submit" disabled={contentStatus.loading} className="btn-primary">
                  {contentStatus.loading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />} Publish
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Project requests */}
      {permissions.canManageProjectRequests && (
        <div>
          <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2"><FileEdit size={20} /> Project &amp; synopsis requests</h2>
          {requests.length === 0 ? (
            <div className="card p-8 text-center text-slate-500 text-sm">No requests yet.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                      {r.serviceType} · {r.university} · {r.program} · {r.student?.name}
                    </p>
                    <h4 className="font-display font-semibold text-ink">{r.topic}</h4>
                    <p className="text-xs text-slate-400 mt-1">Status: {r.status}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status === "pending" && (
                      <>
                        <div className="relative">
                          <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="number"
                            placeholder="Quote"
                            className="input pl-7 w-28 py-2"
                            value={quotes[r._id] || ""}
                            onChange={(e) => setQuotes({ ...quotes, [r._id]: e.target.value })}
                          />
                        </div>
                        <button onClick={() => handleQuote(r._id)} className="btn-primary btn-sm">Send quote</button>
                      </>
                    )}
                    {r.status === "inProgress" && (
                      <button onClick={() => handleStatus(r._id, "delivered")} className="btn-accent btn-sm">Mark delivered</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherStudio;
