import { z } from 'zod';
import { BorderZone, SalaryFrequency } from '@workspace/database';
import { step1BaseConfigSchema } from './step1-base-config-schema';
import { step2FactorsSchema } from './step2-factors-schema';
import { step3DeductionsSchema } from './step3-deductions-schema';

/**
 * Schema para Paso 4: Revisión Final
 *
 * Este schema combina todos los pasos anteriores para validación final antes de guardar.
 * Incluye:
 * - Datos de Paso 1 (configuración base)
 * - Datos de Paso 2 (factores calculados)
 * - Datos de Paso 3 (deducciones manuales + ISR editable)
 *
 * Este es el schema que se usa en la server action `createFiniquito`.
 */
export const step4ReviewSchema = z.intersection(
  step1BaseConfigSchema,
  z.intersection(
    step2FactorsSchema,
    step3DeductionsSchema
  )
);

export type Step4Review = z.infer<typeof step4ReviewSchema>;

/**
 * Schema para actualizar finiquito
 * Todos los campos son opcionales para permitir actualizaciones parciales
 *
 * Note: This is a relaxed schema for updates. Only the provided fields will be validated.
 */
export const updateFiniquitoSchema = z.object({
  // Campos de step1 (todos opcionales)
  employeeName: z.string().min(1).optional(),
  employeePosition: z.string().optional(),
  employeeRFC: z.string().optional(),
  employeeCURP: z.string().optional(),
  employeeId: z.string().optional(),
  empresaName: z.string().optional(),
  empresaRFC: z.string().optional(),
  empresaMunicipio: z.string().optional(),
  empresaEstado: z.string().optional(),
  clientName: z.string().optional(),
  hireDate: z.coerce.date().optional(),
  terminationDate: z.coerce.date().optional(),
  fiscalDailySalary: z.coerce.number().positive().optional(),
  integratedDailySalary: z.coerce.number().positive().optional(),
  salaryFrequency: z.nativeEnum(SalaryFrequency).optional(),
  borderZone: z.nativeEnum(BorderZone).optional(),
  aguinaldoDays: z.coerce.number().optional(),
  vacationDays: z.coerce.number().optional(),
  vacationPremiumPercentage: z.coerce.number().optional(),
  complementoActivado: z.boolean().optional(),
  realHireDate: z.coerce.date().optional(),
  realDailySalary: z.coerce.number().optional(),
  daysFactor: z.coerce.number().optional(),
  liquidacionActivada: z.boolean().optional(),
  daysFactorModified: z.boolean().optional(),
  daysFactorModificationReason: z.string().optional(),
}).merge(step2FactorsSchema.partial()).merge(step3DeductionsSchema.partial());

export type UpdateFiniquitoInput = z.infer<typeof updateFiniquitoSchema>;
