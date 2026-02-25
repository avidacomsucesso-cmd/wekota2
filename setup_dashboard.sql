
-- SQL para criar a estrutura avançada de grupos e posições
-- Execute isso no SQL Editor do seu Supabase

-- 1. Tabela de Configuração Global do Funil
CREATE TABLE IF NOT EXISTS funnel_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    next_position_12_months INT DEFAULT 7,
    next_position_24_months INT DEFAULT 15,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inserir valor inicial
INSERT INTO funnel_settings (id, next_position_12_months, next_position_24_months)
VALUES ('current', 7, 15)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabela de Grupos
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Ex: "Grupo #101"
    duration_months INT NOT NULL, -- 12 ou 24
    status TEXT DEFAULT 'active', -- active, full, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Atualizar a tabela de Leads para vincular a Grupos e Pagamentos
ALTER TABLE leads ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_position INT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'; -- pending, up_to_date, late
ALTER TABLE leads ADD COLUMN IF NOT EXISTS passport_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS selfie_url TEXT;

-- 4. Tabela de Parcelas (Pagamentos Mensais)
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    month_number INT NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
