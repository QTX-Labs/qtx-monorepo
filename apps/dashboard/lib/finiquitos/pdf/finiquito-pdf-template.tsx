import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import numeral from 'numeral';
import type { Finiquito } from '@workspace/database';
import { numeroALetra } from './numero-a-letra';
import { formatDateLong } from '../utils';

// Utilidad opcional para convertir cm a puntos
// const cm = (cmValue: number) => (cmValue * 72) / 2.54;

// Estilos optimizados para simular Arial Narrow con Helvetica
// Márgenes ajustados para que coincidan visualmente con Word (~2.4 cm arriba, 2.54 cm laterales)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.08,
    color: '#000000',
    paddingTop: 52,      // ≈ 2.4 cm (ajustado al documento Word)
    paddingBottom: 72,   // 2.54 cm
    paddingLeft: 72,     // 2.54 cm
    paddingRight: 72,    // 2.54 cm
  },
  center: {
    textAlign: 'center'
  },
  right: {
    textAlign: 'right'
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
    textIndent: 70  // Tabulador al inicio de cada párrafo
  },
  bold: {
    fontWeight: 'bold'
  },
  signature: {
    marginTop: 40,
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
  textUnderline: {
    textDecoration: 'underline'
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 30
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0
  },
  tableCell: {
    flex: 3,
    paddingVertical: 0,
    paddingRight: 8
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
    paddingVertical: 0
  },
  tableCellBold: {
    flex: 3,
    paddingVertical: 0,
    paddingRight: 8,
    fontWeight: 'bold'
  },
  tableCellRightBold: {
    flex: 1,
    textAlign: 'right',
    paddingVertical: 0,
    fontWeight: 'bold'
  }
});

interface FiniquitoPDFProps {
  finiquito: Finiquito & {
    user: { name: string; email: string | null };
  };
}

/**
 * Plantilla PDF para finiquitos (versión 2)
 *
 * IMPORTANTE: Esta plantilla usa campos de versión 2 del modelo Finiquito.
 * Campos de montos v2 (vigentes):
 * - montoVacacionesFiniquito
 * - montoPrimaVacacionalFiniquito
 * - montoAguinaldoFiniquito
 * - montoDiasTrabajadosFiniquito
 * - totalAPagar
 *
 * NO usar campos v1 (deprecated):
 * - realVacationAmount, realVacationPremiumAmount, realAguinaldoAmount
 * - realWorkedDaysAmount, totalToPay
 *
 * Datos requeridos del empleado:
 * - employeeRFC: Registro Federal de Contribuyentes
 * - employeeCURP: Clave Única de Registro de Población
 *
 * @see /apps/dashboard/actions/finiquitos/helpers/map-calculation.ts - Mapeo de cálculos a campos Prisma
 */
