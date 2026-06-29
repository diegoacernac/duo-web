import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const inputClass =
  'border border-[#2a2035] bg-[#1a1525] rounded-xl px-4 h-12 text-base text-[#f5f0eb] w-full outline-none focus:border-[#c084a8] transition-colors placeholder:text-[#5a4f65]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[#7c6f85] text-xs tracking-wide uppercase">{label}</label>
      {children}
    </div>
  )
}

export default function NewPlan() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [place, setPlace] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { data: plan, error } = await supabase
      .from('plans')
      .insert({
        created_by: user!.id,
        title: title.trim(),
        date: date || null,
        place: place.trim() || null,
        description: description.trim() || null,
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    supabase.functions.invoke('notify-new-plan', { body: { record: plan } })
    navigate('/plans', { replace: true })
  }

  return (
    <div className="flex flex-col bg-[#0e0b14] flex-1 overflow-y-auto page-enter">
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
        <p className="text-[#f5f0eb] text-2xl" style={{ fontFamily: 'serif' }}>
          Nuevo plan
        </p>
      </div>

      <div className="flex flex-col px-5 pt-5 gap-4 pb-10">
        {error && <p className="text-red-400 text-xs">{error}</p>}

        <Field label="Título">
          <input
            className={inputClass}
            placeholder="Cena, viaje, peli..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Fecha (opcional)">
          <div className="relative">
            <input
              type="date"
              className={`${inputClass.replace('h-12', 'py-3.5')} appearance-none min-w-0 block pr-11`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ colorScheme: 'dark', WebkitAppearance: 'none' }}
            />
            <Calendar
              size={18}
              color="#c084a8"
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </Field>

        <Field label="Lugar (opcional)">
          <input
            className={inputClass}
            placeholder="¿Dónde?"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </Field>

        <Field label="Notas (opcional)">
          <textarea
            className="border border-[#2a2035] bg-[#1a1525] rounded-xl px-4 py-3 text-base text-[#f5f0eb] w-full outline-none focus:border-[#c084a8] transition-colors placeholder:text-[#5a4f65] resize-none h-24"
            placeholder="Detalles..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="rounded-xl py-4 mt-2 font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-60"
          style={{
            backgroundColor: title.trim() && !saving ? '#c084a8' : '#3d2e40',
            color: title.trim() && !saving ? '#0e0b14' : '#5a4f65',
            boxShadow: title.trim() && !saving ? '0 4px 20px rgba(192,132,168,0.4)' : 'none',
          }}
        >
          {saving ? 'Guardando...' : 'Guardar plan'}
        </button>
      </div>
    </div>
  )
}
