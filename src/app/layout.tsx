'use client';

import Header from "@/components/Header";
import { useLanguage } from "@/hooks/useLanguage";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = useLanguage();
  
  const footerText = language === 'pt' 
    ? 'Projeto para estudo e portfólio'
    : 'Project for study and portfolio';

  return (
    <html lang={language === 'pt' ? 'pt-BR' : 'en'}>
      <head>
        <title>Museu Vivo</title>
        <meta 
          name="description" 
          content={language === 'pt' 
            ? 'Explore milhares de obras de arte dos maiores museus do mundo. Art Institute of Chicago e Metropolitan Museum.'
            : 'Explore thousands of artworks from the world\'s greatest museums. Art Institute of Chicago and Metropolitan Museum.'
          } 
        />
        <link rel="icon" type="image/png" href="/assets/icon.png" />
        <link rel="shortcut icon" href="/assets/icon.png" type="image/png" />
      </head>
      <body>
        <Header />
        
        <main className="main-container">
          {children}
        </main>
        
        <footer className="footer">
          <p>© 2025 Museu Vivo - {footerText}</p>
        </footer>
      </body>
    </html>
  );
}
