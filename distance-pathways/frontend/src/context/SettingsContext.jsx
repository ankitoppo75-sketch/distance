import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  siteName: "Distance Pathways",
  tagline: "Your Pathway to Distance Education Success",
  logoUrl: "",
  primaryColor: "#2A4DD0",
  accentColor: "#13B8A6",
  featureFlags: {
    videoLibrary: true,
    notesLibrary: true,
    questionPapers: true,
    projectServices: true,
    liveClasses: true,
    courseEnrollment: true,
  },
  supportedUniversities: ["IGNOU", "DU SOL", "Amity Online", "NMIMS GE", "Other"],
  contactEmail: "support@distancepathways.com",
  contactPhone: "+91 90000 00000",
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const { data } = await api.get("/settings/public");
      setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
