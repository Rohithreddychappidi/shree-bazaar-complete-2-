import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StoreProvider } from "@/lib/store-context";
import { AdminDataProvider } from "@/lib/admin-data-context";
import { AuthProvider } from "@/lib/auth-context";
import ProfileCompletionPrompt from "@/components/ProfileCompletionPrompt";
import IntroSplash from "@/components/IntroSplash";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export const metadata: Metadata = {
  title: "Shop Hemu | Traditional Food, Fashion & Gifting",
  description: "Shop food, women's ethnic wear, pooja items, gifts and more — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <IntroSplash />
        <ThemeSwitcher />
        <AuthProvider>
          <AdminDataProvider>
            <StoreProvider>
              <Navbar />
              {children}
              <Footer />
              <ProfileCompletionPrompt />
            </StoreProvider>
          </AdminDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}