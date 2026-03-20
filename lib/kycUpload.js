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
  // LOG PARA ALERT (VISIVEL NO BROWSER DO USER)
  alert('Iniciando upload para o Google Sheets...');
  
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
      mode: 'no-cors', // TENTATIVA DE EVITAR BLOQUEIO DE CORS
      body:    JSON.stringify(payload),
    });

    // Como usamos no-cors, não conseguimos ler a resposta detalhada, 
    // mas o Google Apps Script costuma aceitar o POST.
    console.log('[KYC] Requisição enviada (no-cors mode)');
    alert('Upload enviado ao Google!');

  } catch (err) {
    console.error('[KYC] Upload falhou:', err);
    alert('Erro no upload: ' + err.message);
  }
}