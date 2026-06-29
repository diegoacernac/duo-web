export type PlanStatus = 'pending' | 'done' | 'cancelled'

export type Plan = {
  id: string
  created_by: string
  title: string
  date: string | null
  place: string | null
  description: string | null
  status: PlanStatus
  created_at: string
}

export const STATUS_LABEL: Record<PlanStatus, string> = {
  pending: 'Pendiente',
  done: 'Hecho',
  cancelled: 'Cancelado',
}

export const STATUS_BADGE: Record<PlanStatus, string> = {
  pending: 'bg-[#2e1e0d] text-[#f5a06a]',
  done: 'bg-[#0d2e22] text-[#6ecfa8]',
  cancelled: 'bg-[#1e1a28] text-[#5a4f65]',
}

export const STATUS_COLOR: Record<PlanStatus, string> = {
  pending: '#f5a06a',
  done: '#6ecfa8',
  cancelled: '#3d3348',
}

// Parsea una fecha. Una cadena "YYYY-MM-DD" (solo fecha) se interpreta en
// hora LOCAL para evitar el corrimiento de un día por zona horaria
// (new Date("2026-06-30") la trataría como medianoche UTC).
export function parseDate(iso: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(iso)
}

export function formatPlanDate(iso: string | null): string {
  if (!iso) return ''
  return parseDate(iso).toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
