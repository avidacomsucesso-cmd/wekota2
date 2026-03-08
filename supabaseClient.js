import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eczsqgtewtpcscsyvljy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjenNxZ3Rld3RwY3Njc3l2bGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjUxNTAsImV4cCI6MjA4NzU0MTE1MH0.HTXvOSk4Gjbg85YPfmWB59wKD943-wyjFd-iWeF9BUk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)