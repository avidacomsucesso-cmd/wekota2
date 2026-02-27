-- Create the leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT,
  email TEXT,
  whatsapp TEXT,
  country TEXT,
  status TEXT DEFAULT 'started'::text,
  plan TEXT,
  passport_url TEXT,
  selfie_url TEXT,
  assigned_position NUMERIC,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT
);

-- Enable Row Level Security (RLS) on the leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert new leads
CREATE POLICY "Allow anonymous insert" ON public.leads
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Create policy to allow anonymous users to select their own leads (based on ID if needed, or open for now for the flow)
-- For this simple funnel flow without auth, we might need to be permissive for updates based on ID
CREATE POLICY "Allow anonymous update based on ID" ON public.leads
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policy to allow anonymous select (so we can return the ID after insert)
CREATE POLICY "Allow anonymous select" ON public.leads
  FOR SELECT
  TO anon
  USING (true);

-- Create the storage bucket for KYC documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow anonymous uploads
CREATE POLICY "Allow anonymous uploads" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'kyc-documents');

-- Create storage policy to allow public access to view (optional, depending on security needs, but helpful for debugging)
CREATE POLICY "Allow public view" ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'kyc-documents');

-- Create settings table
CREATE TABLE IF NOT EXISTS public.funnel_settings (
    id text PRIMARY KEY,
    next_position_12_months integer DEFAULT 7,
    next_position_24_months integer DEFAULT 15,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert default settings
INSERT INTO public.funnel_settings (id, next_position_12_months, next_position_24_months)
VALUES ('current', 7, 15)
ON CONFLICT (id) DO NOTHING;

-- Allow read access to settings
ALTER TABLE public.funnel_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read settings" ON public.funnel_settings
FOR SELECT TO anon USING (true);