export function FiniquitoPDF({ finiquito }: FiniquitoPDFProps) {
  const toNumber = (value: number | null | { toNumber?: () => number }): number => {
    if (value === null) return 0;
    return typeof value === 'number' ? value : value?.toNumber?.() ?? 0;
  };

  const formatCurrency = (amount: number | null | { toNumber?: () => number }) => {
    if (amount === null) return '0.00';
    const num = toNumber(amount);
    return numeral(num).format('0,0.00');
  };

  const salarioDiario = toNumber(finiquito.fiscalDailySalary);
  const salarioLetra = numeroALetra(salarioDiario);

  const municipio = finiquito.empresaMunicipio || 'CIUDAD DE MÉXICO';
  const estado = finiquito.empresaEstado || '';
  const ubicacion = estado ? `${municipio}, ${estado}` : municipio;
  const puesto = finiquito.employeePosition || 'EMPLEADO';

  // Definir todos los conceptos posibles de percepciones fiscales
  type Concepto = {
    label: string;
    amount: number;
  };

  const allConcepts: Concepto[] = [
    // Conceptos de Finiquito Fiscal
    {
      label: 'SALARIOS DEVENGADOS',
      amount: toNumber(finiquito.montoDiasTrabajadosFiniquito)
    },
    {
      label: 'SÉPTIMO DÍA',
      amount: toNumber(finiquito.montoSeptimoDiaFiniquito)
    },
    {
      label: 'PRIMA VACACIONAL',
      amount: toNumber(finiquito.montoPrimaVacacionalFiniquito)
    },
    {
      label: 'PARTE PROPORCIONAL DE VACACIONES',
      amount: toNumber(finiquito.montoVacacionesFiniquito)
    },
    {
      label: 'VACACIONES PENDIENTES',
      amount: toNumber(finiquito.fiscalPendingVacationAmount)
    },
    {
      label: 'PRIMA VACACIONAL PENDIENTE',
      amount: toNumber(finiquito.fiscalPendingPremiumAmount)
    },
    {
      label: 'PARTE PROPORCIONAL DE AGUINALDO',
      amount: toNumber(finiquito.montoAguinaldoFiniquito)
    },
    {
      label: 'GRATIFICACIÓN',
      amount: toNumber(finiquito.realGratificationAmount)
    },
    // Conceptos de Liquidación Fiscal (solo si está activada)
    ...(finiquito.liquidacionActivada ? [
      {
        label: 'INDEMNIZACIÓN CONSTITUCIONAL (90 DÍAS)',
        amount: toNumber(finiquito.montoIndemnizacion90Dias)
      },
      {
        label: 'INDEMNIZACIÓN ADICIONAL (20 DÍAS)',
        amount: toNumber(finiquito.montoIndemnizacion20Dias)
      },
      {
        label: 'PRIMA DE ANTIGÜEDAD',
        amount: toNumber(finiquito.montoPrimaAntiguedad)
      }
    ] : []),
    // Conceptos de Complemento (solo si está activado)
    ...(finiquito.complementoActivado ? [
      {
        label: 'SALARIOS DEVENGADOS (COMPLEMENTO)',
        amount: toNumber(finiquito.montoDiasTrabajadosComplemento)
      },
      {
        label: 'SÉPTIMO DÍA (COMPLEMENTO)',
        amount: toNumber(finiquito.montoSeptimoDiaComplemento)
      },
      {
        label: 'PRIMA VACACIONAL (COMPLEMENTO)',
        amount: toNumber(finiquito.montoPrimaVacacionalComplemento)
      },
      {
        label: 'PARTE PROPORCIONAL DE VACACIONES (COMPLEMENTO)',
        amount: toNumber(finiquito.montoVacacionesComplemento)
      },
      {
        label: 'VACACIONES PENDIENTES (COMPLEMENTO)',
        amount: toNumber(finiquito.realPendingVacationAmount)
      },
      {
        label: 'PRIMA VACACIONAL PENDIENTE (COMPLEMENTO)',
        amount: toNumber(finiquito.realPendingPremiumAmount)
      },
      {
        label: 'PARTE PROPORCIONAL DE AGUINALDO (COMPLEMENTO)',
        amount: toNumber(finiquito.montoAguinaldoComplemento)
      }
    ] : []),
    // Conceptos de Liquidación Complemento (solo si ambos están activados)
    ...((finiquito.liquidacionActivada && finiquito.complementoActivado) ? [
      {
        label: 'INDEMNIZACIÓN CONSTITUCIONAL (90 DÍAS) (COMPLEMENTO)',
        amount: toNumber(finiquito.montoIndemnizacion90DiasComplemento)
      },
      {
        label: 'INDEMNIZACIÓN ADICIONAL (20 DÍAS) (COMPLEMENTO)',
        amount: toNumber(finiquito.montoIndemnizacion20DiasComplemento)
      },
      {
        label: 'PRIMA DE ANTIGÜEDAD (COMPLEMENTO)',
        amount: toNumber(finiquito.montoPrimaAntiguedadComplemento)
      }
    ] : [])
  ];

  // Filtrar solo los conceptos con monto > 0
  const concepts = allConcepts.filter(c => c.amount > 0);

  // Calcular total neto de percepciones fiscales (incluyendo complemento y liquidación complemento)
  const totalPercepcionesFiscales =
    toNumber(finiquito.totalPercepcionesFiniquito) +
    (finiquito.liquidacionActivada ? toNumber(finiquito.totalPercepcionesLiquidacion) : 0) +
    (finiquito.complementoActivado ? toNumber(finiquito.totalPercepcionesComplemento) : 0) +
    ((finiquito.liquidacionActivada && finiquito.complementoActivado) ? toNumber(finiquito.totalPercepcionesLiquidacionComplemento) : 0);

  // Definir todos los conceptos posibles de deducciones
  // NOTA: El ISR se calcula globalmente para fiscal + complemento (no hay campos separados de ISR para complemento)
  const allDeductions: Concepto[] = [
    {
      label: 'ISR FINIQUITO',
      amount: toNumber(finiquito.isrFiniquito)
    },
    // ISR Liquidación (solo si está activada)
    ...(finiquito.liquidacionActivada ? [
      {
        label: 'ISR ART. 174',
        amount: toNumber(finiquito.isrArt174)
      },
      {
        label: 'ISR INDEMNIZACIÓN',
        amount: toNumber(finiquito.isrIndemnizacion)
      }
    ] : []),
    // Deducciones manuales
    {
      label: 'INFONAVIT',
      amount: toNumber(finiquito.montoDeduccionInfonavit)
    },
    {
      label: 'FONACOT',
      amount: toNumber(finiquito.montoDeduccionFonacot)
    },
    {
      label: 'SUBSIDIO',
      amount: toNumber(finiquito.montoDeduccionSubsidio)
    },
    {
      label: 'OTRAS DEDUCCIONES',
      amount: toNumber(finiquito.montoDeduccionOtrasDeducciones)
    }
  ];

  // Filtrar solo las deducciones con monto > 0
  const deductions = allDeductions.filter(d => d.amount > 0);

  // Calcular total de deducciones fiscales
  // NOTA: El ISR es global (cubre fiscal + complemento), pero totalDeduccionesFiniquito y totalDeduccionesLiquidacion
  // ya incluyen el ISR correspondiente más las deducciones manuales
  const totalDeduccionesFiscales =
    toNumber(finiquito.totalDeduccionesFiniquito) +
    (finiquito.liquidacionActivada ? toNumber(finiquito.totalDeduccionesLiquidacion) : 0);

  // Total neto final (usar totalAPagar que incluye finiquito + liquidación + complemento + liquidación complemento)
  const totalNeto = toNumber(finiquito.totalAPagar || 0);

  // Calcular número de líneas en la tabla de conceptos
  // Percepciones + 1 línea de total percepciones + deducciones + 1 línea de total deducciones + 1 línea de total neto
  const conceptLines = concepts.length + 1 + (deductions.length > 0 ? deductions.length + 1 : 0) + 1;

  // Si hay más de 4 líneas, reducir márgenes para evitar página extra
  const shouldReduceMargins = conceptLines > 4;
  const horizontalPadding = shouldReduceMargins ? 40 : 72; // Reducir de 2.54cm a ~1.41cm
  const verticalPaddingTop = shouldReduceMargins ? 36 : 52; // Reducir de ~2.4cm a ~1.27cm
  const verticalPaddingBottom = shouldReduceMargins ? 50 : 72; // Reducir de 2.54cm a ~1.76cm

  // Reducción progresiva del tamaño de letra según número de líneas
  let fontSize = 11; // Tamaño base
  if (conceptLines > 20) {
    fontSize = 9; // Reducir a 9pt si hay más de 20 líneas
  } else if (conceptLines >= 15) {
    fontSize = 9.5; // Reducir a 9.5pt si hay 15-20 líneas
  } else if (conceptLines >= 10) {
    fontSize = 10; // Reducir a 10pt si hay 10-14 líneas
  }

  // Estilos dinámicos de página con márgenes y fuente ajustados
  const dynamicPageStyle = {
    ...styles.page,
    fontSize: fontSize,
    paddingTop: verticalPaddingTop,
    paddingBottom: verticalPaddingBottom,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
  };

  return (
    <Document>
      <Page size="LETTER" style={dynamicPageStyle}>
        {/* ENCABEZADO */}
        <Text style={[styles.center, styles.paragraph]}>
          <Text style={[styles.bold, styles.textUnderline, styles.right]}>ASUNTO: RENUNCIA VOLUNTARIA.</Text>
        </Text>

        <Text style={{ marginBottom: 12 }}>
          {finiquito.empresaName}{'\n'}
          MUNICIPIO DE {ubicacion}.{'\n'}
          P R E S E N T E:
        </Text>

        {/* CUERPO PRINCIPAL */}
        <Text style={styles.paragraph}>
          POR MEDIO DEL PRESENTE OCURSO, ES MI DESEO RENUNCIAR VOLUNTARIAMENTE A MI EMPLEO, Y AL PUESTO DE{' '}
          <Text style={styles.bold}>{puesto}</Text> QUE VENIA DESEMPEÑANDO DESDE EL {formatDateLong(finiquito.hireDate)},
          ASIMISMO EN ESTE ACTO RENUNCIO VOLUNTARIAMENTE A MI ULTIMO SALARIO DE ${formatCurrency(finiquito.fiscalDailySalary)}{' '}
          ({salarioLetra} PESOS 00/100 M.N.), DIARIOS, MISMO SALARIO QUE PERCIBÍ DURANTE EL TIEMPO QUE EXISTIÓ LA RELACIÓN LABORAL;
          DE IGUAL FORMA RENUNCIO DE MANERA VOLUNTARIA AL HORARIO QUE VENIA DESEMPEÑANDO ACLARANDO QUE ÚNICAMENTE LABORÉ LA JORNADA
          ORDINARIA LEGAL PERMITIDA, TENIENDO UNA HORA INTERMEDIA PARA DESCANSAR Y/O TOMAR ALIMENTOS A MI ELECCIÓN YA SEA DENTRO O
          FUERA DE LAS INSTALACIONES DE LA FUENTE DE TRABAJO Y SIN ESTAR A SU DISPOSICIÓN, CON DESCANSO LOS DÍAS DOMINGO DE CADA
          SEMANA POR LO QUE EN ESTE MOMENTO MANIFIESTO QUE EL PRESENTE DOCUMENTO SE REALIZA SIN QUE OBRE MALA FE, COACCIÓN, NI NINGÚN
          VICIO DEL CONSENTIMIENTO.
        </Text>

        <Text style={styles.paragraph}>
          ASIMISMO, LE INFORMO QUE DURANTE EL TIEMPO QUE EXISTIÓ LA RELACIÓN LABORAL ENTRE EL SUSCRITO Y LA FUENTE DE TRABAJO,
          SIEMPRE SE ME CUBRIÓ MI SALARIO EN TIEMPO Y FORMA, ASÍ COMO EL TIEMPO EXTRA CUANDO LO LABORÉ, POR LO QUE, HASTA LA FECHA,
          NO SE ME ADEUDA CANTIDAD ALGUNA POR ESTOS CONCEPTOS.
        </Text>

        <Text style={styles.paragraph}>
          ES IMPORTANTE MENCIONAR QUE DURANTE EL TIEMPO QUE EXISTIÓ LA RELACIÓN DE TRABAJO, JAMÁS SUFRÍ NINGÚN RIESGO DE TRABAJO,
          NI PADECÍ NINGÚN TIPO DE ENFERMEDAD CRÓNICA, NI DE NINGÚN TIPO, POR LO QUE DESDE ESTE MOMENTO DESLINDO A LA FUENTE DE TRABAJO{' '}
          <Text style={styles.bold}>{finiquito.empresaName}</Text> DE TODA RESPONSABILIDAD DE SEGURIDAD SOCIAL Y ANTE LA JUNTA LOCAL,
          FEDERAL DE CONCILIACIÓN Y ARBITRAJE ASÍ COMO LOS JUZGADOS LABORALES.
        </Text>

        <Text style={styles.paragraph}>
          POR LO QUE DESDE ESTOS MOMENTOS MANIFIESTO QUE LA FUENTE DE TRABAJO{' '}
          <Text style={styles.bold}>{finiquito.empresaName}</Text> NO ME ADEUDA CANTIDAD ALGUNA POR CONCEPTO DE AGUINALDO, VACACIONES,
          PRIMA VACACIONAL, REPARTO DE UTILIDADES, FONDO Y CAJA DE AHORRO, NI DE NINGÚN TIPO DE PRESTACIÓN, POR LO QUE SE EXTIENDE LA
          PRESENTE RENUNCIA VOLUNTARIA SIN NINGUNA OBJECIÓN Y RATIFICO LA MISMA COMO VERDADERA, SIN QUE OBRE NINGUNO DE LOS VICIOS DEL
          CONSENTIMIENTO.
        </Text>

        {/* FIRMA DE RENUNCIA */}
        <Text style={[styles.center, { marginTop: 50, marginBottom: 8, textAlign: 'center' }]}>
          ATENTAMENTE{'\n'}
          {ubicacion} A {formatDateLong(finiquito.terminationDate)}.
        </Text>

        <View style={[styles.signature, { marginTop: 12 }]}>
          <View style={styles.underline} />
          <Text>({finiquito.employeeName})</Text>
        </View>

        {/* RECIBO DE FINIQUITO */}
        <View break>
          <Text style={[styles.center, { marginBottom: 10, textAlign: 'center' }]}>
            <Text style={styles.bold}>R E C I B O   F I N I Q U I T O</Text>
          </Text>

          <Text style={{ marginBottom: 12 }}>
            <Text style={styles.bold}>Nombre completo:</Text> {finiquito.employeeName}{'\n'}
            <Text style={styles.bold}>RFC:</Text> {finiquito.employeeRFC}{'\n'}
            <Text style={styles.bold}>CURP:</Text> {finiquito.employeeCURP}{'\n'}
            <Text style={styles.bold}>Empresa:</Text> {finiquito.empresaName}{'\n'}
            <Text style={styles.bold}>Fecha de ingreso:</Text> {formatDateLong(finiquito.hireDate)}{'\n'}
            <Text style={styles.bold}>Fecha de baja:</Text> {formatDateLong(finiquito.terminationDate)}{'\n'}
            <Text style={styles.bold}>Puesto:</Text> {puesto}{'\n'}
            <Text style={styles.bold}>Salario diario:</Text> ${formatCurrency(finiquito.fiscalDailySalary)}{'\n'}
            <Text style={styles.bold}>Cantidad con letra:</Text> {salarioLetra} 00/100 M.N.{'\n'}
            <Text style={styles.bold}>Recibí de {finiquito.empresaName} la cantidad de:</Text> ${formatCurrency(totalPercepcionesFiscales)}{'\n'}
            <Text style={styles.bold}>CANTIDAD CON LETRA:</Text> <Text style={styles.textUnderline}>{numeroALetra(totalPercepcionesFiscales)}</Text> 00 / 100 M.N.
          </Text>

          <Text style={{ marginBottom: 12, textAlign: 'justify' }}>
            Por concepto de finiquito, al haber dado por terminado de manera unilateral el contrato individual de trabajo con{' '}
            <Text style={styles.bold}>{finiquito.empresaName}</Text>, manifestando que dicha cantidad la recibo a mi entera satisfacción,
            asimismo que durante la prestación de mis servicios a <Text style={styles.bold}>{finiquito.empresaName}</Text>, reconociendo
            expresamente que a últimas fechas le prestaba mis servicios personales y subordinados de manera exclusiva en las condiciones
            señaladas en el presente documento, gozando de lunes a sábado con sesenta minutos para descansar y/o tomar alimentos dentro o
            fuera de la fuente de trabajo y sin estar bajo la subordinación de mi único y exclusivo patrón{' '}
            <Text style={styles.bold}>{finiquito.empresaName}</Text>, teniendo como días de descansando los días domingos de cada semana,
            laborando única y exclusivamente dicha jornada. La cantidad anterior se desglosa en los siguientes conceptos:
          </Text>

          <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>
            RECIBÍ DE <Text>{finiquito.empresaName}</Text> LAS CANTIDADES SIGUIENTES:
          </Text>

          {/* TABLA DE CONCEPTOS - RENDERIZADO DINÁMICO */}
          <View style={styles.table}>
            {/* PERCEPCIONES */}
            {concepts.map((concepto, index) => (
              <View style={styles.tableRow} key={`concepto-${index}`}>
                <Text style={styles.tableCell}>{concepto.label}</Text>
                <Text style={styles.tableCellRight}>${formatCurrency(concepto.amount)}</Text>
              </View>
            ))}
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>TOTAL DE PERCEPCIONES:</Text>
              <Text style={styles.tableCellRightBold}>${formatCurrency(totalPercepcionesFiscales)}</Text>
            </View>

            {/* DEDUCCIONES (solo si existen) */}
            {deductions.length > 0 && (
              <>
                <View style={{ marginTop: 12 }}>
                  {deductions.map((deduccion, index) => (
                    <View style={styles.tableRow} key={`deduccion-${index}`}>
                      <Text style={styles.tableCell}>{deduccion.label}</Text>
                      <Text style={styles.tableCellRight}>${formatCurrency(deduccion.amount)}</Text>
                    </View>
                  ))}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCellBold}>TOTAL DE DEDUCCIONES:</Text>
                    <Text style={styles.tableCellRightBold}>${formatCurrency(totalDeduccionesFiscales)}</Text>
                  </View>
                </View>
              </>
            )}

            {/* TOTAL NETO FINAL */}
            <View style={[styles.tableRow, { marginTop: 12, marginBottom: 12 }]}>
              <Text style={styles.tableCellBold}>TOTAL NETO:</Text>
              <Text style={styles.tableCellRightBold}>${formatCurrency(totalNeto)}</Text>
            </View>
          </View>

          {/* BLOQUE FINAL */}
          <Text style={{ marginBottom: 12, textAlign: 'justify' }}>
            Manifiesto así mismo que recibí el pago de todas las prestaciones a que tuve derecho conforme a la ley y a mi contrato
            individual de trabajo; tales como: salarios ordinarios, séptimos días, vacaciones, prima vacacional, aguinaldo y participación
            de las utilidades cuando las hubo y demás prestaciones a que tengo derecho de acuerdo con la Ley Federal del Trabajo, sin
            laborar días festivos.
          </Text>

          <Text style={{ marginBottom: 12, textAlign: 'justify' }}>
            Por ser de equidad manifiesto, que durante la prestación de mis servicios los llevé a cabo física y emocionalmente en buen
            estado, y que durante el tiempo que preste mis servicios no sufrí riesgo de trabajo alguno o enfermedad profesional, por lo
            que a la fecha de la firma del presente se me ha cubierto en su totalidad toda cantidad por cualquier concepto, extiendo el
            finiquito más amplio que en derecho proceda a favor de mi único <Text style={styles.bold}>{finiquito.empresaName}</Text> ya
            que han sido cubiertas totalmente todas y cada una de las prestaciones y salarios a los que tengo derecho, firmando de
            conformidad el presente finiquito.
          </Text>

          {/* FIRMA FINAL */}
          <Text style={[styles.center, { marginTop: 10, marginBottom: 5, textAlign: 'center' }]}>
            ATENTAMENTE{'\n'}
            {ubicacion} A {formatDateLong(finiquito.terminationDate)}.
          </Text>

          <View style={{
            marginTop: 30,
            textAlign: 'center',
            alignItems: 'center'
          }}>
            <View style={styles.underline} />
            <Text>({finiquito.employeeName})</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
