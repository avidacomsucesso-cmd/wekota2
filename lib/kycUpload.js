const KYC_ENDPOINT = import.meta.env.VITE_KYC_ENDPOINT || 'https://script.google.com/macros/s/AKfycbwVjbY0h2fBAxTDusGWu5g5Ysmu1eQagLwGuEl7746iqAs62cPtkR_8x8x5YR2LWICJ/exec';

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadKyc(clientData, passportFile, selfieFile) {
  try {
    const payload = { ...clientData };

    if (passportFile) {
      payload.passportBase64 = await fileToBase64(passportFile);
      payload.passportMime   = passportFile.type || 'image/jpeg';
    }

    if (selfieFile) {
      payload.selfieBase64 = await fileToBase64(selfieFile);
      payload.selfieMime   = selfieFile.type || 'image/jpeg';
    }

    await fetch(KYC_ENDPOINT, {
      method:  'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload),
    });

  } catch (err) {
    console.warn('[KYC] Upload nao critico falhou:', err);
  }
}