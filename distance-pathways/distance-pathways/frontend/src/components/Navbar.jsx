import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { resolveAssetUrl } from "../utils/assets";

const navLinks = [
  { to: "/courses", label: "Courses" },
  { to: "/library", label: "Video & Notes" },
  { to: "/project-help", label: "Project Help" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-ink-50">
      <nav className="section flex items-center justify-between h-18 py-3">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          {settings.logoUrl ? (
            <img src={resolveAssetUrl(settings.logoUrl)} alt={settings.siteName} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <span className="h-9 w-9 rounded-lg bg-pathway flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </span>
          )}
          <span className="font-display font-bold text-lg text-ink leading-none">
            {settings.siteName?.split(" ")[0]}
            <span className="text-pathway">{settings.siteName?.split(" ").slice(1).join(" ") ? " " + settings.siteName.split(" ").slice(1).join(" ") : ""}</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive ? "text-pathway bg-pathway-50" : "text-ink-600 hover:text-pathway hover:bg-pathway-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Get started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-ink-100 hover:border-pathway transition"
              >
                <span className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-display font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-ink-700 max-w-[120px] truncate">{user.name}</span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 card p-2 origin-top-right"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-pathway-50 hover:text-pathway"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-pathway-50 hover:text-pathway"
                      >
                        <ShieldCheck size={16} /> Admin panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-ink-50" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-ink-50 bg-white"
          >
            <div className="section py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-pathway-50 hover:text-pathway"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-ink-50 my-2" />
              {!user ? (
                <div className="flex gap-3">
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline btn-sm flex-1">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary btn-sm flex-1">
                    Get started
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-outline btn-sm">
                    Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="btn-outline btn-sm">
                      Admin panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn-ghost btn-sm text-red-500">
                    Log out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
