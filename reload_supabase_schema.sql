-- 1. Forçar a atualização do cache do schema para que o PostgREST reconheça as novas colunas
NOTIFY pgrst, 'reload schema';

-- 2. Garantir que as colunas essenciais existem (caso o script anterior não tenha sido executado por erro de cache)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='name') THEN
        ALTER TABLE public.leads ADD COLUMN name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='email') THEN
        ALTER TABLE public.leads ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='whatsapp') THEN
        ALTER TABLE public.leads ADD COLUMN whatsapp TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='country') THEN
        ALTER TABLE public.leads ADD COLUMN country TEXT;
    END IF;
END $$;

-- 3. Resetar as permissões para garantir que funcionem com o novo schema
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.leads;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.leads FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON public.leads FOR SELECT TO anon USING (true);
