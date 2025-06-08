/**
 * Convierte año y mes a un número total de meses para facilitar la comparación.
 * @param year Año en formato numérico (ej: 2024)
 * @param month Mes en formato numérico (0 para enero, 11 para diciembre)
 * @returns Número total de meses desde el año 0
 */
function toTotalMonths(year: number, month: number): number {
  return year * 12 + month;
}

/**
 * Verifica si la nueva lectura es secuencial (es decir, ocurre el mes siguiente).
 * @param lastDate Fecha de la última lectura
 * @param currentDate Fecha de la lectura actual
 * @returns true si es secuencial, false si no
 */
export function sequentialMonth(lastDate: Date, currentDate: Date): boolean {
  const last = toTotalMonths(lastDate.getFullYear(), lastDate.getMonth());
  const current = toTotalMonths(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );

  return current === last + 1;
}
