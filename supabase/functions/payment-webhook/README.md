# Configuração da Edge Function de Pagamentos e Contratos (payment-webhook)

Esta pasta contém o código da Supabase Edge Function responsável por:
1. Receber o Webhook de sucesso de pagamento (ex: Stripe).
2. Gerar o contrato dinâmico (DOCX) em memória.
3. Enviar o email de boas-vindas com o contrato em anexo.
4. Atualizar o estado da subscrição na base de dados.

## Como fazer Deploy (Implantar) no seu Projeto Supabase

Se tiver o Supabase CLI instalado na sua máquina, execute os seguintes passos no terminal (na raiz do projeto):

### 1. Fazer Login no Supabase CLI
```bash
supabase login
```

### 2. Iniciar o Projeto Local (se ainda não o fez)
```bash
supabase init
```

### 3. Fazer Link ao seu Projeto na Cloud
Substitua `<ref-do-projeto>` pela referência do seu projeto (encontra-se no URL do seu dashboard: `https://supabase.com/dashboard/project/<ref-do-projeto>`).
```bash
supabase link --project-ref <ref-do-projeto>
```

### 4. Configurar a Chave da API do Resend (Variável de Ambiente)
Vai precisar de uma chave de API do [Resend](https://resend.com/) para o envio de e-mails. Defina o remetente oficial (ex: `suporte@wekota.eu`) na dashboard do Resend.
```bash
supabase secrets set RESEND_API_KEY="re_sua_chave_aqui"
```

### 5. Fazer o Deploy da Função
Isto enviará o código contido em `supabase/functions/payment-webhook` para a nuvem.
```bash
supabase functions deploy payment-webhook --no-verify-jwt
```
> *Nota: Utilizamos `--no-verify-jwt` porque o Stripe/Gateway não envia um token de utilizador Supabase, pelo que a função precisa de estar publicamente acessível para receber a notificação, dependendo depois de chaves secretas do próprio webhook para validar a origem.*

---

## Como configurar o Webhook no Parceiro de Pagamentos (Ex: Stripe)
1. Vá à dashboard do Stripe > Developers > Webhooks.
2. Adicione um "Endpoint" apontando para o URL gerado da sua função:
   `https://<ref-do-projeto>.supabase.co/functions/v1/payment-webhook`
3. Selecione o evento: `checkout.session.completed`
4. **Importante:** Quando iniciar a sessão de checkout no seu código frontend/backend, deve passar o ID do lead nos metadados ou na referência:
   ```javascript
   // Exemplo de criação de sessão
   const session = await stripe.checkout.sessions.create({
     // ...
     client_reference_id: leadId,
     metadata: { lead_id: leadId }
   });
   ```