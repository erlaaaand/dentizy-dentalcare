import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Manajemen Jadwal",
  description: "Halaman manajemen jadwal kunjungan klinik",
}

export default function AppointmentsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}