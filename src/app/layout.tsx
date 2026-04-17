import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { GuestProvider } from "../contexts/GuestContext";
import Navigation from "../component/Navigation";
import MobileBottomNav from "../component/Navigation/MobileBottomNav";

export const metadata: Metadata = {
  title: "Meo Meo Ký",
  description: "Nơi lưu trữ những câu chuyện, suy nghĩ và sáng tác văn học",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <AuthProvider>
          <GuestProvider>
            <Navigation />
            <MobileBottomNav />
            <main className="pt-14 pb-16 md:pt-14 md:pb-0">
              {children}
            </main>
          </GuestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
