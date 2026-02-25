# Configuração de Pagamento via Stripe (Produção)

Para ativar os pagamentos reais no seu site, siga estes passos finais:

## 1. No Painel do Stripe (Dashboard)

1.  Acesse [dashboard.stripe.com](https://dashboard.stripe.com).
2.  Certifique-se de que o seletor **"Test mode"** está **DESATIVADO** (canto superior direito).
3.  **Obtenha a Chave Secreta (Secret Key):**
    *   Vá em **Developers > API keys**.
    *   Copie a **Secret key** (começa com `sk_live_...`).
    *   *Nota: A chave pública `pk_live_...` já foi inserida no site.*
4.  **Crie os Produtos (Planos):**
    *   Vá em **Products > Add product**.
    *   Crie o produto "iPhone 17 Pro Max - 12 Meses" com preço de **€149.00 EUR** (Recurring / Mensal).
    *   Crie o produto "iPhone 17 Pro Max - 24 Meses" com preço de **€75.00 EUR** (Recurring / Mensal).
    *   **CRÍTICO:** Copie o **API ID** de cada preço (ex: `price_1Nk...`).

## 2. No Supabase (Backend)

Você precisa configurar a chave secreta do Stripe nas variáveis de ambiente da sua Edge Function.

1.  No painel do Supabase, vá em **Edge Functions**.
2.  Selecione a função `create-checkout` (se já criada) ou crie uma nova.
3.  Vá em **Settings (ou Secrets)** e adicione:
    *   Nome: `STRIPE_SECRET_KEY`
    *   Valor: `sk_live_sua_chave_secreta_aqui` (a que você copiou no passo 1.3).

## 3. No Seu Projeto (IDs de Preço)

No arquivo `funil-conversao.html` (linhas ~700), você precisa substituir os placeholders pelos IDs reais que criou no Stripe:

```javascript
// Exemplo de como deve ficar:
if (durationText === '12') {
    selectedPlanPriceId = 'price_1Qx...'; // Cole o ID do plano de 12 meses aqui
} else {
    selectedPlanPriceId = 'price_1Qy...'; // Cole o ID do plano de 24 meses aqui
}
```

Após fazer isso, o botão "Confirmar adesão" no final do funil irá redirecionar o cliente para a página de pagamento segura do Stripe.
