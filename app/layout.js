import { Public_Sans, Newsreader } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/src/context/AuthContext";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata = {
  title: "Student Administration System",
  description:
    "Complete student management and administration system for educational institutions",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: "#1B4332",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${publicSans.variable} ${newsreader.variable}`}
    >
      <body className="font-sans antialiased bg-background">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                border: "1px solid #E8DFD4",
                color: "#3D3227",
              },
              className: "font-sans",
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
