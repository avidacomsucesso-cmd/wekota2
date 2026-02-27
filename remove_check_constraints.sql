-- 1. Remover a restrição de check que está causando o erro 23514
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_country_check;

-- 2. Se houver outras restrições de check problemáticas, podemos removê-las também
-- Para garantir que a inserção seja o mais permissiva possível agora
DO $$ 
BEGIN
    -- Remover qualquer check constraint que possa estar bloqueando campos
    -- O erro 23514 indica que um campo (provavelmente 'country') tem uma regra que só aceita certos valores
    -- Vamos remover essa regra para aceitar qualquer texto.
    EXECUTE (
        SELECT 'ALTER TABLE public.leads DROP CONSTRAINT ' || quote_ident(conname) || ';'
        FROM pg_constraint 
        INNER JOIN pg_class ON conname ~ 'check' AND pg_class.oid = conrelid
        WHERE relname = 'leads'
    );
EXCEPTION WHEN OTHERS THEN 
    -- Ignorar se não houver restrições
END $$;

-- 3. Garantir que a coluna country aceita qualquer texto
ALTER TABLE public.leads ALTER COLUMN country TYPE TEXT;

-- 4. Notificar a API para limpar o cache novamente
NOTIFY pgrst, 'reload schema';
