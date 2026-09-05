import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { StoreProvider } from "@/lib/store-context";
import { AdminDataProvider } from "@/lib/admin-data-context";
import { AuthProvider } from "@/lib/auth-context";
import ProfileCompletionPrompt from "@/components/ProfileCompletionPrompt";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Shop Hemu | Traditional Food, Fashion & Gifting",
  description: "Shop food, women's ethnic wear, pooja items, gifts and more — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <AdminDataProvider>
            <StoreProvider>
              <Navbar />
              {/* pb-24 keeps page content (and the footer) clear of the floating mobile
                  bottom nav — no extra padding needed on desktop, where it's hidden. */}
              <div className="pb-24 md:pb-0">
                {children}
                <Footer />
              </div>
              <BottomNav />
              <ProfileCompletionPrompt />
            </StoreProvider>
          </AdminDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}