import type { Metadata } from "next";
import "./globals.css";
import { QACanvas } from "@/components/QACanvas";

export const metadata: Metadata = {
  title: "Pre-Code Unit Test Case Generator",
  description:
    "Generate structured pre-code unit test cases with Gemini, store sessions in Supabase, and export to Excel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QACanvas />
        {children}
      </body>
    </html>
  );
}
