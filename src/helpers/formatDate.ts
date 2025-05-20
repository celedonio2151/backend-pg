import dayjs from 'dayjs';
import "dayjs/locale/es";
dayjs.locale('es');

export function formatDate(datep: string | Date, format = 'dddd DD MMM YYYY'): string {
  const date = dayjs(datep);
  return date.format(format);
}

export function calculateDaysRemaining(startDate: string | Date, endDate: string | Date): string {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const daysDifference = end.diff(start, 'days');

  if (daysDifference >= 1) {
    return `${daysDifference} días restantes`;
  } else {
    const hoursDifference = end.diff(start, 'hours');
    return `${hoursDifference} horas restantes`;
  }
}

// Ejemplo de uso (comentado):
// const startDate = '2023-10-10T19:33:24.103Z';
// const endDate = '2023-10-15T19:33:24.103Z';
// const result = calculateDaysRemaining(startDate, endDate);
// console.log(result);
