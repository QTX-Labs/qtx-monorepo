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
import { numeroALetra } from './numero-a-letra';

// Estilos del PDF basados en la plantilla Pug
const styles = StyleSheet.create({
  page: {
    padding: '3cm 2cm',
    fontSize: 12,
    fontFamily: 'Times-Roman',
    textAlign: 'justify'
  },
  center: {
    textAlign: 'center'
  },
  right: {
    textAlign: 'right'
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 1.5
  },
  bold: {
    fontFamily: 'Times-Bold'
  },
  signature: {
    marginTop: 60,
    textAlign: 'center',
    alignItems: 'center'
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '70%',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'center'
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 30
  },
  table: {
    width: '100%',
    marginTop: 16
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0
  },
  tableCell: {
    flex: 1,
    paddingVertical: 4
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
    paddingVertical: 4
  },
  tableCellBold: {
    flex: 1,
    paddingVertical: 4,
    fontFamily: 'Times-Bold'
  },
  tableCellRightBold: {
    flex: 1,
    textAlign: 'right',
    paddingVertical: 4,
    fontFamily: 'Times-Bold'
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
    if (amount === null) return '0.00';
    const num = toNumber(amount);
    return num.toFixed(2);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  };

  const salarioDiario = toNumber(finiquito.fiscalDailySalary);
  const salarioLetra = numeroALetra(salarioDiario);
  const municipio = finiquito.empresaMunicipio || 'CIUDAD DE MÉXICO';
  const puesto = finiquito.employeePosition || 'EMPLEADO';

  // Calcular totales para el recibo de finiquito
  const vacaciones = toNumber(finiquito.realVacationAmount);
  const primaVacacional = toNumber(finiquito.realVacationPremiumAmount);
  const aguinaldo = toNumber(finiquito.realAguinaldoAmount);
  const salariosDevengados = toNumber(finiquito.realWorkedDaysAmount);
  const totalNeto = toNumber(finiquito.totalToPay);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Sección 1: RENUNCIA VOLUNTARIA */}
        <Text style={[styles.center, styles.paragraph]}>
          ASUNTO: RENUNCIA VOLUNTARIA.
        </Text>

        <Text style={styles.paragraph}>
          {finiquito.empresaName}
        </Text>

        <Text style={styles.paragraph}>
          MUNICIPIO DE {municipio}.
        </Text>

        <Text style={[styles.right, styles.paragraph]}>
          P R E S E N T E:
        </Text>

        <Text style={styles.paragraph}>
          POR MEDIO DEL PRESENTE OCURSO, ES MI DESEO RENUNCIAR VOLUNTARIAMENTE A MI EMPLEO,
          Y AL PUESTO DE <Text style={styles.bold}>{puesto}</Text>, QUE VENÍA DESEMPEÑANDO
          DESDE EL {formatDate(finiquito.hireDate)}, ...
        </Text>

        <Text style={styles.paragraph}>
          ... RENUNCIO VOLUNTARIAMENTE A MI ÚLTIMO SALARIO DE ${formatCurrency(finiquito.fiscalDailySalary)}{' '}
          ({salarioLetra} PESOS 00/100 M.N.), ...
        </Text>

        <Text style={[styles.center, styles.paragraph, { marginTop: 20 }]}>
          ATENTAMENTE
        </Text>

        <Text style={[styles.center, styles.paragraph]}>
          {municipio} A {formatDate(finiquito.terminationDate)}
        </Text>

        <View style={styles.signature}>
          <View style={styles.underline} />
          <Text>({finiquito.employeeName})</Text>
        </View>

        {/* Separador */}
        <View style={styles.hr} />

        {/* Sección 2: RECIBO FINIQUITO */}
        <Text style={[styles.center, styles.paragraph, { marginTop: 20 }]}>
          R E C I B O   F I N I Q U I T O
        </Text>

        {/* Tabla de datos del empleado */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Nombre:</Text>
            <Text style={styles.tableCellRight}>{finiquito.employeeName}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Fecha de ingreso:</Text>
            <Text style={styles.tableCellRight}>{formatDate(finiquito.hireDate)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Puesto:</Text>
            <Text style={styles.tableCellRight}>{puesto}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Salario diario:</Text>
            <Text style={styles.tableCellRight}>${formatCurrency(finiquito.fiscalDailySalary)}</Text>
          </View>
        </View>

        {/* Tabla de conceptos de finiquito */}
        <View style={[styles.table, { marginTop: 24 }]}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Parte proporcional de vacaciones 2024–2025</Text>
            <Text style={styles.tableCellRight}>${formatCurrency(vacaciones)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Parte proporcional de prima vacacional</Text>
            <Text style={styles.tableCellRight}>${formatCurrency(primaVacacional)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Aguinaldo proporcional del 2024</Text>
            <Text style={styles.tableCellRight}>${formatCurrency(aguinaldo)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Salarios devengados</Text>
            <Text style={styles.tableCellRight}>${formatCurrency(salariosDevengados)}</Text>
          </View>
          <View style={[styles.tableRow, { marginTop: 8 }]}>
            <Text style={styles.tableCellBold}>TOTAL NETO DE PERCEPCIONES</Text>
            <Text style={styles.tableCellRightBold}>${formatCurrency(totalNeto)}</Text>
          </View>
        </View>

        <Text style={[styles.center, styles.paragraph, { marginTop: 40 }]}>
          {municipio} A {formatDate(finiquito.terminationDate)}
        </Text>

        <View style={styles.signature}>
          <View style={styles.underline} />
          <Text>({finiquito.employeeName})</Text>
        </View>
      </Page>
    </Document>
  );
}
