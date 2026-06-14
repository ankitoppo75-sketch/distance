import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirect = location.state?.from || (user.role === "admin" ? "/admin" : "/dashboard");
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
        className="card w-full max-w-md p-8"
      >
        <div className="flex flex-col items-center text-center mb-7">
          <span className="h-12 w-12 rounded-xl bg-pathway text-white flex items-center justify-center mb-3">
            <GraduationCap size={24} />
          </span>
          <h1 className="text-2xl font-extrabold text-ink">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Log in to continue your pathway</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-5">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="input pl-11"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                className="input pl-11"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LogIn size={16} /> {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          New to Distance Pathways?{" "}
          <Link to="/register" className="text-pathway font-semibold">
            Create an account
          </Link>
        </p>

        <div className="mt-6 pt-5 border-t border-ink-50 text-xs text-slate-400 text-center">
          Demo admin: admin@distancepathways.com / Admin@123
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
