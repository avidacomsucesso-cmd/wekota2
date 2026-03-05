import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { generateContractDOCX } from "./generateContract.ts";
import { sendWelcomeEmailWithContract } from "./emailService.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const payload = await req.json();

    // 1. Verificação do Evento (ajustar conforme o webhook do seu parceiro de pagamentos)
    // Exemplo: 'checkout.session.completed' para o Stripe
    if (payload.type !== 'checkout.session.completed') {
      return new Response(JSON.stringify({ message: "Evento ignorado" }), { status: 200 });
    }

    const session = payload.data.object;
    
    // O ID do cliente deve vir nos metadados ou na referência do checkout
    const leadId = session.client_reference_id || session.metadata?.lead_id;

    if (!leadId) {
      throw new Error("ID de Lead não encontrado nos metadados do webhook");
    }

    // 2. Buscar dados completos do utilizador
    const { data: lead, error: leadError } = await supabase
      .from('leads_wekota')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(`Lead não encontrado: ${leadError?.message || 'N/A'}`);
    }

    // 3. Estruturar os dados para o Contrato
    const is12Months = lead.plan_type === '12';
    
    const memberData = {
      fullName: lead.full_name || 'Cliente WEKOTA',
      passportNumber: lead.document_number || 'A preencher',
      nationality: lead.nationality || 'A preencher',
      dateOfBirth: '01/01/1990', // Requer campo na BD se aplicável
      country: lead.country || 'Portugal',
      address: lead.address || 'Morada não especificada',
      email: lead.email,
      phone: lead.whatsapp || lead.phone,
      productName: 'iPhone 17 Pro Max',
      storageCapacity: '256 GB',
      selectedColor: lead.product_color || 'À escolha',
      groupNumber: 'PT-24-001', // Requer lógica de alocação de grupo
      deliveryPosition: 1, // Requer lógica de alocação de posição
      estimatedDeliveryDate: 'Dezembro 2026',
      deliveryCountry: lead.country || 'Portugal',
      totalPrice: is12Months ? 1788 : 1800,
      installmentCount: is12Months ? 12 : 24,
      installmentValue: is12Months ? 149 : 75,
      firstPaymentDate: new Date().toLocaleDateString('pt-PT'),
      paymentDayOfMonth: new Date().getDate(),
      paymentMethod: 'Cartão / Digital',
      contractNumber: `WK-${new Date().getFullYear()}-${String(lead.id).padStart(5, '0')}`,
      contractDate: new Date().toLocaleDateString('pt-PT')
    };

    // 4. Gerar Contrato (DOCX em memória)
    console.log(`[Webhook] A gerar contrato para a lead ${leadId}...`);
    const contractBuffer = await generateContractDOCX(memberData);

    // 5. Enviar Email
    console.log(`[Webhook] A enviar email para ${memberData.email}...`);
    const fileName = `Contrato_WEKOTA_${memberData.contractNumber}.docx`;
    const emailSent = await sendWelcomeEmailWithContract(
      memberData.email,
      memberData,
      contractBuffer,
      fileName
    );

    // 6. Atualizar a Base de Dados
    if (emailSent) {
      await supabase
        .from('leads_wekota')
        .update({ 
          status: 'paid_active',
          contract_sent_at: new Date().toISOString()
        })
        .eq('id', leadId);
    }

    return new Response(JSON.stringify({ success: true, message: "Processo concluído" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
