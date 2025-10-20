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

export const step2FactorsSchema = z.object({
  factoresFiniquito: factoresFiniquitoSchema,
  factoresLiquidacion: factoresLiquidacionSchema,
  factoresComplemento: factoresComplementoSchema,
  factoresLiquidacionComplemento: factoresLiquidacionComplementoSchema,
  configuracionAdicional: configuracionAdicionalSchema,
});

export type Step2Factors = z.infer<typeof step2FactorsSchema>;
export type FactoresFiniquito = z.infer<typeof factoresFiniquitoSchema>;
export type FactoresLiquidacion = z.infer<typeof factoresLiquidacionSchema>;
export type FactoresComplemento = z.infer<typeof factoresComplementoSchema>;
export type FactoresLiquidacionComplemento = z.infer<typeof factoresLiquidacionComplementoSchema>;
export type ConfiguracionAdicional = z.infer<typeof configuracionAdicionalSchema>;
