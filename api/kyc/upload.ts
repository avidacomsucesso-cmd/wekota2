import { saveKycData } from '../../../../lib/kycStorage.js';

export async function POST(request: Request) {
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
      return new Response(JSON.stringify({ error: 'clientId e email sao obrigatorios' }), { status: 400 });
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

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    console.error('[KYC Upload]', error?.message || error);
    // Devolve 200 mesmo em erro para não bloquear o checkout
    return new Response(JSON.stringify({ success: false, error: error?.message }), { status: 200 });
  }
}
