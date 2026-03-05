import { Resend } from "npm:resend@3.2.0";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

// Usa a chave de API configurada nas variáveis de ambiente do Supabase
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export function getWelcomeEmailHTML(memberData: any) {
  const firstName = memberData.fullName.split(' ')[0];
  const nextPaymentDateObj = new Date();
  nextPaymentDateObj.setMonth(nextPaymentDateObj.getMonth() + 1);
  nextPaymentDateObj.setDate(memberData.paymentDayOfMonth || 5);
  const nextPaymentDate = nextPaymentDateObj.toLocaleDateString('pt-PT');
  
  return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Bem-vindo à WEKOTA</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #F4F6F9; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper Principal -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F4F6F9;">
    <tr>
      <td align="center">
        
        <!-- Container Principal (600px) -->
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
          
          <!-- HEADER -->
          <tr>
            <td style="background-color: #0D1F40; padding: 32px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <!-- O logo atual da wekota na web -->
                    <img src="https://wekota.eu/images/logo-oficial.png" alt="WEKOTA" width="160" style="display: block; filter: brightness(0) invert(1);">
                    <p style="color: #3EB5AC; font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; margin: 8px 0 0 0; letter-spacing: 1.5px; text-transform: uppercase;">
                      TOGETHER, WE ACCESS.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Linha Decorativa -->
          <tr>
            <td height="4" style="background-color: #3EB5AC;"></td>
          </tr>

          <!-- HERO BLOCK -->
          <tr>
            <td style="padding: 40px 32px 32px 32px; background-color: #FFFFFF; text-align: center;">
              <div style="width: 48px; height: 48px; background-color: #E6F7F6; border-radius: 50%; display: inline-block; line-height: 48px; text-align: center; margin-bottom: 24px;">
                <span style="color: #3EB5AC; font-size: 24px; font-weight: bold;">&#10003;</span>
              </div>
              <h1 style="color: #0D1F40; font-size: 28px; font-weight: bold; margin: 0 0 8px 0; line-height: 1.3;">
                Bem-vindo à família WEKOTA, ${firstName}!
              </h1>
              <p style="color: #3EB5AC; font-size: 18px; font-style: italic; margin: 0; line-height: 1.5;">
                O seu ${memberData.productName} está reservado.<br>
                O seu contrato está confirmado.<br>
                A sua posição está garantida.
              </p>
            </td>
          </tr>

          <!-- CONTEÚDO PRINCIPAL -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              
              <p style="color: #666B7A; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Obrigado por confiar na WEKOTA. A sua posição <strong>${memberData.deliveryPosition}</strong> está registada em contrato e é imutável. Não há sorteio, não há surpresas — a data de entrega já está definida desde o primeiro momento.
              </p>

              <!-- CARD: RESUMO DA COTA -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-left: 4px solid #3EB5AC; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="color: #0D1F40; font-size: 18px; margin: 0 0 16px 0;">A sua cota em detalhe</h2>
                    
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 12px; color: #3EB5AC; font-weight: bold;">&#9632;</td>
                        <td style="padding-bottom: 12px;">
                          <span style="color: #666B7A; font-size: 14px; display: block;">Produto</span>
                          <span style="color: #1A1A2E; font-size: 16px; font-weight: bold;">${memberData.productName} &mdash; ${memberData.storageCapacity} (${memberData.selectedColor})</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 12px; color: #3EB5AC; font-weight: bold;">&#9632;</td>
                        <td style="padding-bottom: 12px;">
                          <span style="color: #666B7A; font-size: 14px; display: block;">Grupo</span>
                          <span style="color: #1A1A2E; font-size: 16px; font-weight: bold;">${memberData.groupNumber}</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 12px; color: #3EB5AC; font-weight: bold;">&#9632;</td>
                        <td style="padding-bottom: 12px;">
                          <span style="color: #666B7A; font-size: 14px; display: block;">A sua posição</span>
                          <span style="color: #1A1A2E; font-size: 16px; font-weight: bold;">Posição ${memberData.deliveryPosition} de ${memberData.installmentCount}</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="padding-bottom: 12px; color: #3EB5AC; font-weight: bold;">&#9632;</td>
                        <td style="padding-bottom: 12px;">
                          <span style="color: #666B7A; font-size: 14px; display: block;">Entrega prevista</span>
                          <span style="color: #1A1A2E; font-size: 16px; font-weight: bold;">${memberData.estimatedDeliveryDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="color: #3EB5AC; font-weight: bold;">&#9632;</td>
                        <td>
                          <span style="color: #666B7A; font-size: 14px; display: block;">Parcela mensal</span>
                          <span style="color: #1A1A2E; font-size: 16px; font-weight: bold;">&euro;${memberData.installmentValue.toFixed(2).replace('.', ',')} / mês &times; ${memberData.installmentCount} meses</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CARD: CONFIRMAÇÃO DE PAGAMENTO -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F0FDF9; border: 1px solid #A7F3D0; border-radius: 6px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #047857; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">
                      <span style="margin-right: 6px;">&#10003;</span> Pagamento inicial confirmado
                    </p>
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #1A1A2E; line-height: 1.6;">
                      <tr>
                        <td width="40%" style="color: #666B7A;">Referência:</td>
                        <td align="right" style="font-weight: bold;">#${memberData.contractNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #666B7A;">Data:</td>
                        <td align="right" style="font-weight: bold;">${memberData.firstPaymentDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #666B7A;">Valor pago:</td>
                        <td align="right" style="font-weight: bold;">&euro;${memberData.installmentValue.toFixed(2).replace('.', ',')}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; border-top: 1px dashed #A7F3D0; margin-top: 8px; color: #047857; font-weight: bold;" colspan="2" align="center">
                          Próxima prestação: ${nextPaymentDate}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CARD: PRÓXIMOS PASSOS -->
              <h3 style="color: #0D1F40; font-size: 20px; margin: 0 0 16px 0;">O que acontece agora?</h3>
              
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td width="32" valign="top" style="padding-bottom: 16px;">
                    <div style="background-color: #0D1F40; color: #FFFFFF; width: 20px; height: 20px; text-align: center; line-height: 20px; border-radius: 4px; font-size: 12px; font-weight: bold;">1</div>
                  </td>
                  <td style="padding-bottom: 16px; color: #666B7A; font-size: 15px; line-height: 1.5;">
                    O seu <strong>contrato oficial está em anexo</strong> a este email, preenchido com todos os seus dados e assinado eletronicamente. Guarde-o &mdash; é o seu documento oficial de garantia.
                  </td>
                </tr>
                <tr>
                  <td width="32" valign="top" style="padding-bottom: 16px;">
                    <div style="background-color: #0D1F40; color: #FFFFFF; width: 20px; height: 20px; text-align: center; line-height: 20px; border-radius: 4px; font-size: 12px; font-weight: bold;">2</div>
                  </td>
                  <td style="padding-bottom: 16px; color: #666B7A; font-size: 15px; line-height: 1.5;">
                    Vai receber um lembrete automático da nossa parte 3 dias antes da data de vencimento de cada prestação.
                  </td>
                </tr>
                <tr>
                  <td width="32" valign="top" style="padding-bottom: 16px;">
                    <div style="background-color: #0D1F40; color: #FFFFFF; width: 20px; height: 20px; text-align: center; line-height: 20px; border-radius: 4px; font-size: 12px; font-weight: bold;">3</div>
                  </td>
                  <td style="padding-bottom: 16px; color: #666B7A; font-size: 15px; line-height: 1.5;">
                    Quando chegar o mês da sua posição (${memberData.estimatedDeliveryDate}), a equipa WEKOTA entra em contacto direto para confirmar a morada e agendar a entrega.
                  </td>
                </tr>
                <tr>
                  <td width="32" valign="top">
                    <div style="background-color: #0D1F40; color: #FFFFFF; width: 20px; height: 20px; text-align: center; line-height: 20px; border-radius: 4px; font-size: 12px; font-weight: bold;">4</div>
                  </td>
                  <td style="color: #666B7A; font-size: 15px; line-height: 1.5;">
                    Recebe o seu dispositivo em casa, <strong>novo, selado na caixa e com garantia europeia.</strong>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://wekota.eu" target="_blank" style="background-color: #3EB5AC; color: #FFFFFF; text-decoration: none; padding: 16px 32px; font-size: 16px; font-weight: bold; border-radius: 8px; display: inline-block;">
                      Aceder à minha área &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- SUPORTE -->
          <tr>
            <td style="padding: 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <h4 style="color: #0D1F40; font-size: 16px; margin: 0 0 12px 0;">Tem dúvidas? Estamos aqui.</h4>
              <p style="color: #666B7A; font-size: 14px; margin: 0 0 16px 0; line-height: 1.5;">
                O nosso suporte funciona todos os dias úteis. Não hesite em contactar-nos.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding: 0 12px; border-right: 1px solid #CBD5E1;">
                    <a href="https://wa.me/34627842896" style="color: #3EB5AC; font-weight: bold; text-decoration: none; font-size: 14px;">WhatsApp +34 627 84 28 96</a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="mailto:contato@wekota.eu" style="color: #3EB5AC; font-weight: bold; text-decoration: none; font-size: 14px;">contato@wekota.eu</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 32px; background-color: #0D1F40; text-align: center;">
              <p style="color: #94A3B8; font-size: 12px; margin: 0 0 8px 0; line-height: 1.6;">
                <strong>WEKOTA UAB</strong> &middot; Lvivo g. 21A, Vilnius, 09309 Lituânia<br>
                Operação sob jurisdição da União Europeia.
              </p>
              <p style="margin: 0;">
                <a href="https://wekota.eu" style="color: #3EB5AC; font-size: 12px; text-decoration: none;">www.wekota.eu</a>
                <span style="color: #475569; margin: 0 8px;">|</span>
                <a href="https://wekota.eu/termos-condicoes.html" style="color: #94A3B8; font-size: 12px; text-decoration: underline;">Termos e Condições</a>
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export async function sendWelcomeEmailWithContract(toEmail: string, memberData: any, contractBuffer: Uint8Array, fileName: string) {
  const htmlContent = getWelcomeEmailHTML(memberData);
  const base64Content = encodeBase64(contractBuffer);

  try {
    const { data, error } = await resend.emails.send({
      from: 'WEKOTA <suporte@wekota.eu>', // Substituir por e-mail validado no Resend
      to: [toEmail],
      subject: 'Bem-vindo à WEKOTA! O seu contrato em anexo. 🎉',
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          content: base64Content,
        },
      ],
    });

    if (error) {
      console.error("Erro no envio do email (Resend):", error);
      return false;
    }

    console.log(`Email enviado com sucesso para ${toEmail}. ID:`, data?.id);
    return true;
  } catch (err) {
    console.error("Exceção na API de Email:", err);
    return false;
  }
}