# PROMPT DYAD — Ajuste KYC: Upload no momento do anexo, não no pagamento

## CONTEXTO

O sistema de upload de documentos KYC para Google Drive + Google Sheets
já está implementado e funcional. Não alterar nada dessa implementação.

## PROBLEMA

Actualmente o upload para o Drive e o registo na Sheet só acontecem
após confirmação de pagamento. Precisamos que aconteça mais cedo.

## ALTERAÇÃO PRETENDIDA

O disparo da função `uploadKycToGoogle(...)` deve acontecer **imediatamente
quando o cliente submete os documentos** (foto do passaporte + selfie),
independentemente de o pagamento ser concluído ou não.

Se o cliente abandonar o processo após anexar os documentos, os ficheiros
devem já estar no Drive e a linha já deve existir na Sheet.

## O QUE FAZER

1. Localiza o passo do checkout onde o cliente faz upload dos documentos
   (passaporte + selfie) — é o handler de submit desse step específico.

2. Move (ou adiciona) a chamada `uploadKycToGoogle(...)` para esse handler,
   **antes de qualquer transição para o passo de pagamento**.

3. Remove (ou comenta) a chamada anterior se ela estiver no handler
   de confirmação de pagamento.

4. A chamada continua a ser **fire-and-forget** (sem await) —
   nunca bloquear o avanço do utilizador no checkout.

```typescript
// No handler de submit do step de documentos:
// DEPOIS de validar os ficheiros, ANTES de avançar para pagamento:

uploadKycToGoogle(clientData, passportFile, selfieFile); // sem await
// continua normalmente para o próximo passo...
```

## O QUE NÃO ALTERAR

- Os ficheiros `lib/googleDrive.ts`, `lib/googleSheets.ts`, `lib/kycStorage.ts`
  e `app/api/kyc/upload/route.ts` — não tocar em nada.
- O fluxo de pagamento — não alterar.
- O tratamento de erros — mantém silencioso, nunca bloquear o checkout.

## VALIDAÇÃO

Após a alteração, faz um teste:
1. Chega ao passo de upload de documentos no checkout
2. Anexa um passaporte e selfie de teste
3. **Não concluas o pagamento** — abandona o processo
4. Verifica que a pasta do cliente apareceu no Google Drive
5. Verifica que a linha apareceu na Google Sheet com estado "Pendente revisao"
