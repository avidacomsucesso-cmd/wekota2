# PROMPT DYAD — KYC Google Drive + Sheets (Credenciais Preenchidas)

---

## CONTEXTO

Plataforma WEKOTA (wekota.eu). No checkout, o cliente faz upload de foto do
passaporte e selfie. Esses ficheiros devem ser guardados no Google Drive da
WEKOTA e os dados do cliente registados numa Google Sheet.

**Regra absoluta:** implementação 100% ADITIVA. Não alterar nenhum ficheiro
existente do checkout. Se o upload falhar, o checkout continua normalmente.

---

## VARIÁVEIS DE AMBIENTE

Adiciona exactamente estas linhas ao `.env.local` e ao painel do Vercel:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=wekota-kyc-uploader@wekota.iam.gserviceaccount.com

GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+kRoqmhU3v5zj\nbrSL8OQ96CzbLuOc6HEAk24NJ2vd/FJZLkecu9g9v4jiANUH8tR7qWGnfwjurpYw\nONcwSTU4MRfKo3UKYMUA9vmtzoB2l4gFcI0Z0pcD09YumXaZ9gw4FCMMgJZnbwmO\nyCL921KyvER6xGEialQkIhd93kmwlJGWkO7Xt1YKdtmceVtuilrH578SOenrr3vR\nS6szRZDqh7zH8zotZ5tZO6wdJuqVOY7DUalehfoaA+Y+09ZqGIv9bN4iJb9ETua0\nYrTyzGgAvttpPlBE/e4QXAs7mLvUXT9wxNsRpAWAC7mDPcMgC+OyTIhVe+Mm+sb7\nyhZPRpdfAgMBAAECggEAUlOMWtg7D1z7sbNbU1OLvwTlEAGnOlueqfGHKy6bJokB\nqF5aeKccKbzrrTtPzQHGcu//bKVwXfDVmFqN+GHAGJj43sWT5BpfMWYBAmnCTLl0\n/WicxImaTQCAuJv6xVOq/rUQWS/aCjBJkEH8/+92wBmeee0Jy5zk4cFKpclYy2v7\nC9pXjHauch9C3o4AP9Maz9uLxyHlqjwDk9h5uDoKQtBzzM9K1o5Hs0rVm42kPYQy\nZMZHE1Da5KbgtRSj6QjQqj7YWZQ8IBK/ZhEAFNE4HCXLitioP3THrh0oDXOj93nk\nsgaYzvsYS4+zkdQrx/0+h91ityUNMujd3tvsEHs70QKBgQD847JlhHFYobxTayhf\nXn4sLcrc4+Ws9qzhR53GINJG62luNWK9eeuGmks7Oha/XE5a+xzINmLgYJKUL5OD\n4RBikBl4iM7zHQ9IIKi4bV7K6M/XiHvVudBtu+fuOWu1MOuYbSYlCq/7V9BkTDAO\nKtIfYk25hYAJTxe/Z1rQw4w4sQKBgQDA6SmimpJReUvNGMFNBpvvIw8Q8uUQktFM\ntecm/rtnNl8sO74qaWl6vQIqAPCkNg2TdtKwnUDldRZvza0K9Sq9rZ5QIlQHXuhH\nb+BJaA/PBRBg0Z39NAbXWuNtWq5indbW15w1On9sWerSfas/h1x+A9FW+GKi+07c\nfQgN1t/VDwKBgQCTf/dgkNRPnt4qRZkhrwqml/r3xZEDxkjliRD0K9aZ+NrgphC2\ndTMzqjDxFZuI97zYAhkyic44EvvLpMhEpnQZGPVSQXF7iVqNdkcScvBUJ2B61Sdt\nbFiueGf5odI5t5Pirt8NweMNFZX9uhZZXQ57saml6MDaLSCrygvFMhZfsQKBgFji\nFWDqP0hyzs4s/cNzrB0+1g5FG+3K98yUc3CwJcCkeK10yWXZM9RtibW4wSeoEBFF\nykW97szKahARgA1wcMT8XdkmN/k9bWCc14Z6/+2us6Eoc9baRdyr7+XOxlKBzx8m\nML8FuPg/ZcaeSGz4/VDCiY283BWkHO3SXgeiXXdZAoGAOWT3RzmrmqRAuD0iorhg\nH0boo68FferUkuaUZMUbzPr+t0AJeoxU/fXfrZ/tDg3286Eit6jM7Fn/aRxEeVKe\nBBGX5Ibr2lEmbubhgMisokDeh7Rc0WvWV778OoKEzthBVwmQGSAme+qycK87blmr\nbnW7hQwGmmnliF4elf83CMU=\n-----END PRIVATE KEY-----\n"

