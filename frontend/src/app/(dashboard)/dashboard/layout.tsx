import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dentizy Dental Care",
  description: "Clinic Management System",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}