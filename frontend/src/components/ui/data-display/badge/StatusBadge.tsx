import { StatusBadgeProps } from "./badge.types";
import { badgeVariants } from "./badge.styles";
import { default as Badge } from "./Badge";
import { STATUS_LABELS } from "@/core/constants/status.constants";

export function StatusBadge({ status, showDot = true, ...props }: StatusBadgeProps) {
  // Default config untuk status umum
  const defaultStatusConfig: Record<string, { variant: keyof typeof badgeVariants; label: string }> = {
    active: { variant: 'success', label: 'Aktif' },
    inactive: { variant: 'secondary', label: 'Tidak Aktif' },
    pending: { variant: 'warning', label: 'Menunggu' },
    completed: { variant: 'success', label: 'Selesai' },
    cancelled: { variant: 'error', label: 'Dibatalkan' },
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'primary', label: 'Terbit' },
  };

  // Coba ambil dari Core STATUS_LABELS dulu, fallback ke config default, atau raw string
  const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] ||
    defaultStatusConfig[status]?.label ||
    status.charAt(0).toUpperCase() + status.slice(1);

  // Tentukan varian warna berdasarkan status
  const getVariant = (statusKey: string): keyof typeof badgeVariants => {
    if (['active', 'success', 'completed', 'selesai'].includes(statusKey)) return 'success';
    if (['error', 'cancelled', 'deleted', 'dibatalkan'].includes(statusKey)) return 'error';
    if (['warning', 'pending', 'processing'].includes(statusKey)) return 'warning';
    if (['info', 'dijadwalkan'].includes(statusKey)) return 'info'; // Biru untuk dijadwalkan
    return 'default';
  };

  const variant = defaultStatusConfig[status]?.variant || getVariant(status);

  return (
    <Badge
      variant={variant}
      dot={showDot}
      {...props}
    >
      {props.children || label}
    </Badge>
  );
}