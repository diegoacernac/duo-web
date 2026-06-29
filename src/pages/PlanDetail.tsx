import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Calendar, MapPin, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPlanDate, STATUS_BADGE, STATUS_LABEL, type Plan, type PlanStatus } from '@/lib/plans'

const cardShadow = { boxShadow: '0 4px 12px rgba(14,11,20,0.4)' }

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .eq('id', id!)
      .single()
      .then(({ data }) => {
        setPlan(data as Plan | null)
        setLoading(false)
      })
  }, [id])

  async function updateStatus(status: PlanStatus) {
    const { error } = await supabase.from('plans').update({ status }).eq('id', id!)
    if (!error) navigate(-1)
  }

  async function handleDelete() {
    const { error } = await supabase.from('plans').delete().eq('id', id!)
    if (!error) navigate('/plans', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0e0b14] min-h-dvh">
        <div className="w-6 h-6 rounded-full border-2 border-[#c084a8] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0e0b14] min-h-dvh">
        <p className="text-[#5a4f65]">Plan no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-[#0e0b14] min-h-full page-enter">
      {/* Header */}
      <div
        className="bg-[#160f22] rounded-b-[28px] px-5 pb-6 flex items-center gap-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)', boxShadow: '0 4px 20px rgba(192,132,168,0.15)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#251b36] shrink-0"
        >
          <ArrowLeft size={18} color="#c084a8" />
        </button>
        <p className="text-[#f5f0eb] text-2xl flex-1 truncate" style={{ fontFamily: 'serif' }}>
          {plan.title}
        </p>
      </div>

      <div className="flex flex-col px-5 pt-5 gap-4 pb-10">
        {/* Card */}
        <div className="bg-[#1a1525] rounded-2xl p-5 border border-[#2a2035] rise" style={cardShadow}>
          <div className="flex justify-between items-start mb-3">
            <p className="text-[#f5f0eb] text-2xl flex-1 pr-2" style={{ fontFamily: 'serif' }}>
              {plan.title}
            </p>
            <span className={`rounded-full px-2.5 py-1 text-xs whitespace-nowrap ${STATUS_BADGE[plan.status]}`}>
              {STATUS_LABEL[plan.status]}
            </span>
          </div>

          {plan.date && (
            <p className="text-[#7c6f85] text-sm mt-1 flex items-center gap-1.5">
              <Calendar size={13} /> {formatPlanDate(plan.date)}
            </p>
          )}
          {plan.place && (
            <p className="text-[#7c6f85] text-sm mt-1 flex items-center gap-1.5">
              <MapPin size={13} /> {plan.place}
            </p>
          )}
          {plan.description && (
            <p className="text-[#9b8fa0] text-sm mt-3 leading-5">{plan.description}</p>
          )}
        </div>

        {/* Actions */}
        {plan.status === 'pending' && (
          <div className="flex flex-col gap-2.5 mt-2">
            <button
              className="rounded-xl py-4 font-semibold text-base border border-[#2a4f3a] text-[#6ecfa8] tappable"
              style={{ backgroundColor: '#0d2e22' }}
              onClick={() => updateStatus('done')}
            >
              Marcar como hecho
            </button>
            <button
              className="rounded-xl py-4 font-semibold text-base border border-[#2a2035] text-[#5a4f65] tappable"
              style={{ backgroundColor: '#1a1525' }}
              onClick={() => updateStatus('cancelled')}
            >
              Cancelar plan
            </button>
          </div>
        )}

        {/* Delete */}
        {!confirmDelete ? (
          <button
            className="py-4 text-[#8b3a3a] text-sm mt-auto"
            onClick={() => setConfirmDelete(true)}
          >
            Eliminar plan
          </button>
        ) : (
          <div className="bg-[#1a1525] rounded-2xl p-4 border border-[#2a2035] flex flex-col gap-3">
            <p className="text-[#f5f0eb] text-sm text-center">¿Seguro que quieres eliminarlo?</p>
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl py-3 border border-[#2a2035] text-[#7c6f85] text-sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </button>
              <button
                className="flex-1 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-1.5"
                style={{ backgroundColor: '#3a1515', color: '#e07070' }}
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
