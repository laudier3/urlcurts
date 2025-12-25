import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script"; // 👈 IMPORT NECESSÁRIO

export const metadata: Metadata = {
  title: "UrlCurt",
  description:
    "Transforme links longos em URLs curtas com segurança, praticidade e estatísticas em tempo real.",

  // ✅ META TAG REFERRER
  referrer: "no-referrer-when-downgrade",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6BV36MJBP2"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6BV36MJBP2');
          `}
        </Script>
      </head>
      <body className="bg-gray-50 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
