import { MeterReading } from 'src/router/meter-readings/entities/meter-reading.entity';

export function getFirstLastDayMonth(date: Date) {
  const dateF = new Date(date);
  const startDate = dateF;
  startDate.setUTCDate(1);
  startDate.setUTCHours(0);
  startDate.setUTCMinutes(0);
  startDate.setUTCSeconds(0);
  const endDate = new Date(dateF.getUTCFullYear(), dateF.getUTCMonth() + 1, 0);
  endDate.setUTCHours(23);
  endDate.setUTCMinutes(59);
  endDate.setUTCSeconds(59);
  return { startDate, endDate };
}

export function getFirstLastDayYear(date: Date) {
  const dateF = new Date(date);
  const startDateY = dateF;
  startDateY.setUTCDate(1);
  startDateY.setUTCMonth(0);
  startDateY.setUTCHours(0);
  startDateY.setUTCMinutes(0);
  startDateY.setUTCSeconds(0);
  const endDateY = new Date(date);
  endDateY.setUTCMonth(11);
  endDateY.setUTCHours(23);
  endDateY.setUTCMinutes(59);
  endDateY.setUTCSeconds(59);
  return { startDateY, endDateY };
}

export function helperCalculateBalanceAux(data) {
  return data.reduce(
    (acumulador, item) => {
      if (item.waterMeter.status) {
        acumulador.balanceTotal += item.balance;
        acumulador.cubicMetersTotal += item.cubicMeters;
      }
      return acumulador;
    },
    { balanceTotal: 0, cubicMetersTotal: 0 },
  );
}

export function helperCalculateBalanceAll(data: MeterReading[]): number {
  // Implementa la lógica para calcular el balance
  return data.reduce((acc, reading) => acc + reading.balance, 0);
}

export function calculateBalance(cubicMeters: number) {
  // El saldo debe ser mayor que cero 0
  // if (!cubicMeters) {
  //   return { message: 'Debe enviar un nùmero ?cubic=12 ejemplo  en la url' };
  // }
  if (cubicMeters <= 6) return 20;
  if (cubicMeters > 6 && cubicMeters <= 10) return 20 + 6 * (cubicMeters - 6);
  if (cubicMeters > 10) return 20 + 24 + 14 * (cubicMeters - 10);
}

export function generateCodeNumber(n: number) {
  return String(n).padStart(7, '0');
}

export function sumPaidAmountDue(data) {
  return data.reduce((sum, reading) => {
    if (
      reading.waterMeter.status &&
      reading.invoice?.status &&
      reading.invoice?.isPaid
    ) {
      return sum + reading.invoice.amountDue || 0;
    }
    return sum;
  }, 0);
}

export function sumUnpaidAmountDue(data) {
  return data.reduce((sum, reading) => {
    if (reading.invoice?.status && !reading.invoice?.isPaid) {
      return sum + reading.invoice.amountDue || 0;
    }
    return sum;
  }, 0);
}
