import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth.js';
import { Readable } from 'stream';

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_KYC_FOLDER_ID;

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

  const monthFolderId   = await getOrCreateFolder(drive, monthFolder, ROOT_FOLDER_ID!);
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
