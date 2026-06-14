import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Image,
  ToggleLeft,
  Users,
  FileEdit,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users2,
  GraduationCap,
  BookOpen,
  Library,
  IndianRupee,
  Clock,
} from "lucide-react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useSettings } from "../context/SettingsContext";
import { resolveAssetUrl } from "../utils/assets";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "branding", label: "Branding", icon: Image },
  { key: "features", label: "Feature access", icon: ToggleLeft },
  { key: "users", label: "Users & permissions", icon: Users },
  { key: "requests", label: "Project requests", icon: FileEdit },
];

const FEATURE_LABELS = {
  videoLibrary: "Video lecture library",
  notesLibrary: "Notes library",
  questionPapers: "Question papers",
  projectServices: "Synopsis / project / research help",
  liveClasses: "Live classes",
  courseEnrollment: "Course enrollment",
};

const RESTRICTABLE_FEATURES = ["liveClasses", "videoLibrary", "notesLibrary", "questionPapers", "projectServices", "courseEnrollment"];

const TEACHER_PERMISSIONS = {
  canManageCourses: "Create / manage courses",
  canUploadVideos: "Upload videos",
  canUploadNotes: "Upload notes",
  canUploadQuestionPapers: "Upload question papers",
  canManageProjectRequests: "Handle project requests",
};

/* ----------------------------- Overview ----------------------------- */
const Overview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setStats(data.stats)).catch(() => setStats(null));
  }, []);

  if (!stats) return <Loader label="Loading stats..." />;

  const cards = [
    { label: "Students", value: stats.totalStudents, icon: GraduationCap, color: "bg-pathway-50 text-pathway" },
    { label: "Teachers", value: stats.totalTeachers, icon: Users2, color: "bg-teal-50 text-teal-600" },
    { label: "Courses", value: stats.totalCourses, icon: BookOpen, color: "bg-amber-50 text-amber-600" },
    { label: "Content items", value: stats.totalContent, icon: Library, color: "bg-pathway-50 text-pathway" },
    { label: "Pending requests", value: stats.pendingRequests, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Total revenue", value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="card p-6">
            <span className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>
              <Icon size={22} />
            </span>
            <p className="text-2xl font-display font-extrabold text-ink">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
};

/* ----------------------------- Branding ----------------------------- */
const Branding = () => {
  const { settings: liveSettings, refreshSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => setForm(data.settings)).catch(() => {});
  }, []);

  if (!form) return <Loader label="Loading settings..." />;

  const save = async () => {
    setStatus({ loading: true, message: "", error: "" });
    try {
      const { data } = await api.put("/admin/settings", {
        siteName: form.siteName,
        tagline: form.tagline,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        supportedUniversities: form.supportedUniversities,
      });
      setForm(data.settings);
      await refreshSettings();
      setStatus({ loading: false, message: "Settings saved.", error: "" });
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.response?.data?.message || "Could not save settings" });
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const { data } = await api.put("/admin/settings/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ ...form, logoUrl: data.logoUrl });
      await refreshSettings();
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.response?.data?.message || "Could not upload logo" });
    } finally {
      setLogoUploading(false);
    }
  };

  const updateUniversity = (index, value) => {
    const next = [...form.supportedUniversities];
    next[index] = value;
    setForm({ ...form, supportedUniversities: next });
  };

  const addUniversity = () => setForm({ ...form, supportedUniversities: [...form.supportedUniversities, "New University"] });
  const removeUniversity = (index) => setForm({ ...form, supportedUniversities: form.supportedUniversities.filter((_, i) => i !== index) });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="card p-6 lg:col-span-1">
        <h3 className="font-display font-semibold text-ink mb-4">App logo</h3>
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-2xl bg-pathway-50 flex items-center justify-center overflow-hidden border border-ink-100">
            {liveSettings.logoUrl ? (
              <img src={resolveAssetUrl(form.logoUrl || liveSettings.logoUrl)} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <GraduationCap size={32} className="text-pathway" />
            )}
          </div>
          <label className="btn-outline btn-sm cursor-pointer">
            {logoUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload new logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
          <p className="text-xs text-slate-400 text-center">PNG, JPG, WEBP or SVG. Square images work best.</p>
        </div>
      </div>

      <div className="card p-6 lg:col-span-2 space-y-4">
        <h3 className="font-display font-semibold text-ink mb-1">Site details</h3>
        {status.error && <p className="text-sm text-red-500 flex items-center gap-1.5"><AlertCircle size={14} />{status.error}</p>}
        {status.message && <p className="text-sm text-teal-600 flex items-center gap-1.5"><CheckCircle2 size={14} />{status.message}</p>}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Site name</label>
            <input className="input" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Primary color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="h-11 w-12 rounded-lg border border-ink-100" />
              <input className="input" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Accent color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="h-11 w-12 rounded-lg border border-ink-100" />
              <input className="input" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Support email</label>
            <input className="input" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div>
            <label className="label">Support phone</label>
            <input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Supported universities</label>
          <div className="space-y-2">
            {form.supportedUniversities.map((u, i) => (
              <div key={i} className="flex gap-2">
                <input className="input" value={u} onChange={(e) => updateUniversity(i, e.target.value)} />
                <button onClick={() => removeUniversity(i)} className="btn-ghost btn-sm text-red-500">Remove</button>
              </div>
            ))}
            <button onClick={addUniversity} className="btn-outline btn-sm">+ Add university</button>
          </div>
        </div>

        <button onClick={save} disabled={status.loading} className="btn-primary">
          {status.loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save changes
        </button>
      </div>
    </div>
  );
};

