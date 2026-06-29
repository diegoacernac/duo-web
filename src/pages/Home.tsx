import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Heart, PlusCircle, Calendar, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPlanDate, STATUS_BADGE, STATUS_COLOR, STATUS_LABEL, type Plan } from '@/lib/plans'

type ProfileInfo = {
  name: string | null
  partner_id: string | null
  relationship_start: string | null
  partner: { name: string | null } | null
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

function formatRelationshipDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

const cardShadow = { boxShadow: '0 4px 12px rgba(14,11,20,0.4)' }
const accentShadow = { boxShadow: '0 4px 20px rgba(192,132,168,0.15)' }

export default function Home() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileInfo | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, plansRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('name, partner_id, relationship_start, partner:partner_id(name)')
        .eq('id', user.id)
        .single(),
      supabase.from('plans').select('*').order('date', { ascending: true, nullsFirst: false }),
    ])

    if (profileRes.data) setProfile(profileRes.data as unknown as ProfileInfo)
    if (plansRes.data) setPlans(plansRes.data as Plan[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0e0b14] min-h-[calc(100dvh-56px)]">
        <div className="w-6 h-6 rounded-full border-2 border-[#c084a8] border-t-transparent animate-spin" />
      </div>
    )
  }

  const hasPartner = !!profile?.partner_id
  const firstName = profile?.name?.split(' ')[0] ?? ''
  const partnerName = profile?.partner?.name?.split(' ')[0] ?? 'tu pareja'
  const days = daysSince(profile?.relationship_start ?? null)
  const totalPlans = plans.length
  const pendingPlans = plans.filter((p) => p.status === 'pending').length
  const upcomingPlans = plans.filter((p) => p.status === 'pending').slice(0, 5)

  return (
    <div className="flex flex-col bg-[#0e0b14] pb-4 page-enter">
      {/* Hero */}
      <div
        className="bg-[#160f22] px-5 pb-6 rounded-b-[28px]"
        style={{ ...accentShadow, paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#7c6f85] text-xs tracking-widest uppercase">buenas,</p>
            <p className="text-[#f5f0eb] text-2xl mt-0.5" style={{ fontFamily: 'serif' }}>
              {firstName}
            </p>
          </div>

          {hasPartner ? (
            <div className="flex items-center bg-[#251b36] rounded-full px-3 py-1.5 gap-1.5">
              <Heart size={12} fill="#c084a8" color="#c084a8" />
              <span className="text-[#c4b8cc] text-xs">{partnerName}</span>
            </div>
          ) : (
            <button
              className="flex items-center bg-[#251b36] rounded-full px-3 py-1.5 gap-1.5"
              onClick={() => navigate('/profile')}
            >
              <PlusCircle size={13} color="#c084a8" />
              <span className="text-[#9b8fa0] text-xs">Conectar pareja</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col px-5 pt-5 gap-3">
        {days !== null ? (
          <>
            {/* Días juntos */}
            <div className="bg-[#1a1525] rounded-3xl p-6 border border-[#2a2035] rise" style={cardShadow}>
              <p className="text-[#7c6f85] text-xs tracking-[0.2em] uppercase mb-1">Días juntos</p>
              <p
                className="text-[#f5f0eb]"
                style={{ fontFamily: 'serif', fontSize: 64, lineHeight: '72px' }}
              >
                {days}
              </p>
              <p className="text-[#5a4f65] text-xs mt-1">
                desde el {formatRelationshipDate(profile!.relationship_start!)}
              </p>
            </div>

            {/* Mini stats */}
            <div className="flex gap-3 rise" style={{ animationDelay: '80ms' }}>
              <div className="flex-1 bg-[#1a1525] rounded-3xl p-5 border border-[#2a2035]" style={cardShadow}>
                <p className="text-[#7c6f85] text-xs tracking-[0.15em] uppercase mb-2">Planes</p>
                <p className="text-[#f5f0eb] text-4xl" style={{ fontFamily: 'serif' }}>{totalPlans}</p>
              </div>
              <div className="flex-1 bg-[#1a1525] rounded-3xl p-5 border border-[#2a2035]" style={cardShadow}>
                <p className="text-[#7c6f85] text-xs tracking-[0.15em] uppercase mb-2">Pendientes</p>
                <p className="text-[#f5f0eb] text-4xl" style={{ fontFamily: 'serif' }}>{pendingPlans}</p>
              </div>
            </div>
          </>
        ) : (
          <button
            className="bg-[#1a1525] rounded-3xl p-6 border border-[#2a2035] flex flex-col items-center"
            style={cardShadow}
            onClick={() => navigate('/profile')}
          >
            <Heart size={28} color="#3d2e50" />
            <p className="text-[#f5f0eb] text-base mt-3" style={{ fontFamily: 'serif' }}>
              ¿Cuándo empezaron?
            </p>
            <p className="text-[#5a4f65] text-xs mt-1 text-center">
              Agrega la fecha en tu perfil para ver los días juntos.
            </p>
          </button>
        )}

        {/* Próximos planes */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-[#f5f0eb] text-lg" style={{ fontFamily: 'serif' }}>
            Próximos planes
          </p>
          <Link to="/plans" className="text-[#c084a8] text-xs tracking-wide">
            Ver todos
          </Link>
        </div>

        {upcomingPlans.length === 0 ? (
          <div
            className="bg-[#1a1525] rounded-3xl p-8 flex flex-col items-center border border-[#2a2035]"
            style={cardShadow}
          >
            <Calendar size={36} color="#2e2040" />
            <p className="text-[#5a4f65] text-center mt-3 text-sm">Sin planes pendientes.</p>
            <Link
              to="/plans/new"
              className="rounded-2xl px-5 py-3 mt-4 text-[#0e0b14] text-sm font-medium"
              style={{ backgroundColor: '#c084a8', ...accentShadow }}
            >
              Crear plan
            </Link>
          </div>
        ) : (
          upcomingPlans.map((item, i) => (
            <button
              key={item.id}
              className="bg-[#1a1525] rounded-3xl overflow-hidden border border-[#2a2035] flex text-left w-full rise tappable"
              style={{ ...cardShadow, animationDelay: `${160 + i * 60}ms` }}
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
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center pop tappable"
        style={{ backgroundColor: '#c084a8', boxShadow: '0 4px 20px rgba(192,132,168,0.4)', right: 'calc(max(50vw - 215px, 0px) + 16px)' }}
        aria-label="Nuevo plan"
      >
        <Plus size={28} color="#0e0b14" />
      </Link>
    </div>
  )
}
