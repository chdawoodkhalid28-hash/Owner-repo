import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Bahawal Digital News | بہاول ڈیجیٹل نیوز",
  description: "Bahawalnagar district and beyond — verified local, national and world news.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bahawal-digital-news.vercel.app"),
  openGraph: { title: "Bahawal Digital News", description: "Your district. Your voice. Verified.", type: "website" },
  robots: { index: true, follow: true }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ur" dir="rtl"><body>{children}</body></html>;
}