import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "npm:docx@8.5.0";

export async function generateContractDOCX(memberData: any) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
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
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Cláusula 1.ª - Identificação das Partes", bold: true })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({ children: [new TextRun("Entre:")] }),
          new Paragraph({
            children: [
              new TextRun({ text: "WEKOTA UAB", bold: true }),
              new TextRun(", sociedade constituída ao abrigo da lei lituana, com sede em Lvivo g. 21A, Vilnius, 09309 Vilniaus m. sav., Lithuania, número de registo "),
              new TextRun({ text: "402314873", bold: true }),
              new TextRun(", doravante designada por \"Plataforma\" ou \"WEKOTA\"."),
            ],
          }),
          new Paragraph({ children: [new TextRun("E:")] }),
          new Paragraph({ children: [new TextRun({ text: "DADOS DO ADQUIRENTE:", bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `Nome completo: ${memberData.fullName}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Número do passaporte: ${memberData.passportNumber}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Nacionalidade: ${memberData.nationality}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Data de nascimento: ${memberData.dateOfBirth}` })] }),
          new Paragraph({ children: [new TextRun({ text: `País de residência: [${memberData.country === 'Portugal' ? 'X' : ' '}] Portugal   [${memberData.country === 'Spain' ? 'X' : ' '}] Espanha` })] }),
          new Paragraph({ children: [new TextRun({ text: `Morada completa: ${memberData.address}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Email: ${memberData.email}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Telefone/WhatsApp: ${memberData.phone}` })] }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Cláusula 4.ª - Objeto e Condições de Entrega", bold: true })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({ children: [new TextRun({ text: `Produto: ${memberData.productName}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Capacidade de armazenamento: ${memberData.storageCapacity}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Cor selecionada: ${memberData.selectedColor}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Grupo de Aquisição N.º: ${memberData.groupNumber}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Posição de entrega no Grupo: ${memberData.deliveryPosition}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Data prevista de entrega: ${memberData.estimatedDeliveryDate}` })] }),
          new Paragraph({ children: [new TextRun({ text: `País de entrega: ${memberData.deliveryCountry}` })] }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "Cláusula 5.ª - Condições Financeiras", bold: true })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({ children: [new TextRun({ text: `Preço total: € ${memberData.totalPrice.toFixed(2)}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Modalidade de pagamento: [${memberData.installmentCount === 12 ? 'X' : ' '}] 12 prestações   [${memberData.installmentCount === 24 ? 'X' : ' '}] 24 prestações` })] }),
          new Paragraph({ children: [new TextRun({ text: `Valor de cada prestação: € ${memberData.installmentValue.toFixed(2)}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Número total de prestações: ${memberData.installmentCount}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Data da 1.ª prestação: ${memberData.firstPaymentDate}` })] }),
          new Paragraph({ children: [new TextRun({ text: `Dia de vencimento das prestações seguintes: Dia ${memberData.paymentDayOfMonth} de cada mês` })] }),
          new Paragraph({ children: [new TextRun({ text: `Método de pagamento: ${memberData.paymentMethod}` })] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Pelo Adquirente:", bold: true })],
            spacing: { before: 400, after: 400 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "________________________________________________" })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "(Assinatura digital / Concordância eletrónica)" })],
            spacing: { after: 400 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `Data de celebração: ${memberData.contractDate}` })],
          }),
        ],
      },
    ],
  });

  // Em Deno, o Packer converte para Uint8Array
  return await Packer.toBuffer(doc);
}
