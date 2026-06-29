import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ihqgpmrigbjcxmuhnrmu.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlocWdwbXJpZ2JqY3htdWhucm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzgyODMsImV4cCI6MjA5ODI1NDI4M30.PC0tYDk9zyYggudk8bT32GzoKMNiULJz6ckjdoc6Ow0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
