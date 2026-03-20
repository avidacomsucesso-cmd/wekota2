const KYC_ENDPOINT = import.meta.env.VITE_KYC_ENDPOINT || 'https://script.google.com/macros/s/AKfycbxKPimVtaVPmU-WtO-QfYMSBjQtkEIHCH-D5sFSgYWO3ieD5eP6-vlfH0W64r4fC2fK/exec';

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadKyc(clientData, passportFile, selfieFile) {
  console.log('[KYC] Iniciando upload para o Google Apps Script...', clientData.email);
  try {
    const payload = { ...clientData };

    if (passportFile) {
      console.log('[KYC] Convertendo passaporte para Base64...');
      payload.passportBase64 = await fileToBase64(passportFile);
      payload.passportMime   = passportFile.type || 'image/jpeg';
    }

    if (selfieFile) {
      console.log('[KYC] Convertendo selfie para Base64...');
      payload.selfieBase64 = await fileToBase64(selfieFile);
      payload.selfieMime   = selfieFile.type || 'image/jpeg';
    }

    console.log('[KYC] Enviando payload para o endpoint:', KYC_ENDPOINT);
    const response = await fetch(KYC_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' },
      redirect: 'follow',
      body:    JSON.stringify(payload),
    });

    const result = await response.text();
    console.log('[KYC] Resposta do Google Apps Script:', result);

    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }

  } catch (err) {
    console.error('[KYC] Upload falhou:', err);
  }
}