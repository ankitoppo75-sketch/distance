import React from "react";
import { Link } from "react-router-dom";
import { Star, Users, ArrowUpRight } from "lucide-react";
import { resolveAssetUrl } from "../utils/assets";

const CourseCard = ({ course }) => {
  return (
    <Link
      to={`/courses/${course._id}`}
      className="card group overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-soft transition-all duration-300"
    >
      <div className="h-36 bg-gradient-to-br from-pathway to-teal relative overflow-hidden">
        {course.thumbnail ? (
          <img src={resolveAssetUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-grid opacity-30" />
        )}
        <span className="absolute top-3 left-3 text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-white/90 text-ink">
          {course.university}
        </span>
        {(course.isFree || course.price === 0) && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal text-white">
            Free
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
          {course.program} · {course.semester || "All semesters"}
        </p>
        <h3 className="font-display font-semibold text-lg text-ink leading-snug mb-2 group-hover:text-pathway transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{course.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-ink-50">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Star size={14} className="text-amber fill-amber" /> {course.rating?.toFixed(1)}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {course.studentsEnrolled || 0}</span>
          </div>
          <div className="flex items-center gap-1 font-display font-bold text-pathway">
            {course.isFree || course.price === 0 ? (
              <span className="text-teal-600">Free</span>
            ) : (
              <span className="price-tag">₹{course.price}</span>
            )}
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
