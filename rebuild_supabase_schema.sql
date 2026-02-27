-- 1. LIMPEZA TOTAL (CUIDADO: APAGA DADOS EXISTENTES)
-- Removemos as tabelas e o bucket para recomeçar do zero e evitar conflitos de schema cache
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.funnel_settings CASCADE;

-- 2. CRIAÇÃO DA TABELA LEADS (SCHEMA NOVO E LIMPO)
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT,
  email TEXT,
  whatsapp TEXT,
  country TEXT,
  status TEXT DEFAULT 'started',
  plan TEXT,
  passport_url TEXT,
  selfie_url TEXT,
  assigned_position INTEGER,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT
);

-- 3. CRIAÇÃO DA TABELA SETTINGS
CREATE TABLE public.funnel_settings (
    id text PRIMARY KEY,
    next_position_12_months integer DEFAULT 7,
    next_position_24_months integer DEFAULT 15,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.funnel_settings (id, next_position_12_months, next_position_24_months)
VALUES ('current', 7, 15);

-- 4. HABILITAR RLS E CRIAR POLÍTICAS PERMISSIVAS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perm_leads_insert" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "perm_leads_update" ON public.leads FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "perm_leads_select" ON public.leads FOR SELECT TO anon USING (true);
CREATE POLICY "perm_settings_select" ON public.funnel_settings FOR SELECT TO anon USING (true);

-- 5. CONFIGURAÇÃO DO STORAGE (BUCKET E POLÍTICAS)
-- Primeiro garantimos que o bucket existe e aceita QUALQUER arquivo (NULL mime types)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('kyc-documents', 'kyc-documents', true, NULL)
ON CONFLICT (id) DO UPDATE SET allowed_mime_types = NULL, public = true;

-- Políticas de Storage
DROP POLICY IF EXISTS "storage_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_policy" ON storage.objects;

CREATE POLICY "storage_insert_policy" ON storage.objects 
  FOR INSERT TO anon WITH CHECK (bucket_id = 'kyc-documents');
CREATE POLICY "storage_select_policy" ON storage.objects 
  FOR SELECT TO anon USING (bucket_id = 'kyc-documents');

-- 6. FORÇAR RECARREGAMENTO DO CACHE DA API
NOTIFY pgrst, 'reload schema';
