# PROMPT PARA DYAD — Base de Dados WEKOTA no Supabase

## Contexto do Projeto

A WEKOTA é uma plataforma europeia de aquisição coletiva programada (PACP) de produtos tecnológicos. Funciona assim: grupos fechados de 12 ou 24 pessoas pagam prestações mensais fixas e recebem o produto (ex: iPhone) no mês correspondente à sua posição no grupo. Não é crédito, não é sorteio — é compra coletiva com ordem de entrega contratual pré-definida.

**Entidade:** WEKOTA UAB (Lituânia, UE)
**Mercados:** Portugal e Espanha
**Público:** imigrantes sem acesso fácil a crédito bancário

O projeto já tem conta Supabase integrada. Preciso que cries TODAS as tabelas, relações, enums, RLS policies e funções necessárias para operar a plataforma.

---

## Modelo de Negócio — Regras Fundamentais

1. **Grupos:** 12 ou 24 membros. Grupo de 12 = 12 meses. Grupo de 24 = 24 meses.
2. **Posição:** atribuída pela WEKOTA (não escolhida pelo membro). O membro é informado antes de pagar e pode aceitar ou recusar.
3. **Prestação:** fixa = (preço_produto × 1.25) ÷ número_meses. A taxa de serviço é 25%.
4. **Reserva de propriedade:** o produto pertence à WEKOTA até a última prestação ser paga.
5. **Garantia de produto atualizado:** nos grupos de 24 meses, o membro recebe sempre o modelo mais recente equivalente na data de entrega.
6. **Fundo de reserva:** 2% do valor do produto por membro, parcialmente devolvido no final do ciclo.
7. **Pagamentos:** processados via Stripe (conta jurídica WEKOTA já ativa). As chaves API (publishable e secret) devem ser configuradas como variáveis de ambiente no Supabase/projeto — NUNCA hardcoded no código.
8. **KYC:** verificação de passaporte + selfie obrigatória antes da adesão.
9. **Funil:** o site captura leads em várias etapas — precisamos rastrear onde cada pessoa abandona.
10. **Ciclo de vida do grupo:** formação → preenchimento → ativo → concluído (ou cancelado).

---

## Tabelas Necessárias

### 1. `products` — Catálogo de produtos disponíveis
```
- id (uuid, PK)
- name (text, not null) — ex: "iPhone 17 Pro Max 256GB"
- brand (text) — ex: "Apple", "Samsung"
- category (text) — ex: "smartphone", "tablet", "laptop"
- base_price_cents (integer, not null) — preço de mercado em cêntimos (ex: 153600 = €1.536,00)
- image_url (text, nullable)
- specs (jsonb, nullable) — armazenamento, cor, etc.
- is_active (boolean, default true)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

### 2. `groups` — Grupos PACP
```
- id (uuid, PK)
- product_id (uuid, FK → products.id, not null)
- duration_months (integer, not null, check: 12 ou 24)
- total_positions (integer, not null) — igual a duration_months
- filled_positions (integer, default 0)
- installment_amount_cents (integer, not null) — valor da prestação mensal em cêntimos
- total_amount_cents (integer, not null) — total por membro (preço × 1.25)
- service_fee_cents (integer, not null) — 25% do preço do produto
- status (enum group_status: 'forming', 'filling', 'active', 'completed', 'cancelled')
- start_date (date, nullable) — data de início quando grupo fica completo
- end_date (date, nullable)
- has_upgrade_guarantee (boolean, default false) — true para grupos de 24 meses
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

### 3. `leads` — Pessoas que entraram no funil (ainda não são membros)
```
- id (uuid, PK)
- full_name (text, nullable)
- email (text, nullable)
- phone (text, nullable)
- country (text, nullable, check: 'PT' ou 'ES')
- utm_source (text, nullable)
- utm_medium (text, nullable)
- utm_campaign (text, nullable)
- referral_code (text, nullable)
- funnel_step (enum funnel_step: 'landing', 'split_screen', 'step1_data', 'step2_product', 'step3_kyc', 'step4_position', 'step5_payment', 'completed', 'doubt_screen')
- funnel_completed (boolean, default false)
- dropped_at_step (enum funnel_step, nullable) — em que passo abandonou
- doubt_channel (text, nullable) — 'whatsapp', 'email', 'faq', null
- product_interest_id (uuid, FK → products.id, nullable)
- duration_interest (integer, nullable) — 12 ou 24
- ip_address (inet, nullable)
- user_agent (text, nullable)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- converted_at (timestamptz, nullable) — quando virou membro
- member_id (uuid, FK → members.id, nullable) — link se converteu
```

