"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "purple", label: "Purple", swatch: "#6D28D9" },
  { id: "gold", label: "Gold", swatch: "#96751A" },
  { id: "black", label: "Black", swatch: "#18181B" },
  { id: "yellow", label: "Yellow", swatch: "#92620A" },
  { id: "light-yellow", label: "Light Yellow", swatch: "#A9821C" },
  { id: "violet", label: "Violet", swatch: "#7E22CE" },
  { id: "orange", label: "Orange", swatch: "#C2410C" },
  { id: "heritage", label: "Heritage", swatch: "#12261D" },
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a one-time flag from the URL/localStorage on mount, not a derived-state anti-pattern
      setEnabled(true);
    } else if (alreadyEnabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a one-time flag from localStorage on mount, not a derived-state anti-pattern
      setEnabled(true);
    }

    const saved = localStorage.getItem("preview-theme") || "purple";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved preview theme from localStorage on mount, not a derived-state anti-pattern
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
    <div className="fixed bottom-5 right-5 z-[200] flex max-w-[190px] flex-wrap items-center gap-2 rounded-2xl border border-[#EFEDF8] bg-white px-3 py-2.5 shadow-lg sm:max-w-none sm:flex-nowrap sm:rounded-full">
      <span className="mb-1 w-full text-[11px] font-medium text-gray-500 sm:mb-0 sm:w-auto sm:mr-1">Preview:</span>
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