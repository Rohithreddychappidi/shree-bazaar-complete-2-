"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "purple", label: "Purple", swatch: "#6D28D9" },
  { id: "gold", label: "Gold", swatch: "#96751A" },
  { id: "black", label: "Black", swatch: "#18181B" },
  { id: "yellow", label: "Yellow", swatch: "#92620A" },
];

// Visit the site with ?preview-theme=1 once — after that it stays enabled in this
// browser (via localStorage) until cleared, so you don't need the query param on
// every page while demoing to the client. Real visitors never see this.
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("purple");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const alreadyEnabled = localStorage.getItem("theme-preview-enabled") === "1";
    if (params.has("preview-theme")) {
      localStorage.setItem("theme-preview-enabled", "1");
      setEnabled(true);
    } else if (alreadyEnabled) {
      setEnabled(true);
    }

    const saved = localStorage.getItem("preview-theme") || "purple";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  if (!enabled) return null;

  const choose = (id: string) => {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("preview-theme", id);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-2 rounded-full border border-[#EFEDF8] bg-white px-3 py-2 shadow-lg">
      <span className="mr-1 text-[11px] font-medium text-gray-500">Preview:</span>
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => choose(t.id)}
          title={t.label}
          className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
            theme === t.id ? "border-gray-900" : "border-transparent"
          }`}
          style={{ backgroundColor: t.swatch }}
        />
      ))}
    </div>
  );
}
