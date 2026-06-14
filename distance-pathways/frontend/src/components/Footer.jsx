import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, Youtube, Instagram, Linkedin } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { resolveAssetUrl } from "../utils/assets";

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-ink text-white mt-24">
      <div className="section py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            {settings.logoUrl ? (
              <img src={resolveAssetUrl(settings.logoUrl)} alt={settings.siteName} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span className="h-9 w-9 rounded-lg bg-teal flex items-center justify-center">
                <GraduationCap size={20} />
              </span>
            )}
            <span className="font-display font-bold text-lg">{settings.siteName}</span>
          </div>
          <p className="text-ink-100 text-sm leading-relaxed max-w-sm">
            {settings.tagline}. Built for IGNOU, DU SOL, Amity Online and other distance university students -
            video lectures, notes, previous year question papers, and synopsis / project / research paper writing
            support, all in one place.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal transition">
              <Youtube size={16} />
            </a>
            <a href="#" className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal transition">
              <Instagram size={16} />
            </a>
            <a href="#" className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal transition">
              <Linkedin size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm text-ink-100">
            <li><Link to="/courses" className="hover:text-teal transition">Courses</Link></li>
            <li><Link to="/library" className="hover:text-teal transition">Video lectures</Link></li>
            <li><Link to="/library?type=notes" className="hover:text-teal transition">Notes</Link></li>
            <li><Link to="/library?type=questionPaper" className="hover:text-teal transition">Question papers</Link></li>
            <li><Link to="/project-help" className="hover:text-teal transition">Synopsis &amp; project help</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-4">Contact</h4>
          <ul className="space-y-2.5 text-sm text-ink-100">
            <li className="flex items-center gap-2"><Mail size={15} /> {settings.contactEmail}</li>
            <li className="flex items-center gap-2"><Phone size={15} /> {settings.contactPhone}</li>
            <li className="pt-2 flex flex-wrap gap-2">
              {settings.supportedUniversities?.map((u) => (
                <span key={u} className="text-xs px-2.5 py-1 rounded-full bg-white/10">{u}</span>
              ))}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section py-5 text-xs text-ink-100 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          <p>Made for distance learners, by educators.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
