/**
 * Test del motor de cálculo con el ejemplo del cliente
 *
 * Datos del Excel de referencia:
 * - Empleado: 29 días laborados
 * - Salario Mensual Real: $12,999.90
 * - SDF: $278.80
 * - Aguinaldo: 15 días
 * - Vacaciones: 12 días
 * - Prima Vacacional: 25%
 *
 * Resultados esperados:
 * - Neto Fiscal: $663.04
 * - Neto Real: $1,031.33
 * - Total a Pagar: $1,694.37
 */

import { SalaryFrequency, BorderZone } from '@workspace/database';
import { calculateFiniquito } from './calculate-finiquito';

export function runTestExample() {
  console.log('=== TEST DEL MOTOR DE FINIQUITOS ===\n');

  const testInput = {
    // Datos básicos
    hireDate: new Date('2025-01-01'),
    terminationDate: new Date('2025-01-29'), // 29 días

    // Datos salariales
    salary: 12999.90, // Mensual
    salaryFrequency: SalaryFrequency.MONTHLY,
    borderZone: BorderZone.NO_FRONTERIZA,
    fiscalDailySalary: 278.80, // Salario mínimo

    // Prestaciones (defaults)
    aguinaldoDays: 15,
    vacationDays: 12,
    vacationPremium: 0.25,

    // Sin gratificación, vacaciones pendientes, ni indemnización
    pendingVacationDays: 0,
    workedDays: 0,
    gratificationDays: 0,
    severanceDays: 0,
    seniorityPremiumDays: 0,

    // El cliente usa factor de 30 días (no 30.4)
    daysFactor: 30
  };

  const result = calculateFiniquito(testInput);

  console.log('📊 METADATA:');
  console.log(`   Días Laborados: ${result.metadata.daysWorked}`);
  console.log(`   Años Trabajados: ${result.metadata.yearsWorked}`);
  console.log(`   Factor de Días: ${result.metadata.daysFactor}\n`);

  console.log('💰 SALARIOS:');
  console.log(`   Salario Diario Fiscal: $${result.salaries.fiscalDailySalary.toFixed(2)}`);
  console.log(`   Salario Diario Real: $${result.salaries.realDailySalary.toFixed(2)}`);
  console.log(`   SDI (Integrado): $${result.salaries.integratedDailySalary.toFixed(2)}\n`);

  console.log('📈 PERCEPCIONES FISCAL:');
  console.log(`   Aguinaldo (${result.fiscalPerceptions.aguinaldoFactor} días): $${result.fiscalPerceptions.aguinaldoAmount.toFixed(2)}`);
  console.log(`   Vacaciones (${result.fiscalPerceptions.vacationFactor} días): $${result.fiscalPerceptions.vacationAmount.toFixed(2)}`);
  console.log(`   Prima Vac (${result.fiscalPerceptions.vacationPremiumFactor} días): $${result.fiscalPerceptions.vacationPremiumAmount.toFixed(2)}`);
  console.log(`   TOTAL FISCAL: $${result.fiscalPerceptions.totalPerceptions.toFixed(2)}\n`);

  console.log('📈 PERCEPCIONES REAL:');
  console.log(`   Aguinaldo (${result.realPerceptions.aguinaldoFactor} días): $${result.realPerceptions.aguinaldoAmount.toFixed(2)}`);
  console.log(`   Vacaciones (${result.realPerceptions.vacationFactor} días): $${result.realPerceptions.vacationAmount.toFixed(2)}`);
  console.log(`   Prima Vac (${result.realPerceptions.vacationPremiumFactor} días): $${result.realPerceptions.vacationPremiumAmount.toFixed(2)}`);
  console.log(`   TOTAL REAL: $${result.realPerceptions.totalPerceptions.toFixed(2)}\n`);

  console.log('📉 DEDUCCIONES FISCAL:');
  console.log(`   ISR Finiquito: $${result.deductions.isrFiniquito.toFixed(2)}`);
  console.log(`   ISR Art 174: $${result.deductions.isrArt174.toFixed(2)}`);
  console.log(`   ISR Indemnización: $${result.deductions.isrIndemnizacion.toFixed(2)}`);
  console.log(`   TOTAL DEDUCCIONES: $${result.deductions.totalDeductions.toFixed(2)}\n`);

  console.log('💵 NETOS:');
  console.log(`   Neto Fiscal: $${result.fiscalNetAmount.toFixed(2)}`);
  console.log(`   Neto Real: $${result.realNetAmount.toFixed(2)}`);
  console.log(`   ✅ TOTAL A PAGAR: $${result.totalToPay.toFixed(2)}\n`);

  console.log('🎯 VALORES ESPERADOS:');
  console.log(`   Neto Fiscal: $663.04`);
  console.log(`   Neto Real: $1,031.33`);
  console.log(`   Total: $1,694.37\n`);

  // Validar resultados
  const fiscalMatch = Math.abs(result.fiscalNetAmount - 663.04) < 0.5;
  const realMatch = Math.abs(result.realNetAmount - 1031.33) < 0.5;
  const totalMatch = Math.abs(result.totalToPay - 1694.37) < 0.5;

  if (fiscalMatch && realMatch && totalMatch) {
    console.log('✅ TEST PASADO - Los cálculos coinciden con el ejemplo del cliente\n');
  } else {
    console.log('⚠️  ADVERTENCIA - Hay diferencias con el ejemplo del cliente');
    console.log(`   Fiscal: ${fiscalMatch ? '✅' : '❌'}`);
    console.log(`   Real: ${realMatch ? '✅' : '❌'}`);
    console.log(`   Total: ${totalMatch ? '✅' : '❌'}\n`);
  }

  return result;
}

// Ejecutar automáticamente
runTestExample();
