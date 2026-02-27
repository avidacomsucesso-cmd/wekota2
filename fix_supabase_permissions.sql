-- Fix permissions by dropping existing policies first to avoid conflicts
-- LEADS TABLE
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous update based on ID" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.leads;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to select" ON storage.objects;

-- SETTINGS TABLE
DROP POLICY IF EXISTS "Allow anonymous read settings" ON public.funnel_settings;

-- Now recreate everything cleanly
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.leads
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON public.leads
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select" ON public.leads
  FOR SELECT
  TO anon
  USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow anonymous uploads" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'kyc-documents');

CREATE POLICY "Allow public view" ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'kyc-documents');

-- Settings
ALTER TABLE public.funnel_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read settings" ON public.funnel_settings
FOR SELECT TO anon USING (true);
