import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { GuestProvider } from "../contexts/GuestContext";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Simplified weights for better compatibility
  display: "swap",
});

export const metadata: Metadata = {
  title: "Góc Truyện - Writer Home",
  description: "Nơi lưu trữ những câu chuyện, suy nghĩ và sáng tác văn học",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${notoSansJP.variable} antialiased`}
      >
        <AuthProvider>
          <GuestProvider>
            {children}
          </GuestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
