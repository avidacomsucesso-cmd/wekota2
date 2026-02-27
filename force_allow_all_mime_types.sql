-- 1. Remover o bucket se ele estiver com configurações erradas (CUIDADO: isso apaga arquivos dentro dele, use apenas se estiver configurando agora)
-- Se preferir não apagar, pule para o passo 2
-- DELETE FROM storage.buckets WHERE id = 'kyc-documents';

-- 2. Recriar ou atualizar o bucket com permissão total de tipos (NULL em allowed_mime_types significa todos os tipos)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('kyc-documents', 'kyc-documents', true, NULL)
ON CONFLICT (id) DO UPDATE 
SET allowed_mime_types = NULL, public = true;

-- 3. Garantir as políticas de INSERT e SELECT para usuários anônimos
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;

CREATE POLICY "Allow anonymous uploads" ON storage.objects
  FOR INSERT 
  TO anon 
  WITH CHECK (bucket_id = 'kyc-documents');

CREATE POLICY "Allow public view" ON storage.objects
  FOR SELECT 
  TO anon 
  USING (bucket_id = 'kyc-documents');
