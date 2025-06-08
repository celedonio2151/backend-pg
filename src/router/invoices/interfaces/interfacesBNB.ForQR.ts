export interface BodyGetTokenBNB {
  accountId: string;
  authorizationId: string;
}

export interface ReponseGetTokenBNB {
  success: boolean;
  message: string;
}

export interface InvoicePDF {
  ci: number;
  name: string;
  surname: string;
  meter_number: number;
  date: Date;
  beforeMonth: {
    date: Date;
    value: number;
  };
  lasthMonth: {
    date: Date;
    value: number;
  };
  cubicMeters: number;
  balance: number;
  amountDue: number;
  isPaid: boolean;
  status: boolean;
}
