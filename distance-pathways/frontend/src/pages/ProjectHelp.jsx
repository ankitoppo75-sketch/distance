import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileEdit, Send, CheckCircle2, Clock, IndianRupee, Loader2, AlertCircle } from "lucide-react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { payForItem } from "../utils/payment";

const SERVICE_TYPES = [
  { key: "synopsis", label: "Synopsis writing" },
  { key: "project", label: "Project work" },
  { key: "researchPaper", label: "Research paper" },
  { key: "dissertation", label: "Dissertation" },
];

const STATUS_STYLES = {
  pending: { label: "Pending review", color: "bg-amber-50 text-amber-600" },
  quoted: { label: "Quote ready", color: "bg-pathway-50 text-pathway" },
  paid: { label: "Paid", color: "bg-teal-50 text-teal-600" },
  inProgress: { label: "In progress", color: "bg-pathway-50 text-pathway" },
  delivered: { label: "Delivered", color: "bg-teal-50 text-teal-600" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-500" },
};

const ProjectHelp = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const [form, setForm] = useState({
    serviceType: "synopsis",
    university: "",
    program: "",
    topic: "",
    requirements: "",
    deadline: "",
  });
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payingId, setPayingId] = useState(null);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const { data } = await api.get("/project-requests/my");
      setRequests(data.requests);
    } catch {
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (user?.role === "student") fetchRequests();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/project-requests", form);
      setSuccess("Request submitted! Our team will review it and send you a price quote soon.");
      setForm({ serviceType: "synopsis", university: "", program: "", topic: "", requirements: "", deadline: "" });
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = (request) => {
    setPayingId(request._id);
    payForItem({
      itemType: "projectRequest",
      itemRef: request._id,
      user,
      theme: { primaryColor: settings.primaryColor, siteName: settings.siteName, logoUrl: settings.logoUrl },
      onSuccess: () => {
        setPayingId(null);
        fetchRequests();
      },
      onError: (msg) => {
        setPayingId(null);
        setError(msg);
      },
    });
  };

  return (
    <div className="section py-12">
      <div className="mb-10 max-w-2xl">
        <span className="eyebrow mb-3"><FileEdit size={14} /> Synopsis · Project · Research paper</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-2">Get expert help with your academic work</h1>
        <p className="text-slate-500">
          Share your university, programme and topic. Our mentors will review your requirements and reply with a
          clear price quote - you pay only after you're happy with the quote.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card p-6 lg:col-span-2 space-y-4"
        >
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 bg-teal-50 text-teal-600 text-sm rounded-xl p-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {success}
            </div>
          )}

          <div>
            <label className="label">What do you need help with?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SERVICE_TYPES.map((s) => (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => setForm({ ...form, serviceType: s.key })}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                    form.serviceType === s.key ? "border-pathway bg-pathway-50 text-pathway" : "border-ink-100 text-slate-500"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">University</label>
              <select required className="input" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}>
                <option value="">Select university</option>
                {settings.supportedUniversities?.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Programme</label>
              <input required className="input" placeholder="e.g. MBA, BCA, B.Com" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Topic / title (or area of interest)</label>
            <input required className="input" placeholder="e.g. Impact of digital marketing on consumer behaviour" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </div>

          <div>
            <label className="label">Additional requirements</label>
            <textarea rows={4} className="input" placeholder="Word count, formatting guidelines, submission date, anything else we should know..." value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </div>

          <div className="sm:w-1/2">
            <label className="label">Deadline (optional)</label>
            <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </motion.form>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-ink mb-4">Why students choose us</h3>
          <ul className="space-y-3 text-sm text-slate-500">
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-teal-500 mt-0.5 shrink-0" /> Mentors familiar with IGNOU, DU SOL and Amity formats &amp; guidelines</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-teal-500 mt-0.5 shrink-0" /> Transparent, upfront quote before you pay anything</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-teal-500 mt-0.5 shrink-0" /> Pay securely via card, UPI or netbanking</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-teal-500 mt-0.5 shrink-0" /> Revisions &amp; guidance until you're ready to submit</li>
          </ul>
        </div>
      </div>

      {user?.role === "student" && (
        <div className="mt-14">
          <h2 className="text-2xl font-extrabold text-ink mb-5">Your requests</h2>
          {loadingRequests ? (
            <Loader label="Loading your requests..." />
          ) : requests.length === 0 ? (
            <div className="card p-8 text-center text-slate-500 text-sm">You haven't submitted any requests yet.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                      {SERVICE_TYPES.find((s) => s.key === r.serviceType)?.label} · {r.university} · {r.program}
                    </p>
                    <h4 className="font-display font-semibold text-ink">{r.topic}</h4>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-2 ${STATUS_STYLES[r.status]?.color}`}>
                      <Clock size={12} /> {STATUS_STYLES[r.status]?.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {r.isPriceQuoted && (
                      <span className="font-display font-bold text-ink flex items-center gap-0.5">
                        <IndianRupee size={16} /> {r.quotedPrice}
                      </span>
                    )}
                    {r.status === "quoted" && (
                      <button onClick={() => handlePay(r)} disabled={payingId === r._id} className="btn-accent btn-sm">
                        {payingId === r._id ? <Loader2 size={16} className="animate-spin" /> : null}
                        Pay now
                      </button>
                    )}
                    {r.status === "delivered" && r.deliverables?.length > 0 && (
                      <a href={r.deliverables[0]} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                        Download
                      </a>
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

export default ProjectHelp;
