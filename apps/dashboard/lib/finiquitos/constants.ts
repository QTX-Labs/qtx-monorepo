/**
 * Constantes del sistema de finiquitos
 * Basado en legislación laboral mexicana 2025
 */

import { BorderZone } from '@workspace/database';

/**
 * Salarios mínimos 2025 según zona
 */
export const MINIMUM_SALARIES: Record<BorderZone, number> = {
    [BorderZone.FRONTERIZA]: 419.88,
    [BorderZone.NO_FRONTERIZA]: 278.8
};

/**
 * Factor de días para cálculos mensuales
 * Default: 30.4 días (365/12) según Centro de Conciliación
 */
export const DEFAULT_DAYS_FACTOR = 30.4;

/**
 * Días en un año para cálculos proporcionales
 */
export const DAYS_IN_YEAR = 365;

/**
 * Días en un año considerando años bisiestos
 */
export const DAYS_IN_YEAR_WITH_LEAP = 365.25;

/**
 * Valores por defecto de prestaciones
 */
export const DEFAULT_PRESTACIONES = {
    AGUINALDO_DAYS: 15,
    VACATION_DAYS: 12,
    VACATION_PREMIUM: 25 // 25% (se guarda como número entero, se divide entre 100 en los cálculos)
} as const;

/**
 * Decimales para precisión en cálculos
 */
export const DECIMAL_PRECISION = {
    MONEY: 2,
    FACTOR: 4,
    DAYS: 4,
    YEARS: 4
} as const;
