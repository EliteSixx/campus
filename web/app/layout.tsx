import type { Metadata } from "next";
import { Fira_Code, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/role-context";
import { ThemeProvider } from "@/context/theme-context";
import { SidebarProvider } from "@/context/sidebar-context";
import { SiteFooter } from "@/components/shared/site-footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: "CampusLink: AI-powered campus-to-corporate placement platform",
  description: "CampusLink: AI-powered campus-to-corporate placement platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="academic-indigo">
      <body className={`${plusJakarta.variable} ${firaCode.variable} font-sans antialiased bg-primary text-primary selection:bg-accent/30 selection:text-ink min-h-screen transition-colors duration-200`}>
        <ThemeProvider>
          <RoleProvider>
            <SidebarProvider>
              <div className="flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
                <SiteFooter />
              </div>
            </SidebarProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
