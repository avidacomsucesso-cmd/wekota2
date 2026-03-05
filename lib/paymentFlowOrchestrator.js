import { generateContractPDF } from './generateContract.js';
import { sendWelcomeEmailWithContract } from './emailService.js';
import { supabase } from '../supabaseClient.js';

/**
 * Este fluxo deve ser acionado pelo seu backend (ex: Edge Function no Supabase)
 * quando o Stripe ou outro EMI parceiro envia um webhook de pagamento com sucesso (checkout.session.completed).
 * 
 * @param {string} leadId - ID do Lead que acabou de pagar
 * @param {Object} paymentInfo - Dados do pagamento (opcional)
 */
export async function processSuccessfulPaymentFlow(leadId, paymentInfo) {
  try {
    // 1. Ir buscar os dados do utilizador à Base de Dados
    const { data: lead, error: leadError } = await supabase
      .from('leads_wekota')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(`Lead não encontrado: ${leadError?.message}`);
    }

    // 2. Mapear os dados para o formato esperado pelo contrato
    // (Ajustar consoante a estrutura real da sua tabela leads_wekota)
    const memberData = {
      fullName: lead.full_name || 'Cliente WEKOTA',
      passportNumber: lead.document_number || 'Não preenchido',
      nationality: lead.nationality || 'Não preenchida',
      dateOfBirth: '01/01/1990', // Ajustar campo real
      country: lead.country || 'Portugal',
      address: lead.address || 'Morada não especificada',
      email: lead.email,
      phone: lead.whatsapp || lead.phone,
      
      productName: 'iPhone 17 Pro Max',
      storageCapacity: '256 GB',
      selectedColor: lead.product_color || 'À escolha',
      groupNumber: 'PT-24-001',
      deliveryPosition: 1, // Logica de atribuição de posição
      estimatedDeliveryDate: 'Dezembro 2026',
      deliveryCountry: lead.country || 'Portugal',
      
      totalPrice: lead.plan_type === '12' ? 1788 : 1800,
      installmentCount: lead.plan_type === '12' ? 12 : 24,
      installmentValue: lead.plan_type === '12' ? 149 : 75,
      firstPaymentDate: new Date().toLocaleDateString('pt-PT'),
      paymentDayOfMonth: new Date().getDate(),
      paymentMethod: 'Cartão de Crédito',
      
      contractNumber: `WK-${new Date().getFullYear()}-${String(lead.id).padStart(5, '0')}`,
      contractDate: new Date().toLocaleDateString('pt-PT')
    };

    // 3. Gerar o Contrato
    console.log(`[Flow] A gerar contrato para ${memberData.fullName}...`);
    const contractBuffer = await generateContractPDF(memberData);

    // 4. Enviar Email
    console.log(`[Flow] A enviar email de boas-vindas para ${memberData.email}...`);
    const emailSent = await sendWelcomeEmailWithContract(
      memberData.email, 
      memberData, 
      contractBuffer, 
      `Contrato_WEKOTA_${memberData.contractNumber}.docx`
    );

    // 5. Registar na Base de Dados que o email foi enviado
    if (emailSent) {
      await supabase
        .from('leads_wekota')
        .update({ 
          status: 'paid_active',
          contract_sent_at: new Date().toISOString()
        })
        .eq('id', leadId);
        
      console.log('[Flow] Processo concluído com sucesso!');
    }

    return true;

  } catch (error) {
    console.error('[Flow] Erro no processamento pós-pagamento:', error);
    return false;
  }
}
