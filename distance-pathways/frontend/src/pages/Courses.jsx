import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";
import Loader from "../components/Loader";
import { useSettings } from "../context/SettingsContext";

const Courses = () => {
  const [params, setParams] = useSearchParams();
  const { settings } = useSettings();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") || "");
  const [university, setUniversity] = useState(params.get("university") || "");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const query = {};
      if (search) query.search = search;
      if (university) query.university = university;
      const { data } = await api.get("/courses", { params: query });
      setCourses(data.courses);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (search) next.search = search;
    if (university) next.university = university;
    setParams(next);
  };

  return (
    <div className="section py-12">
      <div className="mb-10">
        <span className="eyebrow mb-3">Course catalog</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-2">Find your subject</h1>
        <p className="text-slate-500 max-w-2xl">
          Every course bundles recorded lectures, notes, and previous year question papers - mapped to your
          university's syllabus.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 mb-10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, course title or program..."
            className="input pl-11"
          />
        </div>
        <div className="relative sm:w-56">
          <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select value={university} onChange={(e) => setUniversity(e.target.value)} className="input pl-11">
            <option value="">All universities</option>
            {settings.supportedUniversities?.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? (
        <Loader label="Loading courses..." />
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-display font-semibold text-lg text-ink mb-1">No courses found</p>
          <p className="text-slate-500 text-sm">Try a different subject, course title or university.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
