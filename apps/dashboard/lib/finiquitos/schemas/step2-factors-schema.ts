/**
 * Step 2 Factors Schema - Editable Calculated Factors
 *
 * This schema validates the calculated factors (in days) that are presented
 * to the user in Step 2 for review and editing before proceeding to Step 3.
 *
 * DATA FLOW:
 * 1. Step 1 → calculateFiniquitoComplete() → returns initial factors
 * 2. Step 1 calls updateStep2() with calculated factors
 * 3. Step 2 form pre-populated with these values
 * 4. User can edit any factor before continuing
 * 5. Edited factors trigger live calculation via useLiveCalculation hook
 *
 * FACTOR SECTIONS:
 * - factoresFiniquito: Always present (fiscal settlement)
 * - factoresLiquidacion: Optional if liquidacionActivada = true
 * - factoresComplemento: Optional if complementoActivado = true
 * - factoresLiquidacionComplemento: Optional if both liquidación AND complemento enabled
 * - configuracionAdicional: Optional extras (gratificación)
 * - beneficiosFiscalesPendientes: Pending benefits (vacation days/premium)
 * - beneficiosComplementoPendientes: Pending complement benefits
 *
 * IMPORTANT - PRIMA VACACIONAL:
 * The primaVacacional field stores the FACTOR (percentage as decimal),
 * not the vacation days. This is intentional to match the calculator output.
 * Example: 0.24 means 24% has been applied to vacation days.
 *
 * When passing to ConceptosFiniquito for calculation, we use vacation days
 * instead, so the percentage is applied by calcularPrimaVacacional().
 * See calculate-finiquito-complete.ts lines 303-321 for implementation.
 *
 * RELATED:
 * - See /apps/dashboard/components/organizations/slug/finiquitos/create/steps/step2-factors.tsx for UI
 * - See /apps/dashboard/lib/finiquitos/calculate-finiquito-complete.ts for calculation
 */

import { z } from 'zod';

/**
 * Schema para Paso 2: Factores Calculados
 *
 * Este schema valida los factores (en días) que han sido calculados por la calculadora
 * pero que el usuario puede editar si es necesario antes de proceder al paso 3.
 *
 * Los factores se organizan en 3 secciones:
 * - Finiquito (siempre presente)
 * - Liquidación (opcional, si liquidacionActivada = true)
 * - Complemento (opcional, si complementoActivado = true)
 */

// Factores de Finiquito (siempre presentes)
const factoresFiniquitoSchema = z.object({
  diasTrabajados: z.coerce.number()
    .nonnegative('Los días trabajados no pueden ser negativos'),
  septimoDia: z.coerce.number()
    .nonnegative('El séptimo día no puede ser negativo'),
  vacaciones: z.coerce.number()
    .nonnegative('Las vacaciones no pueden ser negativas'),
  primaVacacional: z.coerce.number()
    .nonnegative('La prima vacacional no puede ser negativa'),
  aguinaldo: z.coerce.number()
    .nonnegative('El aguinaldo no puede ser negativo'),
});

// Factores de Liquidación (opcionales)
const factoresLiquidacionSchema = z.object({
  indemnizacion90Dias: z.coerce.number()
    .nonnegative('La indemnización 90 días no puede ser negativa'),
  indemnizacion20Dias: z.coerce.number()
    .nonnegative('La indemnización 20 días no puede ser negativa'),
  primaAntiguedad: z.coerce.number()
    .nonnegative('La prima de antigüedad no puede ser negativa'),
}).optional();

// Factores de Complemento (opcionales, misma estructura que Finiquito)
const factoresComplementoSchema = z.object({
  diasTrabajados: z.coerce.number()
    .nonnegative('Los días trabajados no pueden ser negativos'),
  septimoDia: z.coerce.number()
    .nonnegative('El séptimo día no puede ser negativo'),
  vacaciones: z.coerce.number()
    .nonnegative('Las vacaciones no pueden ser negativas'),
  primaVacacional: z.coerce.number()
    .nonnegative('La prima vacacional no puede ser negativa'),
  aguinaldo: z.coerce.number()
    .nonnegative('El aguinaldo no puede ser negativo'),
}).optional();

// Factores de Liquidación de Complemento (opcionales, misma estructura que Liquidación Fiscal)
const factoresLiquidacionComplementoSchema = z.object({
  indemnizacion90Dias: z.coerce.number()
    .nonnegative('La indemnización 90 días no puede ser negativa'),
  indemnizacion20Dias: z.coerce.number()
    .nonnegative('La indemnización 20 días no puede ser negativa'),
  primaAntiguedad: z.coerce.number()
    .nonnegative('La prima de antigüedad no puede ser negativa'),
}).optional();

// Configuración Adicional (opcional)
const configuracionAdicionalSchema = z.object({
  gratificacionDias: z.coerce.number()
    .nonnegative('Los días de gratificación no pueden ser negativos')
    .optional(),
  gratificacionPesos: z.coerce.number()
    .nonnegative('La gratificación en pesos no puede ser negativa')
    .optional(),
}).optional();

// Beneficios Fiscales Pendientes
const beneficiosFiscalesPendientesSchema = z.object({
  pendingVacationDays: z.coerce.number()
    .nonnegative('Los días de vacaciones pendientes no pueden ser negativos'),
  pendingVacationPremium: z.coerce.number()
    .nonnegative('La prima vacacional pendiente no puede ser negativa'),
}).optional();

// Beneficios de Complemento Pendientes (opcionales)
const beneficiosComplementoPendientesSchema = z.object({
  complementPendingVacationDays: z.coerce.number()
    .nonnegative('Los días de vacaciones pendientes de complemento no pueden ser negativos'),
  complementPendingVacationPremium: z.coerce.number()
    .nonnegative('La prima vacacional pendiente de complemento no puede ser negativa'),
}).optional();

export const step2FactorsSchema = z.object({
  factoresFiniquito: factoresFiniquitoSchema,
  factoresLiquidacion: factoresLiquidacionSchema,
  factoresComplemento: factoresComplementoSchema,
  factoresLiquidacionComplemento: factoresLiquidacionComplementoSchema,
  configuracionAdicional: configuracionAdicionalSchema,
  beneficiosFiscalesPendientes: beneficiosFiscalesPendientesSchema,
  beneficiosComplementoPendientes: beneficiosComplementoPendientesSchema,
});

export type Step2Factors = z.infer<typeof step2FactorsSchema>;
export type FactoresFiniquito = z.infer<typeof factoresFiniquitoSchema>;
export type FactoresLiquidacion = z.infer<typeof factoresLiquidacionSchema>;
export type FactoresComplemento = z.infer<typeof factoresComplementoSchema>;
export type FactoresLiquidacionComplemento = z.infer<typeof factoresLiquidacionComplementoSchema>;
export type ConfiguracionAdicional = z.infer<typeof configuracionAdicionalSchema>;
export type BeneficiosFiscalesPendientes = z.infer<typeof beneficiosFiscalesPendientesSchema>;
export type BeneficiosComplementoPendientes = z.infer<typeof beneficiosComplementoPendientesSchema>;