GOOGLE_DRIVE_KYC_FOLDER_ID=1UQZHkO7UQe43WQVEZMWKrpF7U4DGJgM1

GOOGLE_SHEETS_CLIENTS_ID=10It5hF1vFJEOvirjYFqa_EOLZaXunStQRXXee-n824g
```

> **ATENÇÃO no Vercel:** ao adicionar `GOOGLE_PRIVATE_KEY` no painel do Vercel,
> cola o valor COM as aspas externas. O Vercel preserva os `\n` literais e o
> código trata a conversão automaticamente.

---

## INSTALAÇÃO

```bash
npm install googleapis
```

---

## FICHEIROS A CRIAR

### 1. `lib/googleAuth.ts`

```typescript
import { google } from 'googleapis';

export function getGoogleAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
}
```

---

### 2. `lib/googleDrive.ts`

```typescript
import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth';
import { Readable } from 'stream';

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_KYC_FOLDER_ID!;

async function getOrCreateFolder(
  drive: any,
  folderName: string,
  parentId: string
): Promise<string> {
  const res = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files?.length > 0) {
    return res.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  return folder.data.id;
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
}

export async function uploadDocumentToDrive(params: {
  clientId: string;
  clientName: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}): Promise<UploadResult> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });

  const now = new Date();
  const monthFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  // Pasta no formato: "2025-03 / cli_abc123_Joao Silva"
  const clientFolderName = `${params.clientId}_${params.clientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .substring(0, 40)}`;

  const monthFolderId   = await getOrCreateFolder(drive, monthFolder, ROOT_FOLDER_ID);
  const clientFolderId  = await getOrCreateFolder(drive, clientFolderName, monthFolderId);

  const stream = Readable.from(params.fileBuffer);

  const uploadRes = await drive.files.create({
    requestBody: {
      name: params.fileName,
      parents: [clientFolderId],
    },
    media: {
      mimeType: params.mimeType,
      body: stream,
    },
    fields: 'id, webViewLink, name',
  });

  return {
    fileId:      uploadRes.data.id!,
    fileName:    uploadRes.data.name!,
    webViewLink: uploadRes.data.webViewLink!,
  };
}
```

---

### 3. `lib/googleSheets.ts`

```typescript
import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_CLIENTS_ID!;
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
```

---

### 4. `lib/kycStorage.ts`

```typescript
import { uploadDocumentToDrive } from './googleDrive';
import { appendClientToSheet, ClientRecord } from './googleSheets';

