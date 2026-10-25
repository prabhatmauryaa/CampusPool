import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "CampusPool | KIET College Ride-Sharing & Carpooling",
  description: "Same destination. Shared ride. Lower cost. Official student-exclusive ride-sharing platform for KIET Group of Institutions. Connect with verified fellow students traveling from campus.",
  keywords: "CampusPool, KIET, Ride Sharing, Carpooling, KIET Group of Institutions, Student Travel, Ghaziabad",
  authors: [{ name: "CampusPool Team — KIET Group of Institutions" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
