'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@workspace/database/client';
import { SalaryFrequency } from '@workspace/database';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { step4ReviewSchema } from '~/lib/finiquitos/schemas/step4-review-schema';
import { calculateFiniquitoComplete } from '~/lib/finiquitos/calculate-finiquito-complete';
import { mapCalculationToPrisma } from './helpers/map-calculation';

export const createFiniquito = authOrganizationActionClient
  .metadata({ actionName: 'createFiniquito' })
  .inputSchema(step4ReviewSchema)
  .action(async ({ parsedInput, ctx }) => {
    console.log('[createFiniquito] START - Input recibido:', JSON.stringify(parsedInput, null, 2));

    // Preparar input para cálculo
    console.log('[createFiniquito] Preparando input para calculateFiniquitoComplete...');
    const calculation = calculateFiniquitoComplete({
      employeeId: parsedInput.employeeId,
      hireDate: parsedInput.hireDate,
      terminationDate: parsedInput.terminationDate,
      fiscalDailySalary: parsedInput.fiscalDailySalary,
      integratedDailySalary: parsedInput.integratedDailySalary,
      borderZone: parsedInput.borderZone,
      salaryFrequency: parsedInput.salaryFrequency ?? SalaryFrequency.MONTHLY,
      aguinaldoDays: parsedInput.aguinaldoDays,
      vacationDays: parsedInput.vacationDays,
      vacationPremiumPercentage: parsedInput.vacationPremiumPercentage,
      pendingVacationDays: parsedInput.beneficiosFiscalesPendientes?.pendingVacationDays ?? 0,
      pendingVacationPremium: parsedInput.beneficiosFiscalesPendientes?.pendingVacationPremium ?? 0,
      complemento: parsedInput.complementoActivado && parsedInput.realHireDate && parsedInput.realDailySalary ? {
        enabled: true,
        realHireDate: parsedInput.realHireDate,
        realDailySalary: parsedInput.realDailySalary,
        complementIntegratedDailySalary: parsedInput.complementIntegratedDailySalary,
        pendingVacationDays: parsedInput.beneficiosComplementoPendientes?.complementPendingVacationDays ?? 0,
        pendingVacationPremium: parsedInput.beneficiosComplementoPendientes?.complementPendingVacationPremium ?? 0,
      } : undefined,
      liquidacion: parsedInput.liquidacionActivada ? { enabled: true } : undefined,
      deduccionesManuales: parsedInput.deduccionesManuales,
      manualFactors: {
        finiquito: parsedInput.factoresFiniquito,
        liquidacion: parsedInput.factoresLiquidacion,
        complemento: parsedInput.factoresComplemento,
        liquidacionComplemento: parsedInput.factoresLiquidacionComplemento,
        configuracionAdicional: parsedInput.configuracionAdicional,
      },
    });
    console.log('[createFiniquito] Cálculo completado:', {
      totalAPagar: calculation.totales.totalAPagar,
      isrTotal: calculation.deducciones.isrTotal,
    });

    // Mapear resultados de cálculo a campos de Prisma
    const calculatedFields = mapCalculationToPrisma(calculation);

    // Guardar en base de datos
    console.log('[createFiniquito] Intentando guardar en BD...');

    try {
      const finiquito = await prisma.finiquito.create({
        data: {
          // Relaciones
          organizationId: ctx.organization.id,
          userId: ctx.session.user.id,
          employeeId: parsedInput.employeeId ?? null,

          // Datos básicos del empleado (snapshot)
          // IMPORTANTE: employeeRFC y employeeCURP son requeridos para PDF y vista de detalle
          employeeName: parsedInput.employeeName,
          employeeRFC: parsedInput.employeeRFC,
          employeeCURP: parsedInput.employeeCURP,
          customFiniquitoIdentifier: parsedInput.customFiniquitoIdentifier ?? null,
          employeePosition: parsedInput.employeePosition ?? null,
          empresaName: parsedInput.empresaName,
          empresaRFC: parsedInput.empresaRFC || null,
          empresaMunicipio: parsedInput.empresaMunicipio ?? null,
          empresaEstado: parsedInput.empresaEstado ?? null,
          clientName: parsedInput.clientName,

          // Datos salariales
          hireDate: parsedInput.hireDate,
          terminationDate: parsedInput.terminationDate,
          salary: parsedInput.fiscalDailySalary, // Usar fiscal como base
          salaryFrequency: parsedInput.salaryFrequency ?? SalaryFrequency.MONTHLY,
          borderZone: parsedInput.borderZone,
          fiscalDailySalary: parsedInput.fiscalDailySalary,
          integrationFactor: parsedInput.integrationFactor ?? null,
          realDailySalary: parsedInput.realDailySalary ?? parsedInput.fiscalDailySalary,
          realSalary: parsedInput.realSalary ?? null,
          integratedDailySalary: parsedInput.integratedDailySalary,
          complementIntegrationFactor: parsedInput.complementIntegrationFactor ?? null,
          complementIntegratedDailySalary: parsedInput.complementIntegratedDailySalary ?? null,
          realHireDate: parsedInput.realHireDate ?? null,
          pendingWorkDays: 0, // No se usa en nueva estructura

          // Prestaciones
          aguinaldoDays: parsedInput.aguinaldoDays,
          vacationDays: parsedInput.vacationDays,
          vacationPremiumPercentage: parsedInput.vacationPremiumPercentage,
          pendingVacationDays: parsedInput.beneficiosFiscalesPendientes?.pendingVacationDays ?? 0,
          pendingVacationPremiumDays: parsedInput.beneficiosFiscalesPendientes?.pendingVacationPremium ?? 0,
          complementPendingVacationDays: parsedInput.beneficiosComplementoPendientes?.complementPendingVacationDays ?? 0,
          complementPendingVacationPremiumDays: parsedInput.beneficiosComplementoPendientes?.complementPendingVacationPremium ?? 0,

          // Toggles de activación
          liquidacionActivada: parsedInput.liquidacionActivada,
          complementoActivado: parsedInput.complementoActivado,

          // Modificación del factor de días
          daysFactorModified: parsedInput.daysFactorModified,
          daysFactorModificationReason: parsedInput.daysFactorModificationReason ?? null,

          // Gratificación (configuración adicional)
          gratificationDays: parsedInput.configuracionAdicional?.gratificacionDias ?? null,
          gratificationPesos: parsedInput.configuracionAdicional?.gratificacionPesos ?? null,
          realGratificationAmount: parsedInput.configuracionAdicional?.gratificacionPesos ?? 0,

          // Versión (importante: 2 para nueva estructura)
          version: 2,

          // Campos calculados (factores, montos, ISR, totales, incluye daysFactor en metadata)
          ...calculatedFields,
        }
      });
      console.log('[createFiniquito] ✅ Finiquito guardado exitosamente:', finiquito.id);

      // Revalidar la página de finiquitos
      revalidatePath(
        replaceOrgSlug(
          routes.dashboard.organizations.slug.Finiquitos,
          ctx.organization.slug
        )
      );

      console.log('[createFiniquito] SUCCESS - Retornando ID:', finiquito.id);
      return { finiquitoId: finiquito.id };
    } catch (error) {
      console.error('[createFiniquito] ❌ ERROR al guardar en BD:', error);
      console.error('[createFiniquito] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      throw error;
    }
  });
