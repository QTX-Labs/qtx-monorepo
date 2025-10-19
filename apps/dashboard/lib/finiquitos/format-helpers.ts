import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Formatea un número como moneda mexicana (MXN)
 */
export function formatCurrency(amount: number | Decimal | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';

  const numericAmount = typeof amount === 'number' ? amount : Number(amount);

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Formatea un número con decimales especificados
 */
export function formatNumber(num: number | Decimal | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined) return '0.00';

  const numericValue = typeof num === 'number' ? num : Number(num);

  return numericValue.toFixed(decimals);
}

/**
 * Formatea una fecha en formato largo en español
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd MMMM yyyy', { locale: es });
  } catch {
    return '-';
  }
}

/**
 * Formatea una fecha en formato corto (dd/MM/yyyy)
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy');
  } catch {
    return '-';
  }
}

/**
 * Calcula la antigüedad en años a partir de dos fechas
 */
export function calculateYearsOfService(hireDate: Date, terminationDate: Date): number {
  const diff = terminationDate.getTime() - hireDate.getTime();
  const years = diff / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, years);
}

/**
 * Calcula los días trabajados entre dos fechas
 */
export function calculateDaysWorked(hireDate: Date, terminationDate: Date): number {
  const diff = terminationDate.getTime() - hireDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  return Math.max(0, days);
}
