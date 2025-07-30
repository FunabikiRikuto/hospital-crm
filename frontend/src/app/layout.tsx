import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Hospital CRM",
  description: "医療ツーリズム向けCRMシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${notoSansJP.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
