export class CreateBankDto {}

export class TokenRequestDto {
  accountId: string;
  authorizationId: string;
}

export class GenerateQrDto {
  currency: string; // "BOB"
  gloss: string; // Descripción
  amount: number;
  singleUse: boolean;
  expirationDate: string; // "YYYY-MM-DD"
  additionalData: string;
  destinationAccountId: string;
}
