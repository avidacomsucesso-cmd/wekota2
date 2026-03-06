import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth.js';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_CLIENTS_ID;
const SHEET_NAME = 'KYC';

const HEADERS = [
  'Data Registo',
  'ID Cliente',
  'Nome Completo',
  'Email',
  'Telefone',
  'Passaporte N.º',
  'Nacionalidade',
  'Pais Residencia',
  'Produto',
  'Grupo',
  'Posicao',
  'Entrega Prevista',
  'Parcela (EUR)',
  'N.º Prestacoes',
  'Link Passaporte (Drive)',
  'Link Selfie (Drive)',
  'ID Ficheiro Passaporte',
  'ID Ficheiro Selfie',
  'Estado KYC',
  'Notas',
];

async function ensureSheetExists(sheets: any): Promise<void> {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheetNames = spreadsheet.data.sheets
    ?.map((s: any) => s.properties?.title) || [];

  if (!sheetNames.includes(SHEET_NAME)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    });
  }

  // Verifica se cabeçalhos já existem
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:A1`,
  });

  if (!existing.data.values?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
}

export interface ClientRecord {
  clientId: string;
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  country: string;
  productName: string;
  groupNumber: string;
  deliveryPosition: number;
  estimatedDelivery: string;
  installmentValue: number;
  installmentCount: number;
  passportDriveLink?: string;
  passportFileId?: string;
  selfieDriveLink?: string;
  selfieFileId?: string;
}

export async function appendClientToSheet(record: ClientRecord): Promise<void> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  await ensureSheetExists(sheets);

  const now = new Date().toLocaleString('pt-PT', {
    timeZone: 'Europe/Lisbon',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const row = [
    now,
    record.clientId,
    record.fullName,
    record.email,
    record.phone,
    record.passportNumber,
    record.nationality,
    record.country,
    record.productName,
    record.groupNumber,
    record.deliveryPosition,
    record.estimatedDelivery,
    record.installmentValue,
    record.installmentCount,
    record.passportDriveLink  || '',
    record.selfieDriveLink    || '',
    record.passportFileId     || '',
    record.selfieFileId       || '',
    'Pendente revisao',
    '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}
