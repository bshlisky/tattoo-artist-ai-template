import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { getTheme } from "./themes";

const inter = Inter({ subsets: ["latin"] });
const theme = getTheme();

export const metadata: Metadata = {
  title: `${theme.name} - AI-Powered Tattoo Studio`,
  description: theme.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={`min-h-screen bg-gradient-to-br ${theme.colors.background} relative overflow-hidden`}>
          {/* Subtle liquid background effect */}
          {theme.effects.liquidBackground && (
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
          )}
          
          <header className={`border-b ${theme.colors.borderColor} ${theme.colors.headerBg} backdrop-blur-sm sticky top-0 z-50 relative`}>
            {/* Subtle ink drip effect */}
            {theme.effects.inkDrip && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gradient-to-b from-gray-400 to-transparent opacity-30"></div>
            )}
            
            <div className="pl-3 sm:pl-6 lg:pl-8 pr-3 sm:pr-6 lg:pr-8">
              <div className="flex h-14 sm:h-16 items-center">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="min-w-0">
                    <h1 className={`text-lg sm:text-xl font-bold ${theme.colors.textPrimary} truncate tracking-wide font-serif`}>
                      {theme.name.toUpperCase()}
                    </h1>
                    <p className={`text-xs ${theme.colors.textSecondary} hidden sm:block font-serif italic`}>{theme.tagline}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className={`border-t ${theme.colors.borderColor} ${theme.colors.footerBg} backdrop-blur-sm relative`}>
            {/* Subtle ink drip effect */}
            {theme.effects.inkDrip && (
              <>
                <div className="absolute top-0 left-1/3 transform -translate-x-1/2 w-0.5 h-1 bg-gradient-to-b from-gray-400 to-transparent opacity-20"></div>
                <div className="absolute top-0 right-1/4 transform -translate-x-1/2 w-0.5 h-2 bg-gradient-to-b from-gray-300 to-transparent opacity-15"></div>
              </>
            )}
            
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
              <div className="flex h-12 items-center justify-center">
                <p className={`text-xs ${theme.colors.textMuted} font-serif`}>
                  © {new Date().getFullYear()} {theme.branding.copyright} - All rights reserved
                </p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster position="top-center" theme={theme.name === 'Dreadmoor' ? 'dark' : 'light'} />
      </body>
    </html>
  );
}
