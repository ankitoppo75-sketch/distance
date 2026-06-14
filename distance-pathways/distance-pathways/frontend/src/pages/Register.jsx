import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, AlertCircle, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    university: "",
    program: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section min-h-[80vh] flex items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-lg p-8"
      >
        <div className="flex flex-col items-center text-center mb-7">
          <span className="h-12 w-12 rounded-xl bg-pathway text-white flex items-center justify-center mb-3">
            <GraduationCap size={24} />
          </span>
          <h1 className="text-2xl font-extrabold text-ink">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Start your distance education pathway today</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-5">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input name="name" required className="input" placeholder="Your name" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" name="email" required className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" required minLength={6} className="input" placeholder="At least 6 characters" value={form.password} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Phone number</label>
              <input name="phone" className="input" placeholder="Optional" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">University</label>
              <select name="university" className="input" value={form.university} onChange={handleChange}>
                <option value="">Select university</option>
                {settings.supportedUniversities?.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Programme</label>
              <input name="program" className="input" placeholder="e.g. BCA, MBA, B.Com" value={form.program} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="label">I am joining as a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "student" })}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  form.role === "student" ? "border-pathway bg-pathway-50 text-pathway" : "border-ink-100 text-slate-500"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "teacher" })}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  form.role === "teacher" ? "border-pathway bg-pathway-50 text-pathway" : "border-ink-100 text-slate-500"
                }`}
              >
                Teacher / Mentor
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Teacher accounts require the admin to enable upload permissions before you can publish content.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            <UserPlus size={16} /> {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-pathway font-semibold">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
