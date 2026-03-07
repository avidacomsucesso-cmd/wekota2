const KYC_ENDPOINT = import.meta.env.VITE_KYC_ENDPOINT || 'https://script.google.com/macros/s/AKfycbyw9b62aT1eTgYpgYAzJ7b564sg2JOvze1qeWOGVOGQk5vsTzcUDFphFeRBbYkB7PLA/exec';

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

    const response = await fetch(KYC_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' },
      redirect: 'follow',
      body:    JSON.stringify(payload),
    });

  } catch (err) {
    console.warn('[KYC] Upload nao critico falhou:', err);
  }
}