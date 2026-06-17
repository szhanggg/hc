import type { Metadata } from "next";
import Providers from "../components/Providers";
import Nav from "../components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "RMHC Bay Area — Donation Wishlist",
  description: "Support families at Ronald McDonald House Charities Bay Area",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div style={{
            minHeight: '100vh',
            fontFamily: "'sohne-var', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            background: '#F8F5F0',
          }}>
            <Nav />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
