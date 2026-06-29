import { useCallback, useEffect, useState } from 'react'
import { Heart, Calendar, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const cardShadow = { boxShadow: '0 4px 12px rgba(14,11,20,0.4)' }
const accentShadow = { boxShadow: '0 4px 20px rgba(192,132,168,0.15)' }

type Profile = {
  id: string
  name: string | null
  invite_code: string
  partner_id: string | null
  relationship_start: string | null
  partner: { name: string | null } | null
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('id, name, invite_code, partner_id, relationship_start, partner:partner_id(name)')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data as unknown as Profile)
    setLoading(false)
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  async function handleRedeem() {
    if (!code.trim()) return
    setRedeeming(true)
    setRedeemError(null)
    const { error } = await supabase.rpc('redeem_invite', { code })
    if (error) setRedeemError(error.message)
    else { setCode(''); await loadProfile() }
    setRedeeming(false)
  }

  async function handleRelationshipDate(e: React.ChangeEvent<HTMLInputElement>) {
    if (!profile) return
    const iso = e.target.value
    const { error } = await supabase
      .from('profiles')
      .update({ relationship_start: iso || null })
      .eq('id', profile.id)
    if (!error) setProfile({ ...profile, relationship_start: iso || null })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0e0b14] min-h-[calc(100dvh-56px)]">
        <div className="w-6 h-6 rounded-full border-2 border-[#c084a8] border-t-transparent animate-spin" />
      </div>
    )
  }

  const hasPartner = !!profile?.partner_id
  const firstName = profile?.name?.split(' ')[0] ?? 'Tú'

  const relationshipDateValue = profile?.relationship_start
    ? profile.relationship_start.split('T')[0]
    : ''

  const relationshipDateDisplay = profile?.relationship_start
    ? new Date(profile.relationship_start).toLocaleDateString('es', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col bg-[#0e0b14] pb-4">
      {/* Hero */}
      <div
        className="bg-[#160f22] rounded-b-[28px] px-5 pb-7 flex flex-col items-center"
        style={{ paddingTop: '3rem', ...accentShadow }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3 border border-[#3d2e50]"
          style={{ backgroundColor: '#251b36' }}
        >
          <span className="text-4xl" style={{ fontFamily: 'serif', color: '#c084a8' }}>
            {firstName[0] ?? '?'}
          </span>
        </div>
        <p className="text-[#f5f0eb] text-2xl" style={{ fontFamily: 'serif' }}>{firstName}</p>
        <p className="text-[#7c6f85] text-xs tracking-widest mt-1">
          {hasPartner ? 'conectados' : 'sin pareja aún'}
        </p>
      </div>

      <div className="flex flex-col px-5 pt-5 gap-3">
        {/* Fecha de inicio */}
        <div className="bg-[#1a1525] rounded-2xl p-5 border border-[#2a2035]" style={cardShadow}>
          <p className="text-[#7c6f85] text-xs tracking-widest uppercase mb-3">Juntos desde</p>
          <div className="flex items-center justify-between">
            <p
              className="text-lg"
              style={{ fontFamily: 'serif', color: relationshipDateDisplay ? '#f5f0eb' : '#3d2e50' }}
            >
              {relationshipDateDisplay ?? 'Agregar fecha'}
            </p>
            <label className="cursor-pointer">
              <Calendar size={18} color={relationshipDateDisplay ? '#c084a8' : '#3d2e50'} />
              <input
                type="date"
                className="sr-only"
                value={relationshipDateValue}
                max={new Date().toISOString().split('T')[0]}
                onChange={handleRelationshipDate}
              />
            </label>
          </div>
        </div>

        {/* Pareja */}
        {hasPartner ? (
          <div
            className="bg-[#1a1525] rounded-2xl p-5 border border-[#2a2035] flex items-center gap-3"
            style={cardShadow}
          >
            <Heart size={16} fill="#c084a8" color="#c084a8" />
            <div>
              <p className="text-[#7c6f85] text-xs mb-0.5">Conectado con</p>
              <p className="text-[#f5f0eb] text-lg" style={{ fontFamily: 'serif' }}>
                {profile?.partner?.name?.split(' ')[0] ?? 'tu pareja'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Código propio */}
            <div
              className="bg-[#1a1525] rounded-2xl p-5 border border-[#2a2035] flex flex-col items-center"
              style={cardShadow}
            >
              <p className="text-[#7c6f85] text-xs tracking-widest uppercase mb-3">Tu código</p>
              <div className="flex gap-2">
                {(profile?.invite_code ?? '').split('').map((char, i) => (
                  <div
                    key={i}
                    className="w-10 h-12 rounded-xl flex items-center justify-center border border-[#3d2e50]"
                    style={{ backgroundColor: '#251b36' }}
                  >
                    <span className="text-[#c084a8] text-xl" style={{ fontFamily: 'serif' }}>
                      {char}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[#5a4f65] text-xs mt-3 text-center">
                Compártelo con tu pareja para conectarse.
              </p>
            </div>

            {/* Ingresar código */}
            <div
              className="bg-[#1a1525] rounded-2xl p-5 border border-[#2a2035] flex flex-col gap-3"
              style={cardShadow}
            >
              <p className="text-[#7c6f85] text-xs tracking-widest uppercase">
                ¿Tienes el código de tu pareja?
              </p>
              {redeemError && <p className="text-red-400 text-xs">{redeemError}</p>}
              <input
                className="border border-[#2a2035] rounded-xl px-4 h-12 text-base text-[#f5f0eb] tracking-[4px] outline-none focus:border-[#c084a8] transition-colors w-full"
                style={{ backgroundColor: '#120e1c' }}
                placeholder="código"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect="off"
              />
              <button
                className="rounded-xl py-3 font-semibold text-base transition-all disabled:opacity-60"
                style={{
                  backgroundColor: code.trim() && !redeeming ? '#c084a8' : '#3d2e40',
                  color: code.trim() && !redeeming ? '#0e0b14' : '#5a4f65',
                }}
                onClick={handleRedeem}
                disabled={!code.trim() || redeeming}
              >
                {redeeming ? 'Conectando...' : 'Conectar'}
              </button>
            </div>
          </>
        )}

        {/* Sign out */}
        <button
          className="rounded-xl py-4 flex items-center justify-center gap-2 border border-[#2a2035] mt-2"
          style={{ backgroundColor: '#1a1525' }}
          onClick={handleSignOut}
        >
          <LogOut size={15} color="#8b3a3a" />
          <span className="text-[#8b3a3a] text-sm">Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
