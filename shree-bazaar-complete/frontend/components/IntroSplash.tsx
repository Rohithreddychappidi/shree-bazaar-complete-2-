"use client";

import { useEffect, useState } from "react";

// Shows once per browser session (not on every client-side route change, since this
// mounts once in the root layout — sessionStorage additionally guards against it
// reappearing on a hard refresh later in the same session, which would feel like a
// glitch rather than a welcome).
export default function IntroSplash() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "exiting">("hidden");

  useEffect(() => {
    if (sessionStorage.getItem("intro-shown")) return;
    sessionStorage.setItem("intro-shown", "1");
    setPhase("visible");

    const exitTimer = setTimeout(() => setPhase("exiting"), 1400);
    const removeTimer = setTimeout(() => setPhase("hidden"), 1850);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8F8FC] ${
        phase === "exiting" ? "intro-exit" : ""
      }`}
    >
      <span className="intro-word font-display text-5xl font-extrabold text-purple-700 sm:text-6xl">Shop</span>
      <span className="intro-rule my-2 h-[2px] overflow-hidden bg-purple-700" style={{ width: 0 }} />
      <span
        className="intro-word font-display text-sm font-semibold tracking-[6px] text-gray-900 uppercase sm:text-base"
        style={{ animationDelay: "0.3s" }}
      >
        Hemu
      </span>
    </div>
  );
}
