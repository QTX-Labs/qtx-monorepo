import type { Finiquito } from '@workspace/database';
import type { Step1BaseConfig } from './schemas/step1-base-config-schema';
import type { Step2Factors } from './schemas/step2-factors-schema';
import type { Step3Deductions } from './schemas/step3-deductions-schema';

/**
 * Maps a Finiquito from the database to Step 1 wizard format
 *
 * Handles:
 * - Decimal to number conversions
 * - Custom identifier truncation: truncate original to 15 chars + append "-copy"
 * - Date conversions (database Date → form Date)
 * - Optional complemento and liquidación fields
 */
export function mapFiniquitoToStep1(finiquito: Finiquito): Step1BaseConfig {
  // Handle custom identifier: truncate to 15 chars and append "-copy"
  const originalIdentifier = finiquito.customFiniquitoIdentifier;
  const duplicatedIdentifier = originalIdentifier
    ? `${originalIdentifier.slice(0, 15)}-copy`
    : undefined;

  return {
    // Datos básicos del empleado
    employeeName: finiquito.employeeName,
    employeePosition: finiquito.employeePosition || '',
    employeeRFC: finiquito.employeeRFC,
    employeeCURP: finiquito.employeeCURP,
    employeeId: finiquito.employeeId || undefined,
    customFiniquitoIdentifier: duplicatedIdentifier,

    // Datos de la empresa
    empresaName: finiquito.empresaName,
    empresaRFC: finiquito.empresaRFC || '',
    empresaMunicipio: finiquito.empresaMunicipio || undefined,
    empresaEstado: finiquito.empresaEstado || undefined,
    clientName: finiquito.clientName,

    // Factores fiscales
    hireDate: finiquito.hireDate,
    terminationDate: finiquito.terminationDate,
    fiscalDailySalary: finiquito.fiscalDailySalary.toNumber(),
    integratedDailySalary: finiquito.integratedDailySalary.toNumber(),
    integrationFactor: finiquito.integrationFactor?.toNumber() || undefined,
    borderZone: finiquito.borderZone,
    salaryFrequency: finiquito.salaryFrequency,

    // Prestaciones superiores de ley
    aguinaldoDays: finiquito.aguinaldoDays,
    vacationDays: finiquito.vacationDays,
    vacationPremiumPercentage: finiquito.vacationPremiumPercentage.toNumber(),

    // Complemento (opcional)
    complementoActivado: finiquito.complementoActivado,
    realHireDate: finiquito.realHireDate || undefined,
    realSalary: finiquito.realSalary?.toNumber() || undefined,
    realDailySalary: finiquito.realDailySalary?.toNumber() || 0,
    daysFactor: 30.4, // Default value
    complementIntegratedDailySalary: finiquito.complementIntegratedDailySalary?.toNumber() || undefined,
    complementIntegrationFactor: finiquito.complementIntegrationFactor?.toNumber() || undefined,

    // Liquidación (opcional)
    liquidacionActivada: finiquito.liquidacionActivada,

    // Modificación del factor de días
    daysFactorModified: false,
    daysFactorModificationReason: undefined,
  };
}

/**
 * Maps a Finiquito from the database to Step 2 wizard format
 *
 * Handles:
 * - Decimal to number conversions
 * - Version 2 field mapping (factorXXXFiniquito, factorXXXComplemento, etc.)
 * - Optional liquidación and complemento factors
 * - Gratification configuration
 * - Pending benefits
 */
export function mapFiniquitoToStep2(finiquito: Finiquito): Step2Factors {
  const result: Step2Factors = {
    // Factores de Finiquito (siempre presentes)
    factoresFiniquito: {
      diasTrabajados: finiquito.factorDiasTrabajadosFiniquito?.toNumber() || 0,
      septimoDia: finiquito.factorSeptimoDiaFiniquito?.toNumber() || 0,
      vacaciones: finiquito.factorVacacionesFiniquito?.toNumber() || 0,
      primaVacacional: finiquito.factorPrimaVacacionalFiniquito?.toNumber() || 0,
      aguinaldo: finiquito.factorAguinaldoFiniquito?.toNumber() || 0,
    },

    // Factores de Liquidación (opcional)
    factoresLiquidacion: finiquito.liquidacionActivada
      ? {
          indemnizacion90Dias: finiquito.factorIndemnizacion90Dias?.toNumber() || 0,
          indemnizacion20Dias: finiquito.factorIndemnizacion20Dias?.toNumber() || 0,
          primaAntiguedad: finiquito.factorPrimaAntiguedad?.toNumber() || 0,
        }
      : undefined,

    // Factores de Complemento (opcional)
    factoresComplemento: finiquito.complementoActivado
      ? {
          diasTrabajados: finiquito.factorDiasTrabajadosComplemento?.toNumber() || 0,
          septimoDia: finiquito.factorSeptimoDiaComplemento?.toNumber() || 0,
          vacaciones: finiquito.factorVacacionesComplemento?.toNumber() || 0,
          primaVacacional: finiquito.factorPrimaVacacionalComplemento?.toNumber() || 0,
          aguinaldo: finiquito.factorAguinaldoComplemento?.toNumber() || 0,
        }
      : undefined,

    // Factores de Liquidación Complemento (opcional)
    factoresLiquidacionComplemento:
      finiquito.liquidacionActivada && finiquito.complementoActivado
        ? {
            indemnizacion90Dias: finiquito.factorIndemnizacion90DiasComplemento?.toNumber() || 0,
            indemnizacion20Dias: finiquito.factorIndemnizacion20DiasComplemento?.toNumber() || 0,
            primaAntiguedad: finiquito.factorPrimaAntiguedadComplemento?.toNumber() || 0,
          }
        : undefined,

    // Configuración adicional (gratificación)
    configuracionAdicional:
      finiquito.gratificationDays || finiquito.gratificationPesos
        ? {
            gratificacionDias: finiquito.gratificationDays?.toNumber() || undefined,
            gratificacionPesos: finiquito.gratificationPesos?.toNumber() || undefined,
          }
        : undefined,

    // Beneficios fiscales pendientes
    beneficiosFiscalesPendientes:
      finiquito.pendingVacationDays || finiquito.pendingVacationPremiumDays
        ? {
            pendingVacationDays: finiquito.pendingVacationDays,
            pendingVacationPremium: finiquito.pendingVacationPremiumDays || 0,
          }
        : undefined,

    // Beneficios de complemento pendientes
    beneficiosComplementoPendientes:
      finiquito.complementPendingVacationDays || finiquito.complementPendingVacationPremiumDays
        ? {
            complementPendingVacationDays: finiquito.complementPendingVacationDays || 0,
            complementPendingVacationPremium: finiquito.complementPendingVacationPremiumDays || 0,
          }
        : undefined,
  };

  return result;
}

/**
 * Maps a Finiquito from the database to Step 3 wizard format
 *
 * Handles:
 * - Decimal to number conversions
 * - Version 2 deduction field mapping
 */
export function mapFiniquitoToStep3(finiquito: Finiquito): Step3Deductions {
  return {
    deduccionesManuales: {
      infonavit: finiquito.montoDeduccionInfonavit?.toNumber() || 0,
      fonacot: finiquito.montoDeduccionFonacot?.toNumber() || 0,
      otras: finiquito.montoDeduccionOtrasDeducciones?.toNumber() || 0,
    },
  };
}
