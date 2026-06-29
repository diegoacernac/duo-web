import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Calendar, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPlanDate, STATUS_BADGE, STATUS_COLOR, STATUS_LABEL, type Plan } from '@/lib/plans'

const cardShadow = { boxShadow: '0 4px 12px rgba(14,11,20,0.4)' }
const accentShadow = { boxShadow: '0 4px 20px rgba(192,132,168,0.4)' }

export default function Plans() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const loadPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('date', { ascending: true, nullsFirst: false })
    if (!error && data) setPlans(data as Plan[])
    setLoading(false)
  }, [])

  useEffect(() => { loadPlans() }, [loadPlans])

  return (
    <div className="flex flex-col bg-[#0e0b14] min-h-full pb-4 page-enter">
      {/* Hero */}
      <div
        className="bg-[#160f22] rounded-b-[28px] px-5 pb-6"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)', boxShadow: '0 4px 20px rgba(192,132,168,0.15)' }}
      >
        <p className="text-[#f5f0eb] text-3xl" style={{ fontFamily: 'serif' }}>Planes</p>
        <p className="text-[#7c6f85] text-xs tracking-wide mt-1">
          {loading
            ? '...'
            : plans.length === 0
              ? 'nada por aquí aún'
              : `${plans.length} plan${plans.length !== 1 ? 'es' : ''}`}
        </p>
      </div>

      <div className="flex flex-col px-4 pt-4 gap-3">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="w-6 h-6 rounded-full border-2 border-[#c084a8] border-t-transparent animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center mt-24 px-8">
            <Calendar size={40} color="#2e2040" />
            <p className="text-[#5a4f65] text-center mt-4 text-sm">
              Sin planes por ahora.{'\n'}¿Qué van a hacer?
            </p>
          </div>
        ) : (
          plans.map((item, i) => (
            <button
              key={item.id}
              className="bg-[#1a1525] rounded-3xl overflow-hidden border border-[#2a2035] flex text-left w-full rise tappable"
              style={{ ...cardShadow, animationDelay: `${i * 60}ms` }}
              onClick={() => navigate(`/plans/${item.id}`)}
            >
              <div className="w-1 shrink-0" style={{ backgroundColor: STATUS_COLOR[item.status] }} />
              <div className="flex-1 p-5">
                <div className="flex justify-between items-start">
                  <p className="text-[#f5f0eb] text-xl flex-1 pr-3" style={{ fontFamily: 'serif' }}>
                    {item.title}
                  </p>
                  <span className={`rounded-full px-3 py-1.5 text-xs whitespace-nowrap ${STATUS_BADGE[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
                {(item.date || item.place) && (
                  <p className="text-[#7c6f85] text-sm mt-2">
                    {[formatPlanDate(item.date), item.place].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* FAB */}
      <Link
        to="/plans/new"
        className="fixed bottom-20 w-14 h-14 rounded-full flex items-center justify-center pop tappable"
        style={{
          backgroundColor: '#c084a8',
          ...accentShadow,
          right: 'calc(max(50vw - 215px, 0px) + 16px)',
        }}
        aria-label="Nuevo plan"
      >
        <Plus size={28} color="#0e0b14" />
      </Link>
    </div>
  )
}
