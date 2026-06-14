import React from "react";

const Loader = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="h-10 w-10 rounded-full border-4 border-pathway-100 border-t-pathway animate-spin" />
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

export default Loader;