export interface KycDocument {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export interface KycClientData {
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
}

export async function saveKycData(
  clientData: KycClientData,
  documents: { passport?: KycDocument; selfie?: KycDocument }
): Promise<void> {
  let passportResult = null;
  let selfieResult   = null;

  if (documents.passport) {
    const ext = documents.passport.mimeType.split('/')[1] || 'jpg';
    passportResult = await uploadDocumentToDrive({
      clientId:   clientData.clientId,
      clientName: clientData.fullName,
      fileName:   `passaporte_${clientData.clientId}.${ext}`,
      fileBuffer: documents.passport.buffer,
      mimeType:   documents.passport.mimeType,
    });
  }

  if (documents.selfie) {
    const ext = documents.selfie.mimeType.split('/')[1] || 'jpg';
    selfieResult = await uploadDocumentToDrive({
      clientId:   clientData.clientId,
      clientName: clientData.fullName,
      fileName:   `selfie_${clientData.clientId}.${ext}`,
      fileBuffer: documents.selfie.buffer,
      mimeType:   documents.selfie.mimeType,
    });
  }

  const record: ClientRecord = {
    ...clientData,
    passportDriveLink: passportResult?.webViewLink,
    passportFileId:    passportResult?.fileId,
    selfieDriveLink:   selfieResult?.webViewLink,
    selfieFileId:      selfieResult?.fileId,
  };

  await appendClientToSheet(record);
}
```

---

### 5. `app/api/kyc/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { saveKycData } from '@/lib/kycStorage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const clientData = {
      clientId:          (formData.get('clientId')          as string) || '',
      fullName:          (formData.get('fullName')          as string) || '',
      email:             (formData.get('email')             as string) || '',
      phone:             (formData.get('phone')             as string) || '',
      passportNumber:    (formData.get('passportNumber')    as string) || '',
      nationality:       (formData.get('nationality')       as string) || '',
      country:           (formData.get('country')           as string) || '',
      productName:       (formData.get('productName')       as string) || '',
      groupNumber:       (formData.get('groupNumber')       as string) || '',
      deliveryPosition:  parseInt(formData.get('deliveryPosition') as string) || 0,
      estimatedDelivery: (formData.get('estimatedDelivery') as string) || '',
      installmentValue:  parseFloat(formData.get('installmentValue') as string) || 0,
      installmentCount:  parseInt(formData.get('installmentCount')  as string) || 0,
    };

    if (!clientData.clientId || !clientData.email) {
      return NextResponse.json(
        { error: 'clientId e email sao obrigatorios' },
        { status: 400 }
      );
    }

    const passportFile = formData.get('passportImage') as File | null;
    const selfieFile   = formData.get('selfieImage')   as File | null;

    const documents: any = {};

    if (passportFile && passportFile.size > 0) {
      documents.passport = {
        buffer:       Buffer.from(await passportFile.arrayBuffer()),
        mimeType:     passportFile.type || 'image/jpeg',
        originalName: passportFile.name,
      };
    }

    if (selfieFile && selfieFile.size > 0) {
      documents.selfie = {
        buffer:       Buffer.from(await selfieFile.arrayBuffer()),
        mimeType:     selfieFile.type || 'image/jpeg',
        originalName: selfieFile.name,
      };
    }

    await saveKycData(clientData, documents);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[KYC Upload]', error?.message || error);
    // Devolve 200 mesmo em erro para não bloquear o checkout
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 200 }
    );
  }
}
```

---

### 6. INTEGRAÇÃO NO CHECKOUT — adicionar esta função

No ficheiro do checkout onde o cliente submete os documentos,
**NÃO ALTERAR NADA EXISTENTE** — apenas adicionar esta função e chamá-la
no final do handler de submit, sem await:

```typescript
// Adicionar no componente/página do checkout:

async function uploadKycToGoogle(
  clientData: {
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
  },
  passportFile: File | null,
  selfieFile: File | null
) {
  try {
    const form = new FormData();

    Object.entries(clientData).forEach(([key, value]) => {
      form.append(key, String(value));
    });

    if (passportFile) form.append('passportImage', passportFile);
    if (selfieFile)   form.append('selfieImage',   selfieFile);

    await fetch('/api/kyc/upload', { method: 'POST', body: form });
  } catch (err) {
    // Silencioso — nunca bloquear o checkout
    console.warn('[KYC] Upload nao critico falhou:', err);
  }
}

// No handler de submit, DEPOIS do código existente:
// (fire-and-forget, sem await)
uploadKycToGoogle(clientData, passportFile, selfieFile);
```

---

## RESULTADO ESPERADO NO DRIVE

```
WEKOTA-KYC/
  2025-03/
    cli_123_Joao Silva/
      passaporte_cli_123.jpg
      selfie_cli_123.jpg
    cli_456_Maria Santos/
      passaporte_cli_456.jpg
      selfie_cli_456.jpg
```

## RESULTADO ESPERADO NA SHEET

Aba **KYC** com uma linha por cliente:

| Data Registo | Nome | Email | Grupo | Posição | Link Passaporte | Link Selfie | Estado KYC |
|---|---|---|---|---|---|---|---|
| 03/03/2025 14:32 | João Silva | joao@... | PT-24-007 | 8 | [abrir] | [abrir] | Pendente revisao |

A coluna **Estado KYC** e **Notas** são preenchidas manualmente pela equipa
WEKOTA após revisão dos documentos.

---

## CHECKLIST

- [ ] `npm install googleapis` executado
- [ ] 4 variáveis de ambiente adicionadas ao `.env.local`
- [ ] 4 variáveis adicionadas ao painel do Vercel (Settings → Environment Variables)
- [ ] 5 ficheiros criados conforme acima
- [ ] Linha de chamada adicionada no checkout (sem await)
- [ ] Teste local: submeter documentos → verificar pasta no Drive
- [ ] Teste local: verificar linha na Sheet com links correctos
- [ ] Deploy no Vercel e teste em produção