### 4. `members` — Membros que aderiram a um grupo
```
- id (uuid, PK)
- lead_id (uuid, FK → leads.id, nullable)
- auth_user_id (uuid, FK → auth.users.id, nullable) — Supabase Auth
- full_name (text, not null)
- email (text, not null, unique)
- phone (text, not null)
- country (text, not null, check: 'PT' ou 'ES')
- nationality (text, nullable)
- date_of_birth (date, nullable)
- passport_number (text, nullable)
- delivery_address (jsonb, nullable) — {street, city, postal_code, country}
- nif_nie (text, nullable) — opcional
- kyc_status (enum kyc_status: 'pending', 'submitted', 'verified', 'rejected', 'expired')
- kyc_provider_ref (text, nullable) — referência externa do prestador KYC
- kyc_verified_at (timestamptz, nullable)
- stripe_customer_id (text, nullable) — Stripe Customer ID (cus_xxx)
- status (enum member_status: 'pending_kyc', 'pending_position', 'pending_acceptance', 'active', 'suspended', 'excluded', 'completed', 'voluntarily_left')
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

### 5. `group_memberships` — Relação membro ↔ grupo (um membro pode estar em múltiplos grupos ao longo do tempo)
```
- id (uuid, PK)
- member_id (uuid, FK → members.id, not null)
- group_id (uuid, FK → groups.id, not null)
- position (integer, not null) — posição atribuída (1 a 12 ou 1 a 24)
- position_accepted (boolean, nullable) — null = pendente, true = aceite, false = recusado
- position_accepted_at (timestamptz, nullable)
- contract_signed (boolean, default false)
- contract_signed_at (timestamptz, nullable)
- contract_document_url (text, nullable)
- delivery_month (integer, not null) — mês em que recebe o produto (= position)
- delivery_status (enum delivery_status: 'pending', 'ordered', 'shipped', 'delivered', 'returned')
- delivered_product_name (text, nullable) — produto efetivamente entregue (pode diferir se upgrade)
- delivered_at (timestamptz, nullable)
- tracking_code (text, nullable)
- ownership_transferred (boolean, default false) — true quando última prestação paga
- ownership_transferred_at (timestamptz, nullable)
- reserve_fund_contribution_cents (integer, not null) — 2% do produto
- reserve_fund_returned_cents (integer, default 0)
- stripe_subscription_id (text, nullable) — Stripe Subscription ID (sub_xxx) para cobrança recorrente
- status (enum membership_status: 'pending_acceptance', 'active', 'suspended', 'excluded', 'completed', 'voluntarily_left', 'replaced')
- exit_reason (text, nullable)
- replaced_by_membership_id (uuid, FK → group_memberships.id, nullable)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- UNIQUE(group_id, position)
- UNIQUE(group_id, member_id)
```

### 6. `payments` — Registo de cada prestação mensal
```
- id (uuid, PK)
- membership_id (uuid, FK → group_memberships.id, not null)
- member_id (uuid, FK → members.id, not null) — desnormalizado para queries rápidas
- group_id (uuid, FK → groups.id, not null) — desnormalizado
- installment_number (integer, not null) — 1 a 12 ou 1 a 24
- amount_cents (integer, not null)
- due_date (date, not null)
- paid_at (timestamptz, nullable)
- payment_method (text, nullable) — 'sepa_dd', 'card', 'mbway', 'bizum', 'transfer'
- stripe_payment_intent_id (text, nullable) — Stripe PaymentIntent ID
- stripe_charge_id (text, nullable) — Stripe Charge ID
- status (enum payment_status: 'pending', 'processing', 'paid', 'overdue', 'failed', 'refunded')
- overdue_days (integer, default 0)
- penalty_amount_cents (integer, default 0)
- notes (text, nullable)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- UNIQUE(membership_id, installment_number)
```

### 7. `funnel_events` — Tracking granular do funil (analytics)
```
- id (uuid, PK)
- lead_id (uuid, FK → leads.id, nullable)
- session_id (text, nullable) — ID de sessão do browser
- event_type (text, not null) — 'page_view', 'cta_click', 'step_enter', 'step_complete', 'step_abandon', 'doubt_click', 'whatsapp_click', 'faq_open', 'form_error'
- event_data (jsonb, nullable) — dados adicionais do evento
- funnel_step (enum funnel_step, nullable)
- source_url (text, nullable)
- device_type (text, nullable) — 'mobile', 'desktop', 'tablet'
- created_at (timestamptz, default now())
```

### 8. `communications` — Log de comunicações com leads/membros
```
- id (uuid, PK)
- lead_id (uuid, FK → leads.id, nullable)
- member_id (uuid, FK → members.id, nullable)
- channel (text, not null) — 'whatsapp', 'email', 'sms', 'push'
- direction (text, not null) — 'inbound', 'outbound'
- type (text, not null) — 'doubt', 'payment_reminder', 'delivery_notification', 'group_update', 'welcome', 'contract', 'marketing'
- subject (text, nullable)
- content_preview (text, nullable) — primeiros 200 chars
- status (text) — 'sent', 'delivered', 'read', 'failed', 'pending'
- external_ref (text, nullable) — ID do Twilio, SendGrid, etc.
- created_at (timestamptz, default now())
```

### 9. `refunds` — Reembolsos (saída voluntária, exclusão, cancelamento de grupo)
```
- id (uuid, PK)
- membership_id (uuid, FK → group_memberships.id, not null)
- member_id (uuid, FK → members.id, not null)
- reason (text, not null) — 'voluntary_exit_before_delivery', 'voluntary_exit_after_delivery', 'exclusion', 'group_cancelled', 'cooling_off_14_days'
- total_paid_cents (integer, not null)
- service_fee_deducted_cents (integer, not null)
- depreciation_deducted_cents (integer, default 0)
- refund_amount_cents (integer, not null)
- status (enum refund_status: 'calculating', 'pending_approval', 'approved', 'processing', 'completed', 'rejected')
- stripe_refund_id (text, nullable) — Stripe Refund ID
- processed_at (timestamptz, nullable)
- notes (text, nullable)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

