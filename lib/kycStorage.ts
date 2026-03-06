import { uploadDocumentToDrive } from './googleDrive.js';
import { appendClientToSheet, ClientRecord } from './googleSheets.js';

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
