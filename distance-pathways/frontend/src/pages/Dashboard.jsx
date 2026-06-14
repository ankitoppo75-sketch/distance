import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Receipt, FileEdit, ArrowUpRight, GraduationCap } from "lucide-react";
import api from "../api/axios";
import Loader from "../components/Loader";
import CourseCard from "../components/CourseCard";
import { useAuth } from "../context/AuthContext";
import TeacherStudio from "./TeacherStudio";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, ordersRes] = await Promise.all([
          api.get("/courses"),
          api.get("/payments/my-orders"),
        ]);
        const enrolledIds = new Set((user.enrolledCourses || []).map((c) => c.toString?.() || c));
        setCourses(coursesRes.data.courses.filter((c) => enrolledIds.has(c._id)));
        setOrders(ordersRes.data.orders);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Loader label="Loading your dashboard..." />;

  return (
    <div className="section py-12">
      <div className="mb-10">
        <span className="eyebrow mb-3">Your dashboard</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 mt-2">
          {user.university ? `${user.university} · ${user.program || "Your programme"}` : "Continue where you left off"}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-12">
        <Link to="/courses" className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition">
          <span className="h-11 w-11 rounded-xl bg-pathway-50 text-pathway flex items-center justify-center"><BookOpen size={20} /></span>
          <div>
            <p className="font-display font-semibold text-ink">Browse courses</p>
            <p className="text-xs text-slate-400">Find new subjects</p>
          </div>
        </Link>
        <Link to="/library" className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition">
          <span className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center"><GraduationCap size={20} /></span>
          <div>
            <p className="font-display font-semibold text-ink">Resource library</p>
            <p className="text-xs text-slate-400">Videos, notes &amp; papers</p>
          </div>
        </Link>
        <Link to="/project-help" className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition">
          <span className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><FileEdit size={20} /></span>
          <div>
            <p className="font-display font-semibold text-ink">Project help</p>
            <p className="text-xs text-slate-400">Synopsis &amp; research support</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-extrabold text-ink">Your courses</h2>
        <Link to="/courses" className="text-sm font-semibold text-pathway flex items-center gap-1">
          Browse more <ArrowUpRight size={14} />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card p-10 text-center text-slate-500 mb-12">
          You haven't enrolled in any courses yet.{" "}
          <Link to="/courses" className="text-pathway font-semibold">Browse the catalog</Link>.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-5">
        <Receipt size={20} className="text-pathway" />
        <h2 className="text-2xl font-extrabold text-ink">Payment history</h2>
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm">No payments yet.</div>
      ) : (
        <div className="card divide-y divide-ink-50">
          {orders.map((o) => (
            <div key={o._id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-semibold text-ink">{o.itemTitle}</p>
                <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()} · {o.paymentMethod || "—"}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold text-ink">₹{o.amount}</p>
                <p className={`text-xs ${o.status === "paid" ? "text-teal-600" : o.status === "failed" ? "text-red-500" : "text-amber-600"}`}>
                  {o.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "teacher") return <TeacherStudio />;

  return <StudentDashboard />;
};

export default Dashboard;