### 10. `admin_audit_log` — Log de ações administrativas (compliance)
```
- id (uuid, PK)
- admin_user_id (uuid, nullable)
- action (text, not null) — 'assign_position', 'exclude_member', 'approve_refund', 'start_group', 'cancel_group', 'override_payment', etc.
- entity_type (text, not null) — 'member', 'group', 'payment', 'membership', etc.
- entity_id (uuid, not null)
- old_data (jsonb, nullable)
- new_data (jsonb, nullable)
- ip_address (inet, nullable)
- created_at (timestamptz, default now())
```

---

## Enums a Criar

```sql
CREATE TYPE group_status AS ENUM ('forming', 'filling', 'active', 'completed', 'cancelled');
CREATE TYPE funnel_step AS ENUM ('landing', 'split_screen', 'step1_data', 'step2_product', 'step3_kyc', 'step4_position', 'step5_payment', 'completed', 'doubt_screen');
CREATE TYPE kyc_status AS ENUM ('pending', 'submitted', 'verified', 'rejected', 'expired');
CREATE TYPE member_status AS ENUM ('pending_kyc', 'pending_position', 'pending_acceptance', 'active', 'suspended', 'excluded', 'completed', 'voluntarily_left');
CREATE TYPE membership_status AS ENUM ('pending_acceptance', 'active', 'suspended', 'excluded', 'completed', 'voluntarily_left', 'replaced');
CREATE TYPE delivery_status AS ENUM ('pending', 'ordered', 'shipped', 'delivered', 'returned');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'overdue', 'failed', 'refunded');
CREATE TYPE refund_status AS ENUM ('calculating', 'pending_approval', 'approved', 'processing', 'completed', 'rejected');
```

---

## Índices Recomendados

```sql
-- Queries mais frequentes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_funnel_step ON leads(funnel_step);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_not_converted ON leads(funnel_completed) WHERE funnel_completed = false;

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_country ON members(country);

CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_product ON groups(product_id);

CREATE INDEX idx_memberships_member ON group_memberships(member_id);
CREATE INDEX idx_memberships_group ON group_memberships(group_id);
CREATE INDEX idx_memberships_status ON group_memberships(status);

CREATE INDEX idx_payments_membership ON payments(membership_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due ON payments(due_date) WHERE status IN ('pending', 'overdue');
CREATE INDEX idx_payments_overdue ON payments(overdue_days) WHERE overdue_days > 0;

CREATE INDEX idx_funnel_events_lead ON funnel_events(lead_id);
CREATE INDEX idx_funnel_events_created ON funnel_events(created_at DESC);
CREATE INDEX idx_funnel_events_type ON funnel_events(event_type);

CREATE INDEX idx_comms_member ON communications(member_id);
CREATE INDEX idx_comms_lead ON communications(lead_id);
```

---

## Row Level Security (RLS)

Ativa RLS em TODAS as tabelas. Políticas base:

1. **Tabelas públicas de leitura** (products): `SELECT` para `anon` e `authenticated`.
2. **Leads e funnel_events**: `INSERT` para `anon` (o site cria leads sem autenticação). `SELECT/UPDATE` apenas para `service_role` (admin).
3. **Members**: `SELECT` e `UPDATE` do próprio registo para `authenticated` (onde `auth.uid() = auth_user_id`). Full CRUD para `service_role`.
4. **Group_memberships**: `SELECT` do próprio registo para `authenticated`. Full CRUD para `service_role`.
5. **Payments**: `SELECT` dos próprios pagamentos para `authenticated`. Full CRUD para `service_role`.
6. **Groups**: `SELECT` para `authenticated` (ver estado do grupo). Full CRUD para `service_role`.
7. **Communications**: `SELECT` das próprias comunicações para `authenticated`. Full CRUD para `service_role`.
8. **Refunds, admin_audit_log**: apenas `service_role`.

