"use client";

import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin } from "lucide-react";
import { useSettings } from "@/lib/use-settings";

// Brand icons aren't part of lucide-react, so these are small inline SVGs.
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px] text-white">
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.34C16.3 4.24 15.4 4.1 14.35 4.1c-2.4 0-4.05 1.46-4.05 4.15V10.5H7.8v3h2.5V21h3.2Z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px] text-white">
      <path d="M12 8.3a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4Zm0 6.1a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Zm4.7-6.25a.86.86 0 1 1-1.72 0 .86.86 0 0 1 1.72 0ZM12 4.6c2.5 0 2.8 0 3.8.06 1 .05 1.5.2 1.9.35.47.18.8.4 1.15.75.35.35.57.68.75 1.15.15.4.3.9.35 1.9.05 1 .06 1.3.06 3.8s0 2.8-.06 3.8c-.05 1-.2 1.5-.35 1.9-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.4.15-.9.3-1.9.35-1 .05-1.3.06-3.8.06s-2.8 0-3.8-.06c-1-.05-1.5-.2-1.9-.35a3.1 3.1 0 0 1-1.15-.75 3.1 3.1 0 0 1-.75-1.15c-.15-.4-.3-.9-.35-1.9C4.6 14.8 4.6 14.5 4.6 12s0-2.8.06-3.8c.05-1 .2-1.5.35-1.9.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.4-.15.9-.3 1.9-.35 1-.06 1.3-.06 3.8-.06Z" />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px] text-white">
      <path d="M6.94 8.5H3.56V20H6.94V8.5ZM5.25 3.5a1.97 1.97 0 1 0 0 3.94 1.97 1.97 0 0 0 0-3.94ZM20.44 20h-3.37v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V20H9.68V8.5h3.24v1.57h.05c.45-.85 1.55-1.75 3.2-1.75 3.42 0 4.05 2.25 4.05 5.17V20Z" />
    </svg>
  );
}

const columns = [
  { title: "Company", links: ["About Us", "Careers", "Blog", "Contact Us"] },
  { title: "Help", links: ["Track Order", "Shipping Info", "Cancellation Policy", "FAQs"] },
  { title: "Policies", links: ["Privacy Policy", "Terms of Service", "Shipping Policy"] },
];

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useSettings();
  if (pathname.startsWith("/admin")) return null;

  const socialLinks = [
    settings?.socialFacebook && { Icon: FacebookIcon, href: settings.socialFacebook },
    settings?.socialInstagram && { Icon: InstagramIcon, href: settings.socialInstagram },
    settings?.socialLinkedin && { Icon: LinkedinIcon, href: settings.socialLinkedin },
  ].filter((s): s is { Icon: typeof FacebookIcon; href: string } => !!s);

  return (
    <footer className="mt-[70px] bg-[#1B1030] text-[#D9D2EE]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-6 py-[52px] sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div>
          <div className="mb-3 font-display text-[22px] font-extrabold text-white">Shop Hemu</div>
          <p className="mb-4 text-[13px] leading-relaxed opacity-75">
            Traditional food, fashion, pooja essentials and gifting — brought to your doorstep with the care of home.
          </p>
          {socialLinks.length > 0 && (
            <div className="flex gap-2.5">
              {socialLinks.map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-purple-500">
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h5 className="mb-4 text-[13.5px] font-semibold text-white">{col.title}</h5>
            <ul>
              {col.links.map((l) => (
                <li key={l} className="mb-2.5 text-[13px] opacity-80 hover:cursor-pointer hover:opacity-100 hover:text-white">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h5 className="mb-4 text-[13.5px] font-semibold text-white">Contact Us</h5>
          <ul className="flex flex-col gap-3 text-[13px] opacity-80">
            {settings?.contactPhone && (
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 shrink-0" />
                <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="hover:text-white hover:opacity-100">
                  {settings.contactPhone}
                </a>
              </li>
            )}
            {settings?.contactEmail && (
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white hover:opacity-100">
                  {settings.contactEmail}
                </a>
              </li>
            )}
            {settings?.contactAddress && (
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>{settings.contactAddress}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2.5 border-t border-white/8 px-6 py-[18px] text-[12.5px] opacity-65">
        <span>© 2026 Shop Hemu. All rights reserved.</span>
        <span>Secure payments powered by Razorpay &nbsp;•&nbsp; Shipping by Shiprocket</span>
      </div>
    </footer>
  );
}
