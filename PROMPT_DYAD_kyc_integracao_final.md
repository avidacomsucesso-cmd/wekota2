# PROMPT DYAD — Integrar KYC no Checkout (Google Apps Script já pronto)

## CONTEXTO

O endpoint do Google Apps Script já está publicado e funcional.
O Dyad só precisa de criar um ficheiro de helper e chamar a função
no passo de upload de documentos do checkout.

**Não alterar nenhum ficheiro existente** além de adicionar a chamada
no step de documentos.

---

## O ENDPOINT

```
https://script.google.com/macros/s/AKfycbyg-sYNhR34e7Nkh-zV7Dfjw5Gg15qewknutvRrEiEUL-vkG5QMlUnFPqPU6iIKT0Q4/exec
```

Já testado e activo — responde com `{"status":"WEKOTA KYC endpoint active"}`.

---

## VARIÁVEL DE AMBIENTE

Adiciona ao `.env` e ao Vercel:

```env
VITE_KYC_ENDPOINT=https://script.google.com/macros/s/AKfycbyg-sYNhR34e7Nkh-zV7Dfjw5Gg15qewknutvRrEiEUL-vkG5QMlUnFPqPU6iIKT0Q4/exec
```

---

## FICHEIRO A CRIAR — `src/lib/kycUpload.js`

```javascript
const KYC_ENDPOINT = import.meta.env.VITE_KYC_ENDPOINT;

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
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload),
    });

  } catch (err) {
    console.warn('[KYC] Upload nao critico falhou:', err);
  }
}
```

> **Nota importante:** o header deve ser `'Content-Type': 'text/plain'`
> e NÃO `'application/json'`. O Google Apps Script rejeita CORS em
> `application/json` mas aceita `text/plain`. O corpo continua a ser
> JSON válido — só o header muda.

---

## INTEGRAÇÃO NO CHECKOUT

No ficheiro do step onde o cliente faz upload do passaporte e selfie,
adiciona no topo:

```javascript
import { uploadKyc } from '@/lib/kycUpload';
```

No handler de submit desse step, **depois da validação dos ficheiros**
e **antes de avançar para o passo seguinte**, adiciona esta linha
(sem await — fire and forget):

```javascript
// Adaptar os nomes das variáveis aos que já existem no teu código:
uploadKyc(
  {
    clientId:          usuario.id,         // ou session id
    fullName:          usuario.nome,
    email:             usuario.email,
    phone:             usuario.telefone,
    passportNumber:    usuario.passaporte,
    nationality:       usuario.nacionalidade,
    country:           usuario.pais,
    productName:       'iPhone 17 Pro Max 256GB',
    groupNumber:       cota.grupo,
    deliveryPosition:  cota.posicao,
    estimatedDelivery: cota.dataEntrega,
    installmentValue:  cota.valorParcela,
    installmentCount:  cota.numeroPrestacoes,
  },
  passportFile,   // o File do input de passaporte
  selfieFile      // o File do input de selfie
);
```

---

## VALIDAÇÃO

Após implementar, faz um teste completo:

1. Faz um checkout de teste até ao step de upload de documentos
2. Anexa qualquer imagem como passaporte e selfie
3. Submete o step — **não precisas de concluir o pagamento**
4. Abre o Google Drive → pasta `WEKOTA-KYC` → verifica que apareceu
   uma subpasta com o mês e dentro dela uma pasta com o nome do cliente
5. Abre o Google Sheets → aba `KYC` → verifica que apareceu uma linha
   com os dados e os links para os ficheiros no Drive
