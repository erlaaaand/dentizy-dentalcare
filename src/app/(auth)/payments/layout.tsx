import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manajemen Pembayaran",
  description: "Halaman manajemen pembayaran perawatan dan pengobatan gigi",
}

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}