import { z } from 'zod';
import { BorderZone, SalaryFrequency } from '@workspace/database';
import { MINIMUM_SALARIES } from '../constants';

/**
 * Schema para Paso 1: Configuración Base
 *
 * Este schema valida los datos iniciales que el usuario ingresa antes de calcular los factores:
 * - Datos Básicos del empleado y empresa
 * - Factores Fiscales (fechas, salarios)
 * - Factores de Complemento (opcional, toggle)
 * - Prestaciones Superiores de Ley
 * - Beneficios Fiscales
 * - Beneficios de Complemento
 * - Liquidación (toggle)
 */
export const step1BaseConfigSchema = z.object({
  // ===== DATOS BÁSICOS =====
  employeeName: z.string().min(1, 'El nombre del empleado es requerido'),
  employeePosition: z.string().min(1, 'El puesto del empleado es requerido'),
  employeeRFC: z.string()
    .min(1, 'El RFC del empleado es requerido')
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido. Formato: AAAA123456XXX (12-13 caracteres)'),
  employeeCURP: z.string()
    .min(1, 'La CURP del empleado es requerida')
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, 'CURP inválida. Debe tener 18 caracteres'),
  employeeId: z.string().optional(), // Si se selecciona desde lista de empleados
  customFiniquitoIdentifier: z.string()
    .max(20, 'El identificador no puede exceder 20 caracteres')
    .optional(),

  // Datos de la Empresa
  empresaName: z.string().min(1, 'El nombre de la empresa es requerido'),
  empresaRFC: z.string()
    .min(1, 'El RFC de la empresa es requerido')
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido. Formato: ABC123456XXX (12-13 caracteres)'),
  empresaMunicipio: z.string().optional(),
  empresaEstado: z.string().optional(),
  clientName: z.string().min(1, 'El nombre del cliente es requerido'),

  // ===== FACTORES FISCALES =====
  hireDate: z.coerce.date({ required_error: 'La fecha de ingreso fiscal es requerida' }),
  terminationDate: z.coerce.date({ required_error: 'La fecha de baja es requerida' }),

  // Salario Diario Fiscal - Auto-calculado según zona fronteriza
  // NO_FRONTERIZA: 278.80 | FRONTERIZA: 419.88
  fiscalDailySalary: z.coerce.number().min(0, 'El salario diario fiscal no puede ser negativo'),

  // Salario Diario Integrado - Auto-calculado usando factor de integración
  // SDI = Salario Fiscal × Factor de Integración
  integratedDailySalary: z.coerce.number().min(0, 'El salario diario integrado no puede ser negativo'),

  // Factor de Integración - Auto-calculado (solo para mostrar en UI)
  integrationFactor: z.coerce.number().min(0, 'El factor de integración no puede ser negativo').optional(),

  // Frecuencia de Pago - Usado en la sección de Complemento para calcular salario diario
  salaryFrequency: z.nativeEnum(SalaryFrequency).default(SalaryFrequency.MONTHLY),

  borderZone: z.nativeEnum(BorderZone, {
    required_error: 'La zona fronteriza es requerida'
  }),

  // ===== PRESTACIONES SUPERIORES DE LEY =====
  aguinaldoDays: z.coerce.number()
    .min(15, 'Los días de aguinaldo no pueden ser menores a 15 (mínimo de ley)')
    .default(15),

  // Días de Vacaciones - Auto-calculado según antigüedad (LFT 2023)
  // Se calcula con getEmployeeVacationDays(hireDate, terminationDate)
  vacationDays: z.coerce.number()
    .default(12),
  vacationPremiumPercentage: z.coerce.number()
    .min(25, 'La prima vacacional no puede ser menor a 25% (mínimo de ley)')
    .max(100, 'La prima vacacional no puede ser mayor a 100%')
    .default(25),

  // ===== FACTORES DE COMPLEMENTO (OPCIONAL) =====
  complementoActivado: z.boolean().default(false),
  realHireDate: z.coerce.date().optional(),

  // Salario Real (según frecuencia de pago) - El usuario ingresa este valor
  realSalary: z.coerce.number().min(0, 'El salario real no puede ser negativo').optional(),

  // Salario Diario Real - Auto-calculado según realSalary y salaryFrequency
  realDailySalary: z.coerce.number().min(0, 'El salario diario real no puede ser negativo').optional(),

  daysFactor: z.coerce.number()
    .positive('El factor de días debe ser mayor a 0')
    .default(30.4), // 365/12 = 30.4

  // Salario Diario Integrado Complemento - Auto-calculado usando factor de integración
  // SDI Complemento = Salario Real × Factor de Integración Complemento
  complementIntegratedDailySalary: z.coerce.number().min(0, 'El salario diario integrado complemento no puede ser negativo').optional(),

  // Factor de Integración Complemento - Auto-calculado (solo para mostrar en UI)
  complementIntegrationFactor: z.coerce.number().min(0, 'El factor de integración complemento no puede ser negativo').optional(),

  // ===== LIQUIDACIÓN (OPCIONAL) =====
  liquidacionActivada: z.boolean().default(false),

  // ===== MODIFICACIÓN DEL FACTOR DE DÍAS =====
  daysFactorModified: z.boolean().default(false),
  daysFactorModificationReason: z.string().optional(),

  // ===== PERMITIR SALARIO MENOR AL MÍNIMO =====
  allowBelowMinimumSalary: z.boolean().default(false),
})
  // ===== VALIDACIONES CRUZADAS =====
  .refine(
    (data) => data.terminationDate >= data.hireDate,
    {
      message: 'La fecha de baja debe ser posterior o igual a la fecha de ingreso',
      path: ['terminationDate']
    }
  )
  .refine(
    (data) => {
      // Si complemento está activado, realHireDate es requerida
      if (data.complementoActivado && !data.realHireDate) {
        return false;
      }
      return true;
    },
    {
      message: 'La fecha de ingreso real es requerida cuando el complemento está activado',
      path: ['realHireDate']
    }
  )
  .refine(
    (data) => {
      // Si complemento está activado, realSalary es requerido y debe ser mayor a 0
      // Si complemento NO está activado, ignorar validación (permitir 0 o undefined)
      if (data.complementoActivado && (!data.realSalary || data.realSalary <= 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'El salario real es requerido cuando el complemento está activado',
      path: ['realSalary']
    }
  )
  .refine(
    (data) => {
      // Si complemento está activado, realDailySalary debe ser mayor a 0
      // Si complemento NO está activado, ignorar validación (permitir 0 o undefined)
      if (data.complementoActivado && (!data.realDailySalary || data.realDailySalary <= 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'El salario diario real debe ser mayor a 0 cuando el complemento está activado',
      path: ['realDailySalary']
    }
  )
  .refine(
    (data) => {
      // Si daysFactorModified es true Y daysFactor !== 30.4, entonces reason es requerido
      if (data.daysFactorModified && data.daysFactor !== 30.4 && !data.daysFactorModificationReason) {
        return false;
      }
      return true;
    },
    {
      message: 'La razón de modificación es requerida cuando se modifica el factor de días',
      path: ['daysFactorModificationReason']
    }
  )
  .refine(
    (data) => {
      // Si el usuario permite salario menor al mínimo, omitir validación
      if (data.allowBelowMinimumSalary) {
        return true;
      }
      // El salario diario fiscal debe ser al menos el mínimo según zona fronteriza
      const minimum = MINIMUM_SALARIES[data.borderZone];
      return data.fiscalDailySalary >= minimum;
    },
    (data) => ({
      message: `El salario diario fiscal no puede ser menor a $${MINIMUM_SALARIES[data.borderZone].toFixed(2)} (mínimo para zona ${data.borderZone === BorderZone.FRONTERIZA ? 'fronteriza' : 'no fronteriza'})`,
      path: ['fiscalDailySalary']
    })
  );

export type Step1BaseConfig = z.infer<typeof step1BaseConfigSchema>;
