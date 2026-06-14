import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const NotFound = () => (
  <div className="section min-h-[70vh] flex flex-col items-center justify-center text-center py-20">
    <span className="h-16 w-16 rounded-2xl bg-pathway-50 text-pathway flex items-center justify-center mb-5">
      <Compass size={28} />
    </span>
    <h1 className="text-4xl font-extrabold text-ink mb-2">Lost on the pathway?</h1>
    <p className="text-slate-500 mb-6">The page you're looking for doesn't exist or may have moved.</p>
    <Link to="/" className="btn-primary">Back to home</Link>
  </div>
);

export default NotFound;
