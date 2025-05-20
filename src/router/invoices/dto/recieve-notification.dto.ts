export class ReceiveNotificationDTO {
  QRId: string;
  Gloss: string;
  sourceBankId: number;
  originName: string;
  VoucherId: string;
  TransactionDateTime: string | Date;
  additionalData?: string | any;
}
