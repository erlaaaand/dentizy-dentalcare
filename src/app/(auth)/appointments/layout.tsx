import type { Metadata } from "next"
import type { ReactNode } from "react"
import { AppointmentProvider } from "@/src/core/providers"

export const metadata: Metadata = {
  title: "Manajemen Jadwal",
  description: "Halaman manajemen jadwal kunjungan klinik",
}

export default function AppointmentsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AppointmentProvider>
      {children}
    </AppointmentProvider>
  )
}