import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';
import type { Finiquito } from '@workspace/database';

// Estilos del PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
    color: '#666'
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    padding: 5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingLeft: 10
  },
  label: {
    flex: 1,
    fontSize: 10
  },
  value: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold'
  },
  table: {
    marginTop: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    color: '#fff',
    padding: 8,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 8
  },
  col1: {
    flex: 3
  },
  col2: {
    flex: 2,
    textAlign: 'right'
  },
  col3: {
    flex: 2,
    textAlign: 'right'
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginTop: 5,
    fontWeight: 'bold'
  },
  grandTotal: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: 12,
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold'
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#333'
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40
  },
  signature: {
    textAlign: 'center',
    width: '40%'
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 30,
    paddingTop: 5
  }
});

interface FiniquitoPDFProps {
  finiquito: Finiquito & {
    user: { name: string; email: string | null };
  };
}

export function FiniquitoPDF({ finiquito }: FiniquitoPDFProps) {
  const toNumber = (value: number | null | { toNumber?: () => number }): number => {
    if (value === null) return 0;
    return typeof value === 'number' ? value : value?.toNumber?.() ?? 0;
  };

  const formatCurrency = (amount: number | null | { toNumber?: () => number }) => {
    if (amount === null) return '$0.00';
    const num = toNumber(amount);
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FINIQUITO LABORAL</Text>
          <Text style={styles.subtitle}>Liquidación de Prestaciones y Beneficios</Text>
          <Text style={styles.subtitle}>Folio: {finiquito.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        {/* Datos del Empleado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Empleado</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{finiquito.employeeName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Ingreso:</Text>
            <Text style={styles.value}>{formatDate(finiquito.hireDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Baja:</Text>
            <Text style={styles.value}>{formatDate(finiquito.terminationDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Días Trabajados:</Text>
            <Text style={styles.value}>{finiquito.daysWorked} días</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Años de Servicio:</Text>
            <Text style={styles.value}>{toNumber(finiquito.yearsWorked).toFixed(2)} años</Text>
          </View>
        </View>

        {/* Datos Salariales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Salariales</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Salario Base:</Text>
            <Text style={styles.value}>{formatCurrency(finiquito.salary)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Salario Diario Fiscal:</Text>
            <Text style={styles.value}>{formatCurrency(finiquito.fiscalDailySalary)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Salario Diario Real:</Text>
            <Text style={styles.value}>{formatCurrency(finiquito.realDailySalary)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Salario Diario Integrado:</Text>
            <Text style={styles.value}>{formatCurrency(finiquito.integratedDailySalary)}</Text>
          </View>
        </View>

        {/* Tabla de Percepciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Percepciones</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Concepto</Text>
              <Text style={styles.col2}>Columna Fiscal</Text>
              <Text style={styles.col3}>Columna Real</Text>
            </View>

            {/* Aguinaldo */}
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Aguinaldo</Text>
              <Text style={styles.col2}>{formatCurrency(finiquito.fiscalAguinaldoAmount)}</Text>
              <Text style={styles.col3}>{formatCurrency(finiquito.realAguinaldoAmount)}</Text>
            </View>

            {/* Vacaciones */}
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Vacaciones</Text>
              <Text style={styles.col2}>{formatCurrency(finiquito.fiscalVacationAmount)}</Text>
              <Text style={styles.col3}>{formatCurrency(finiquito.realVacationAmount)}</Text>
            </View>

            {/* Prima Vacacional */}
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Prima Vacacional</Text>
              <Text style={styles.col2}>{formatCurrency(finiquito.fiscalVacationPremiumAmount)}</Text>
              <Text style={styles.col3}>{formatCurrency(finiquito.realVacationPremiumAmount)}</Text>
            </View>

            {/* Días trabajados */}
            {(toNumber(finiquito.fiscalWorkedDaysAmount) > 0 || toNumber(finiquito.realWorkedDaysAmount) > 0) && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Días Trabajados</Text>
                <Text style={styles.col2}>{formatCurrency(finiquito.fiscalWorkedDaysAmount)}</Text>
                <Text style={styles.col3}>{formatCurrency(finiquito.realWorkedDaysAmount)}</Text>
              </View>
            )}

            {/* Gratificación */}
            {toNumber(finiquito.realGratificationAmount) > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Gratificación</Text>
                <Text style={styles.col2}>$0.00</Text>
                <Text style={styles.col3}>{formatCurrency(finiquito.realGratificationAmount)}</Text>
              </View>
            )}

            {/* Indemnización */}
            {(toNumber(finiquito.severanceTotalFiscal) > 0 || toNumber(finiquito.severanceTotalReal) > 0) && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Indemnización</Text>
                <Text style={styles.col2}>{formatCurrency(finiquito.severanceTotalFiscal)}</Text>
                <Text style={styles.col3}>{formatCurrency(finiquito.severanceTotalReal)}</Text>
              </View>
            )}

            {/* Prima de Antigüedad */}
            {(toNumber(finiquito.seniorityPremiumFiscal) > 0 || toNumber(finiquito.seniorityPremiumReal) > 0) && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Prima de Antigüedad</Text>
                <Text style={styles.col2}>{formatCurrency(finiquito.seniorityPremiumFiscal)}</Text>
                <Text style={styles.col3}>{formatCurrency(finiquito.seniorityPremiumReal)}</Text>
              </View>
            )}

            {/* Total Percepciones */}
            <View style={styles.totalRow}>
              <Text style={styles.col1}>Total Percepciones</Text>
              <Text style={styles.col2}>{formatCurrency(finiquito.fiscalTotalPerceptions)}</Text>
              <Text style={styles.col3}>{formatCurrency(finiquito.realTotalPerceptions)}</Text>
            </View>
          </View>
        </View>

        {/* Deducciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deducciones</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.col1}>ISR</Text>
              <Text style={styles.col2}>{formatCurrency(finiquito.fiscalISR)}</Text>
              <Text style={styles.col3}>{formatCurrency(finiquito.realISR)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.col1}>IMSS</Text>
              <Text style={styles.col2}>{formatCurrency(finiquito.fiscalIMSS)}</Text>
              <Text style={styles.col3}>{formatCurrency(finiquito.realIMSS)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Infonavit</Text>
              <Text style={styles.col2}>{formatCurrency(finiquito.fiscalInfonavit)}</Text>
              <Text style={styles.col3}>{formatCurrency(finiquito.realInfonavit)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.col1}>Total Deducciones</Text>
              <Text style={styles.col2}>{formatCurrency(finiquito.fiscalTotalDeductions)}</Text>
              <Text style={styles.col3}>{formatCurrency(finiquito.realTotalDeductions)}</Text>
            </View>
          </View>
        </View>

        {/* Total a Pagar */}
        <View style={styles.section}>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>Neto Fiscal</Text>
            <Text style={styles.col2}>{formatCurrency(finiquito.fiscalNetAmount)}</Text>
            <Text style={styles.col3}></Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>Neto Real</Text>
            <Text style={styles.col2}></Text>
            <Text style={styles.col3}>{formatCurrency(finiquito.realNetAmount)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.col1}>TOTAL A PAGAR</Text>
            <Text style={[styles.col2, styles.col3]}>{formatCurrency(finiquito.totalToPay)}</Text>
          </View>
        </View>

        {/* Firmas */}
        <View style={styles.footer}>
          <View style={styles.signatures}>
            <View style={styles.signature}>
              <View style={styles.signatureLine}>
                <Text>{finiquito.employeeName}</Text>
                <Text style={{ fontSize: 8, marginTop: 5 }}>Empleado</Text>
              </View>
            </View>
            <View style={styles.signature}>
              <View style={styles.signatureLine}>
                <Text>{finiquito.user.name}</Text>
                <Text style={{ fontSize: 8, marginTop: 5 }}>Representante de la Empresa</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pie de página */}
        <View style={{ position: 'absolute', bottom: 20, left: 40, right: 40 }}>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#666' }}>
            Generado el {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' • '} ForHuman - Sistema de Gestión de Finiquitos
          </Text>
        </View>
      </Page>
    </Document>
  );
}