---

## Funções SQL Úteis

### Calcular prestação mensal
```sql
CREATE OR REPLACE FUNCTION calculate_installment(product_price_cents integer, duration integer)
RETURNS integer AS $$
  SELECT CEIL((product_price_cents * 1.25) / duration)::integer;
$$ LANGUAGE sql IMMUTABLE;
```

### Atualizar filled_positions automaticamente
```sql
-- Trigger: quando um group_membership é criado com status 'active', incrementar filled_positions no grupo
-- Trigger: quando um group_membership muda para 'excluded'/'voluntarily_left'/'replaced', decrementar
```

### Verificar se grupo está completo e ativar
```sql
-- Trigger/function: quando filled_positions = total_positions, mudar status para 'active' e definir start_date
```

### Marcar pagamentos como overdue
```sql
-- Scheduled function (cron via pg_cron ou Supabase Edge Function):
-- Todos os dias, verificar payments com status 'pending' e due_date < hoje, atualizar para 'overdue' e calcular overdue_days
```

### Transferir propriedade automaticamente
```sql
-- Trigger: quando o último payment de um membership é marcado como 'paid', marcar ownership_transferred = true
```

---

## Dados Iniciais (Seed)

Insere estes produtos iniciais:

```sql
INSERT INTO products (name, brand, category, base_price_cents) VALUES
  ('iPhone 17 Pro Max 256GB', 'Apple', 'smartphone', 153600),
  ('iPhone 17 Pro Max 512GB', 'Apple', 'smartphone', 178600),
  ('iPhone 17 Pro 256GB', 'Apple', 'smartphone', 133600),
  ('Samsung Galaxy S25 Ultra 256GB', 'Samsung', 'smartphone', 139900),
  ('Samsung Galaxy S25 Ultra 512GB', 'Samsung', 'smartphone', 159900),
  ('MacBook Air M4 256GB', 'Apple', 'laptop', 129900),
  ('iPad Pro M4 11" 256GB', 'Apple', 'tablet', 119900);
```

---

## Notas Importantes para o Dyad

1. **Usar cêntimos (integer), nunca float/decimal para valores monetários.** €80,00 = 8000 cêntimos.
2. **Todas as tabelas precisam de `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`.**
3. **Todos os timestamps devem ser `timestamptz DEFAULT now()`.**
4. **Ativar RLS em TODAS as tabelas com `ALTER TABLE x ENABLE ROW LEVEL SECURITY`.**
5. **Criar as tabelas na ordem certa para respeitar FKs:** products → groups → leads → members → group_memberships → payments → funnel_events → communications → refunds → admin_audit_log.
6. **Não esquecer os triggers de `updated_at`:** criar um trigger genérico que atualiza `updated_at = now()` em cada UPDATE.
7. **Os enums devem ser criados ANTES das tabelas.**
8. **Adicionar comentários nas tabelas e colunas para documentação.**

### Integração Stripe

A WEKOTA já tem conta Stripe ativa com chaves API. Configuração necessária:

- **Variáveis de ambiente (NÃO hardcoded):**
  - `STRIPE_PUBLISHABLE_KEY` — chave pública (pk_live_...)
  - `STRIPE_SECRET_KEY` — chave secreta (sk_live_...)
- **Quando um membro adere:** criar um Stripe Customer e guardar o `stripe_customer_id` no registo `members`.
- **Prestações mensais:** usar Stripe Subscriptions com `billing_cycle_anchor` ou criar PaymentIntents individuais via scheduled function. A abordagem de Subscriptions é recomendada para débito automático (SEPA/cartão).
- **SEPA Direct Debit:** ativar no Stripe Dashboard. Stripe suporta SEPA DD nativamente para a zona euro — ideal para Portugal/Espanha.
- **Webhooks Stripe:** configurar webhooks no Supabase (Edge Function) para receber eventos como `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` e atualizar automaticamente a tabela `payments`.
- **Reembolsos:** processar via Stripe Refunds API e guardar `stripe_refund_id`.

Executa tudo como migrations SQL no Supabase. Após criar, confirma que:
- Todas as tabelas existem
- Todos os enums estão criados
- RLS está ativo em todas as tabelas
- Os índices foram criados
- Os dados seed foram inseridos
- As funções SQL estão operacionais
