import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manajemen Akun Klinik",
  description: "Halaman manajemen akun pengelola klinik",
}

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}