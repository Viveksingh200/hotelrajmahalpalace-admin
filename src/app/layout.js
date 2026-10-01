import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  fallback: ["Georgia", "serif"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
});

export const metadata = {
  title: "Hotel Rajmahal Palace | Admin Management Console",
  description: "Executive Management Portal for Hotel Rajmahal Palace. Reservations, Rooms, Ledgers, and Real-time Pricing.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="bg-cream text-charcoal font-sans antialiased min-h-screen selection:bg-sandstone selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
