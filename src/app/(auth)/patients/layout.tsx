import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manajemen Pasien",
  description: "Halaman manajemen pasien klinik",
}

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}