/* ----------------------------- Feature flags ----------------------------- */
const FeatureFlags = () => {
  const [flags, setFlags] = useState(null);
  const { refreshSettings } = useSettings();

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => setFlags(data.settings.featureFlags)).catch(() => {});
  }, []);

  if (!flags) return <Loader label="Loading feature flags..." />;

  const toggle = async (key) => {
    const updated = { ...flags, [key]: !flags[key] };
    setFlags(updated);
    await api.put("/admin/settings/features", { [key]: updated[key] });
    await refreshSettings();
  };

  return (
    <div className="card p-6">
      <h3 className="font-display font-semibold text-ink mb-1">Global feature access</h3>
      <p className="text-sm text-slate-500 mb-5">Turn an entire feature on or off for every student across the app.</p>
      <div className="space-y-3">
        {Object.entries(FEATURE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between border border-ink-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-ink-700">{label}</span>
            <button
              onClick={() => toggle(key)}
              className={`relative h-6 w-11 rounded-full transition ${flags[key] ? "bg-teal-500" : "bg-ink-100"}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${flags[key] ? "translate-x-5" : ""}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ----------------------------- Users & permissions ----------------------------- */
const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", { params: roleFilter ? { role: roleFilter } : {} });
      setUsers(data.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const updateRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    fetchUsers();
  };

  const toggleActive = async (id, isActive) => {
    await api.put(`/admin/users/${id}/status`, { isActive: !isActive });
    fetchUsers();
  };

  const updateTeacherPermission = async (id, key, value, user) => {
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, teacherPermissions: { ...u.teacherPermissions, [key]: value } } : u)));
    await api.put(`/admin/users/${id}/teacher-permissions`, { [key]: value });
  };

  const toggleRestrictedFeature = async (id, feature, user) => {
    const current = user.restrictedFeatures || [];
    const next = current.includes(feature) ? current.filter((f) => f !== feature) : [...current, feature];
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, restrictedFeatures: next } : u)));
    await api.put(`/admin/users/${id}/restricted-features`, { restrictedFeatures: next });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {["", "student", "teacher", "admin"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              roleFilter === r ? "bg-pathway text-white" : "bg-white border border-ink-100 text-slate-500"
            }`}
          >
            {r ? r.charAt(0).toUpperCase() + r.slice(1) + "s" : "All users"}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading users..." />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-pathway-50 text-pathway font-display font-bold flex items-center justify-center">
                    {u.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-semibold text-ink text-sm">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="input py-1.5 text-sm w-auto">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => toggleActive(u._id, u.isActive)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${u.isActive ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-500"}`}
                  >
                    {u.isActive ? "Active" : "Disabled"}
                  </button>
                  <button onClick={() => setExpanded(expanded === u._id ? null : u._id)} className="btn-ghost btn-sm">
                    {u.role === "teacher" ? "Permissions" : "Restrictions"}
                  </button>
                </div>
              </div>

              {expanded === u._id && u.role === "teacher" && (
                <div className="mt-4 pt-4 border-t border-ink-50 grid sm:grid-cols-2 gap-2">
                  {Object.entries(TEACHER_PERMISSIONS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-ink-600">
                      <input
                        type="checkbox"
                        checked={!!u.teacherPermissions?.[key]}
                        onChange={(e) => updateTeacherPermission(u._id, key, e.target.checked, u)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}

              {expanded === u._id && u.role === "student" && (
                <div className="mt-4 pt-4 border-t border-ink-50">
                  <p className="text-xs text-slate-400 mb-2">Restrict this student's access to specific features:</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {RESTRICTABLE_FEATURES.map((f) => (
                      <label key={f} className="flex items-center gap-2 text-sm text-ink-600">
                        <input
                          type="checkbox"
                          checked={u.restrictedFeatures?.includes(f)}
                          onChange={() => toggleRestrictedFeature(u._id, f, u)}
                        />
                        Block {FEATURE_LABELS[f]}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ----------------------------- Project requests ----------------------------- */
const RequestsPanel = () => {
  const [requests, setRequests] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/project-requests");
      setRequests(data.requests);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

  if (loading) return <Loader label="Loading requests..." />;

  if (requests.length === 0) return <div className="card p-8 text-center text-slate-500 text-sm">No requests yet.</div>;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              {r.serviceType} · {r.university} · {r.program} · {r.student?.name} ({r.student?.email})
            </p>
            <h4 className="font-display font-semibold text-ink">{r.topic}</h4>
            <p className="text-xs text-slate-400 mt-1">Status: {r.status} {r.isPriceQuoted ? `· Quoted ₹${r.quotedPrice}` : ""}</p>
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
  );
};

/* ----------------------------- Main panel ----------------------------- */
const AdminPanel = () => {
  const [tab, setTab] = useState("overview");

  return (
    <div className="section py-12">
      <div className="mb-10">
        <span className="eyebrow mb-3">Admin panel</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">Manage Distance Pathways</h1>
        <p className="text-slate-500 mt-2">Control branding, feature access, users and project requests.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition ${
                tab === t.key ? "bg-pathway text-white" : "bg-white border border-ink-100 text-slate-500 hover:border-pathway"
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "branding" && <Branding />}
      {tab === "features" && <FeatureFlags />}
      {tab === "users" && <UsersPanel />}
      {tab === "requests" && <RequestsPanel />}
    </div>
  );
};

export default AdminPanel;
