import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colmena · CRM & Prospección Comercial B2B",
  description: "Tu colmena comercial: prospección inteligente con IA, embudo Kanban de alta conversión y cierre de tratos.",
  icons: {
    icon: "/icon.svg",
  },
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
