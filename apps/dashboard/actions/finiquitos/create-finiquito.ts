'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@workspace/database/client';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { createFiniquitoSchema } from '~/lib/finiquitos/schemas';
import { calculateFiniquito } from '~/lib/finiquitos/calculate-finiquito';

export const createFiniquito = authOrganizationActionClient
  .metadata({ actionName: 'createFiniquito' })
  .inputSchema(createFiniquitoSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Calcular finiquito
    const calculation = calculateFiniquito({
      hireDate: parsedInput.hireDate,
      terminationDate: parsedInput.terminationDate,
      salary: parsedInput.salary,
      salaryFrequency: parsedInput.salaryFrequency,
      borderZone: parsedInput.borderZone,
      fiscalDailySalary: parsedInput.fiscalDailySalary,
      daysFactor: parsedInput.daysFactor,
      aguinaldoDays: parsedInput.aguinaldoDays,
      vacationDays: parsedInput.vacationDays,
      vacationPremium: parsedInput.vacationPremium,
      pendingVacationDays: parsedInput.pendingVacationDays,
      workedDays: parsedInput.workedDays,
      gratificationType: parsedInput.gratificationType,
      gratificationDays: parsedInput.gratificationDays,
      gratificationPesos: parsedInput.gratificationPesos,
      severanceDays: parsedInput.severanceDays,
      seniorityPremiumDays: parsedInput.seniorityPremiumDays,
      isrAmount: parsedInput.isrAmount,
      imssAmount: parsedInput.imssAmount,
      subsidyAmount: parsedInput.subsidyAmount,
      infonavitAmount: parsedInput.infonavitAmount,
      otherDeductions: parsedInput.otherDeductions
    });

    // Guardar en base de datos
    const finiquito = await prisma.finiquito.create({
      data: {
        organizationId: ctx.organization.id,
        userId: ctx.session.user.id,
        employeeId: parsedInput.employeeId,
        employeeName: parsedInput.employeeName,
        empresaName: ctx.organization.name,
        clientName: ctx.organization.name,
        hireDate: parsedInput.hireDate,
        terminationDate: parsedInput.terminationDate,
        salary: parsedInput.salary,
        salaryFrequency: parsedInput.salaryFrequency,
        borderZone: parsedInput.borderZone,
        fiscalDailySalary: calculation.salaries.fiscalDailySalary,
        realDailySalary: calculation.salaries.realDailySalary,
        integratedDailySalary: calculation.salaries.integratedDailySalary,
        daysFactor: parsedInput.daysFactor,
        daysWorked: calculation.metadata.daysWorked,
        yearsWorked: calculation.metadata.yearsWorked,
        aguinaldoDays: parsedInput.aguinaldoDays,
        vacationDays: parsedInput.vacationDays,
        vacationPremiumPercentage: parsedInput.vacationPremium,
        pendingVacationDays: parsedInput.pendingVacationDays,
        pendingWorkDays: parsedInput.workedDays,
        gratificationDays: calculation.metadata.gratificationDays,
        gratificationPesos: calculation.metadata.gratificationPesos,
        severanceTotalFiscal: calculation.fiscalPerceptions.severanceAmount,
        severanceTotalReal: calculation.realPerceptions.severanceAmount,
        seniorityPremiumFiscal: calculation.fiscalPerceptions.seniorityPremiumAmount,
        seniorityPremiumReal: calculation.realPerceptions.seniorityPremiumAmount,
        // Percepciones Fiscales
        fiscalAguinaldoFactor: calculation.fiscalPerceptions.aguinaldoFactor,
        fiscalAguinaldoAmount: calculation.fiscalPerceptions.aguinaldoAmount,
        fiscalVacationFactor: calculation.fiscalPerceptions.vacationFactor,
        fiscalVacationAmount: calculation.fiscalPerceptions.vacationAmount,
        fiscalVacationPremiumFactor: calculation.fiscalPerceptions.vacationPremiumFactor,
        fiscalVacationPremiumAmount: calculation.fiscalPerceptions.vacationPremiumAmount,
        fiscalPendingVacationAmount: calculation.fiscalPerceptions.pendingVacationAmount,
        fiscalPendingPremiumAmount: calculation.fiscalPerceptions.pendingPremiumAmount,
        fiscalWorkedDaysAmount: calculation.fiscalPerceptions.workedDaysAmount,
        fiscalTotalPerceptions: calculation.fiscalPerceptions.totalPerceptions,
        // Percepciones Reales
        realAguinaldoFactor: calculation.realPerceptions.aguinaldoFactor,
        realAguinaldoAmount: calculation.realPerceptions.aguinaldoAmount,
        realVacationFactor: calculation.realPerceptions.vacationFactor,
        realVacationAmount: calculation.realPerceptions.vacationAmount,
        realVacationPremiumFactor: calculation.realPerceptions.vacationPremiumFactor,
        realVacationPremiumAmount: calculation.realPerceptions.vacationPremiumAmount,
        realPendingVacationAmount: calculation.realPerceptions.pendingVacationAmount,
        realPendingPremiumAmount: calculation.realPerceptions.pendingPremiumAmount,
        realWorkedDaysAmount: calculation.realPerceptions.workedDaysAmount,
        realGratificationAmount: calculation.realPerceptions.gratificationAmount,
        realTotalPerceptions: calculation.realPerceptions.totalPerceptions,
        // Deducciones Fiscales
        fiscalISR: calculation.deductions.isr,
        fiscalIMSS: calculation.deductions.imss,
        fiscalSubsidy: calculation.deductions.subsidy,
        fiscalInfonavit: calculation.deductions.infonavit,
        fiscalOtherDeductions: calculation.deductions.otherDeductions,
        fiscalTotalDeductions: calculation.deductions.totalDeductions,
        // Deducciones Reales (generalmente $0)
        realISR: 0,
        realIMSS: 0,
        realSubsidy: 0,
        realInfonavit: 0,
        realOtherDeductions: 0,
        realTotalDeductions: 0,
        // Totales
        fiscalNetAmount: calculation.totals.netPayFiscal,
        realNetAmount: calculation.totals.netPayReal,
        totalToPay: calculation.totals.netPayTotal
      }
    });

    // Revalidar la página de finiquitos
    revalidatePath(
      replaceOrgSlug(
        routes.dashboard.organizations.slug.Finiquitos,
        ctx.organization.slug
      )
    );

    return { finiquitoId: finiquito.id };
  });
