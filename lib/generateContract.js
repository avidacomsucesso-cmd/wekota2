import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from "docx";

/**
 * Função para gerar o contrato preenchido em formato DOCX.
 * Este ficheiro pode posteriormente ser convertido para PDF usando LibreOffice ou outra API.
 * 
 * @param {Object} memberData
 * @returns {Promise<Buffer>} - O Buffer do ficheiro DOCX
 */
export async function generateContractDOCX(memberData) {
  // Configuração do Documento
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // CABEÇALHO / CAPA
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CONTRATO DE ADESÃO A GRUPO DE AQUISIÇÃO COLETIVA", bold: true, size: 32 }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `Número do contrato: ${memberData.contractNumber || '__________'}`, bold: true }),
            ],
            spacing: { after: 400 },
          }),

          // INFORMAÇÕES DO GRUPO
          new Paragraph({
            children: [
              new TextRun({ text: `Grupo de Aquisição N.º: ${memberData.groupNumber || '__________'}`, bold: true, size: 24 }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Posição N.º: ${memberData.deliveryPosition || '__________'}`, bold: true, size: 24 }),
            ],
            spacing: { after: 400 },
          }),

          // ARTIGO 1 - IDENTIFICAÇÃO DAS PARTES
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Cláusula 1.ª - Identificação das Partes", bold: true })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("Entre:"),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "WEKOTA UAB", bold: true }),
              new TextRun(", sociedade constituída ao abrigo da lei lituana, com sede em Lvivo g. 21A, Vilnius, 09309 Vilniaus m. sav., Lithuania, número de registo "),
              new TextRun({ text: "402314873", bold: true }),
              new TextRun(", doravante designada por \"Plataforma\" ou \"WEKOTA\"."),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("E:"),
            ],
            spacing: { after: 200 },
          }),

          // ARTIGO 2 - DADOS DO ADQUIRENTE
          new Paragraph({
            children: [
              new TextRun({ text: "DADOS DO ADQUIRENTE:", bold: true }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Nome completo: ${memberData.fullName || '_________________________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Número do passaporte: ${memberData.passportNumber || '____________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Nacionalidade: ${memberData.nationality || '____________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Data de nascimento: ${memberData.dateOfBirth || '___/___/______'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `País de residência: [${memberData.country === 'Portugal' ? 'X' : ' '}] Portugal   [${memberData.country === 'Spain' ? 'X' : ' '}] Espanha` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Morada completa: ${memberData.address || '________________________________________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Email: ${memberData.email || '_________________________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Telefone/WhatsApp: ${memberData.phone || '____________________'}` }),
            ],
            spacing: { after: 400 },
          }),

          // ARTIGO 4 - DADOS DO PRODUTO
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Cláusula 4.ª - Objeto e Condições de Entrega", bold: true })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Produto: ${memberData.productName || '____________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Capacidade de armazenamento: ${memberData.storageCapacity || '____________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Cor selecionada: ${memberData.selectedColor || '____________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Grupo de Aquisição N.º: ${memberData.groupNumber || '____________________'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Posição de entrega no Grupo: ${memberData.deliveryPosition || '___'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Data prevista de entrega: ${memberData.estimatedDeliveryDate || '___/___/______'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `País de entrega: ${memberData.deliveryCountry || '____________________'}` }),
            ],
            spacing: { after: 400 },
          }),

          // ARTIGO 5 - DADOS FINANCEIROS
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Cláusula 5.ª - Condições Financeiras", bold: true })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Preço total: € ${memberData.totalPrice ? memberData.totalPrice.toFixed(2) : '_____,__'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Modalidade de pagamento: [${memberData.installmentCount === 12 ? 'X' : ' '}] 12 prestações   [${memberData.installmentCount === 24 ? 'X' : ' '}] 24 prestações` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Valor de cada prestação: € ${memberData.installmentValue ? memberData.installmentValue.toFixed(2) : '_____,__'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Número total de prestações: ${memberData.installmentCount || '__'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Data da 1.ª prestação: ${memberData.firstPaymentDate || '___/___/______'}` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Dia de vencimento das prestações seguintes: Dia ${memberData.paymentDayOfMonth || '__'} de cada mês` }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Método de pagamento: ${memberData.paymentMethod || '____________________'}` }),
            ],
            spacing: { after: 600 },
          }),

          // RODAPÉ
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Pelo Adquirente:", bold: true }),
            ],
            spacing: { before: 400, after: 400 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "________________________________________________" }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "(Assinatura digital / Concordância eletrónica)" }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `Data de celebração: ${memberData.contractDate || '___/___/______'}` }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Função de conversão DOCX -> PDF (Requer LibreOffice no servidor Linux)
 * Exemplo de uso num ambiente com Node.js e LibreOffice:
 */
export async function docxToPdf(docxBuffer) {
  // IMPORTANTE: Esta função precisa ser executada num backend (Node.js) com LibreOffice instalado.
  // Não funcionará diretamente no browser ou edge runtime.
  
  if (typeof window !== 'undefined') {
    throw new Error('docxToPdf cannot run in the browser.');
  }

  // Descomentar num ambiente Node.js:
  /*
  const { execSync } = await import('child_process');
  const { writeFileSync, readFileSync, unlinkSync } = await import('fs');
  const { tmpdir } = await import('os');
  const { join } = await import('path');

  const tmpDocx = join(tmpdir(), `contract_${Date.now()}.docx`);
  const tmpDir = tmpdir();
  writeFileSync(tmpDocx, docxBuffer);
  
  execSync(`soffice --headless --convert-to pdf --outdir ${tmpDir} ${tmpDocx}`);
  
  const pdfPath = tmpDocx.replace('.docx', '.pdf');
  const pdfBuffer = readFileSync(pdfPath);
  
  // Cleanup
  unlinkSync(tmpDocx);
  unlinkSync(pdfPath);
  
  return pdfBuffer;
  */

  throw new Error('Not implemented: requires Node.js and LibreOffice');
}

/**
 * Orquestrador final:
 * @param {Object} memberData
 * @returns {Promise<Buffer>} - Retorna o Buffer PDF do contrato
 */
export async function generateContractPDF(memberData) {
  // 1. Gerar o DOCX em memória
  const docxBuffer = await generateContractDOCX(memberData);
  
  // 2. Converter para PDF (descomentar quando o backend estiver configurado)
  // const pdfBuffer = await docxToPdf(docxBuffer);
  // return pdfBuffer;

  // Como alternativa para o Vercel/Edge sem LibreOffice, poder-se-ia integrar
  // a API CloudConvert, PDFShift ou pdf-lib. Por agora, retorna o DOCX.
  return docxBuffer;
}
