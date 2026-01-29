import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manajemen Jadwal",
  description: "Halaman manajemen jadwal kunjungan klinik",
}

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}