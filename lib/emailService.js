/**
 * Email de Boas-Vindas WEKOTA
 * Este serviço simula ou implementa o envio de email com o contrato em anexo.
 * 
 * Para produção, recomenda-se usar Resend, SendGrid ou NodeMailer.
 */

// Exemplo usando Resend (necessita: npm install resend)
// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

export function getWelcomeEmailHTML(memberData) {
  return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background-color: #f8fafc; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .logo { max-width: 150px; margin-bottom: 24px; }
        h1 { color: #0f172a; font-size: 24px; margin-bottom: 16px; }
        p { font-size: 16px; line-height: 1.6; margin-bottom: 16px; color: #334155; }
        .highlight { font-weight: 600; color: #0ea5e9; }
        .box { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #0ea5e9; }
        .footer { margin-top: 40px; font-size: 14px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Bem-vindo(a) à WEKOTA, ${memberData.fullName.split(' ')[0]}! 🎉</h1>
        
        <p>Confirmamos a receção do seu pagamento inicial e damos-lhe oficialmente as boas-vindas ao <strong>Grupo ${memberData.groupNumber}</strong>.</p>
        
        <div class="box">
          <p style="margin:0;"><strong>A sua reserva está garantida.</strong><br>
          Posição de entrega confirmada: <span class="highlight">#${memberData.deliveryPosition}</span></p>
        </div>

        <p>A sua jornada para adquirir o ${memberData.productName} acabou de começar. Em anexo, encontra o seu <strong>contrato formal da WEKOTA</strong> com todas as informações sobre as suas prestações, posição no grupo e condições legais.</p>

        <p>Recomendamos que guarde este documento para sua referência. Pode consultar e gerir a sua subscrição a qualquer momento através do nosso painel de utilizador.</p>

        <p>Se tiver alguma dúvida, a nossa equipa de suporte está sempre disponível no WhatsApp: <strong>+34 627 84 28 96</strong>.</p>

        <p>Obrigado por confiar na WEKOTA.</p>

        <div class="footer">
          <p><strong>WEKOTA UAB</strong><br>
          Lvivo g. 21A, Vilnius, 09309 Vilniaus m. sav., Lithuania.<br>
          Operação sob jurisdição europeia.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Função principal para enviar o email de boas-vindas com o contrato PDF/DOCX
 * 
 * @param {string} toEmail - Email do destinatário
 * @param {Object} memberData - Dados do membro
 * @param {Buffer} contractBuffer - Buffer do ficheiro PDF ou DOCX
 * @param {string} fileName - Nome do ficheiro em anexo (ex: contrato_wekota.pdf)
 */
export async function sendWelcomeEmailWithContract(toEmail, memberData, contractBuffer, fileName = 'Contrato_WEKOTA.docx') {
  const htmlContent = getWelcomeEmailHTML(memberData);

  // Aqui é onde integra o seu serviço de email (exemplo com Resend)
  console.log(`[Email Service] Simulação de envio para ${toEmail}`);
  console.log(`[Email Service] Assunto: Bem-vindo à WEKOTA! O seu contrato em anexo.`);
  console.log(`[Email Service] Anexo: ${fileName} (${contractBuffer.length} bytes)`);

  /* EXEMPLO DE IMPLEMENTAÇÃO COM RESEND:
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'WEKOTA <suporte@wekota.eu>',
      to: [toEmail],
      subject: 'Bem-vindo à WEKOTA! O seu contrato em anexo. 🎉',
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          content: contractBuffer,
        },
      ],
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      return false;
    }
    
    // Sucesso, pode registar o envio na base de dados Supabase
    return true;
  } catch (error) {
    console.error("Exceção ao enviar email:", error);
    return false;
  }
  */

  return true;
}
