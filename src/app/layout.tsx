import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sinoandina Revenue Machine · SaaS B2B CRM & Prospector",
  description: "Plataforma comercial B2B con IA: Prospección inteligente, CRM Kanban, WhatsApp y Outreach Antispam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased min-h-screen bg-[#070d19] text-slate-100">
        {children}
      </body>
    </html>
  );
}
