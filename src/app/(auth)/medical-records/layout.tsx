import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manajemen Rekam Medis",
  description: "Halaman manajemen rekam medis pasien",
}

export default function MedicalRecordsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}