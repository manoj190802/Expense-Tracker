import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "InEx-tracker — Premium Expense Tracker",
  description: "InEx-tracker is a premium, glassmorphism-themed Expense Tracker with dynamic charts, local storage persistence, CSV exporting, budgeting alerts, and multiple views.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}

