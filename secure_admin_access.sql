-- 1. Reativar RLS nas tabelas sensíveis
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_settings ENABLE ROW LEVEL SECURITY;

-- 2. Remover permissões públicas excessivas (anon)
DROP POLICY IF EXISTS "Allow anonymous select" ON leads;
DROP POLICY IF EXISTS "Allow anonymous read settings" ON funnel_settings;

-- 3. Criar políticas restritivas

-- Para LEADS: 
-- Anon pode APENAS inserir (criar leads pelo funil)
-- Authenticated (Admin) pode fazer TUDO (Select, Update, Delete)

CREATE POLICY "Public Insert Only" ON leads
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Admin Full Access Leads" ON leads
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Para SETTINGS:
-- Anon pode APENAS ler a configuração atual (para saber a próxima posição no funil)
-- Authenticated (Admin) pode fazer TUDO

CREATE POLICY "Public Read Settings" ON funnel_settings
FOR SELECT TO anon
USING (true);

CREATE POLICY "Admin Full Access Settings" ON funnel_settings
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Storage (KYC):
-- Manter acesso público de upload, mas leitura restrita se desejar (ou deixar público para facilitar visualização no dashboard)
-- Vou manter público para leitura no dashboard por enquanto, pois o admin usa o cliente autenticado mas a URL é pública.
-- Se quiséssemos fechar, usaríamos createSignedUrl no admin.js.