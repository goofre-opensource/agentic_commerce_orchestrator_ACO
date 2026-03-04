import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "../providers/ConfigProvider";
import { TopNav } from "../components/TopNav";
import { ThemeProvider } from "next-themes";
import { ConnectivityPulse } from "../components/ConnectivityPulse";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Goofre — Agentic Commerce Command Center",
  description:
    "Real-time orchestration health, multi-channel ID compliance, and predictive intelligence for the Universal Commerce Protocol.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-50 dark:bg-[#09090B] text-slate-900 dark:text-zinc-100 min-h-screen antialiased transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConfigProvider>
            <div className="flex flex-col h-screen overflow-hidden w-full">
              <TopNav />
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
              <ConnectivityPulse />
            </div>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
