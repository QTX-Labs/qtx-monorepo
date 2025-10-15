import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer';
import type { Finiquito } from '@workspace/database';
import { numeroALetra } from './numero-a-letra';
import { formatDateLong } from '../utils';

// Estilos optimizados para simular Arial Narrow con Helvetica
// Se usa letterSpacing y transform para lograr el efecto condensado
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.15,
        letterSpacing: -0.2, // Simula el ancho condensado
        color: '#000000',
        marginTop: 90,      // ~2.54 cm
        marginBottom: 90,   // ~2.54 cm
        marginLeft: 72,     // ~3.17 cm
        marginRight: 72,    // ~3.17 cm
        textAlign: 'justify'
    },
    center: {
        textAlign: 'center'
    },
    right: {
        textAlign: 'right'
    },
    paragraph: {
        marginBottom: 12
    },
    bold: {
        fontWeight: 'bold'
    },
    signature: {
        marginTop: 50,
        textAlign: 'center',
        alignItems: 'center',
        transform: 'scaleX(0.87)' // Simula el ancho condensado
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
        fontWeight: 'bold'
    },
    tableCellRightBold: {
        flex: 1,
        textAlign: 'right',
        paddingVertical: 4,
        fontWeight: 'bold'
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

    const salarioDiario = toNumber(finiquito.fiscalDailySalary);
    const salarioLetra = numeroALetra(salarioDiario);

    // Construir ubicación con municipio y estado
    const municipio = finiquito.empresaMunicipio || 'CIUDAD DE MÉXICO';
    const estado = finiquito.empresaEstado || '';
    const ubicacion = estado ? `${municipio}, ${estado}` : municipio;

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
                {/* ENCABEZADO */}
                <Text style={[styles.center, styles.paragraph]}>
                    <Text style={styles.bold}>ASUNTO: RENUNCIA VOLUNTARIA.</Text>
                </Text>

                <Text style={styles.paragraph}>
                    {finiquito.empresaName}
                </Text>

                <Text style={styles.paragraph}>
                    MUNICIPIO DE {ubicacion}.
                </Text>

                <Text style={[styles.right, styles.paragraph]}>
                    P R E S E N T E:
                </Text>

                {/* CUERPO PRINCIPAL DE RENUNCIA */}
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
                <Text style={[styles.center, styles.paragraph, { marginTop: 20 }]}>
                    ATENTAMENTE
                </Text>

                <Text style={[styles.center, styles.paragraph]}>
                    {ubicacion} A {formatDateLong(finiquito.terminationDate)}.
                </Text>

                <View style={styles.signature}>
                    <View style={styles.underline} />
                    <Text>({finiquito.employeeName})</Text>
                </View>

                {/* SEPARADOR */}
                <View style={styles.hr} />

                {/* RECIBO DE FINIQUITO */}
                <Text style={[styles.center, styles.paragraph, { marginTop: 20 }]}>
                    <Text style={styles.bold}>R E C I B O   F I N I Q U I T O</Text>
                </Text>

                <Text style={styles.paragraph}>
                    Nombre: {finiquito.employeeName}
                </Text>

                <Text style={styles.paragraph}>
                    Fecha de ingreso: {formatDateLong(finiquito.hireDate)}
                </Text>

                <Text style={styles.paragraph}>
                    Puesto: {puesto}
                </Text>

                <Text style={styles.paragraph}>
                    Salario diario: ${formatCurrency(finiquito.fiscalDailySalary)}
                </Text>

                <Text style={styles.paragraph}>
                    Cantidad con letra: {salarioLetra} 00/100 M.N.
                </Text>

                <Text style={styles.paragraph}>
                    Recibí de {finiquito.empresaName} la cantidad de: ${formatCurrency(totalNeto)}
                </Text>

                <Text style={styles.paragraph}>
                    Por concepto de finiquito, al haber dado por terminado de manera unilateral el contrato individual de trabajo con{' '}
                    <Text style={styles.bold}>{finiquito.empresaName}</Text>, manifestando que dicha cantidad la recibo a mi entera satisfacción,
                    asimismo que durante la prestación de mis servicios a <Text style={styles.bold}>{finiquito.empresaName}</Text>, reconociendo
                    expresamente que a últimas fechas le prestaba mis servicios personales y subordinados de manera exclusiva en las condiciones
                    señaladas en el presente documento, gozando de lunes a sábado con sesenta minutos para descansar y/o tomar alimentos dentro o
                    fuera de la fuente de trabajo y sin estar bajo la subordinación de mi único y exclusivo patrón{' '}
                    <Text style={styles.bold}>{finiquito.empresaName}</Text>, teniendo como días de descansando los días domingos de cada semana,
                    laborando única y exclusivamente dicha jornada. La cantidad anterior se desglosa en los siguientes conceptos:
                </Text>

                {/* TABLA DE CONCEPTOS */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>PARTE PROPORCIONAL DE VACACIONES 2024 – 2025</Text>
                        <Text style={styles.tableCellRight}>${formatCurrency(vacaciones)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>PARTE PROPORCIONAL DE PRIMA VACACIONAL</Text>
                        <Text style={styles.tableCellRight}>${formatCurrency(primaVacacional)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>AGUINALDO PROPORCIONAL DEL 2024</Text>
                        <Text style={styles.tableCellRight}>${formatCurrency(aguinaldo)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>SALARIOS DEVENGADOS</Text>
                        <Text style={styles.tableCellRight}>${formatCurrency(salariosDevengados)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellBold}>TOTAL NETO DE PERCEPCIONES:</Text>
                        <Text style={styles.tableCellRightBold}>${formatCurrency(totalNeto)}</Text>
                    </View>
                </View>

                {/* BLOQUE FINAL */}
                <Text style={styles.paragraph}>
                    Manifiesto así mismo que recibí el pago de todas las prestaciones a que tuve derecho conforme a la ley y a mi contrato
                    individual de trabajo; tales como: salarios ordinarios, séptimos días, vacaciones, prima vacacional, aguinaldo y participación
                    de las utilidades cuando las hubo y demás prestaciones a que tengo derecho de acuerdo con la Ley Federal del Trabajo, sin
                    laborar días festivos.
                </Text>

                <Text style={styles.paragraph}>
                    Por ser de equidad manifiesto, que durante la prestación de mis servicios los llevé a cabo física y emocionalmente en buen
                    estado, y que durante el tiempo que preste mis servicios no sufrí riesgo de trabajo alguno o enfermedad profesional, por lo
                    que a la fecha de la firma del presente se me ha cubierto en su totalidad toda cantidad por cualquier concepto, extiendo el
                    finiquito más amplio que en derecho proceda a favor de mi único <Text style={styles.bold}>{finiquito.empresaName}</Text> ya
                    que han sido cubiertas totalmente todas y cada una de las prestaciones y salarios a los que tengo derecho, firmando de
                    conformidad el presente finiquito.
                </Text>

                {/* FIRMA FINAL */}
                <Text style={[styles.center, styles.paragraph, { marginTop: 20 }]}>
                    ATENTAMENTE
                </Text>

                <Text style={[styles.center, styles.paragraph]}>
                    {ubicacion} A {formatDateLong(finiquito.terminationDate)}
                </Text>

                <View style={styles.signature}>
                    <View style={styles.underline} />
                    <Text>({finiquito.employeeName})</Text>
                </View>
            </Page>
        </Document>
    );
}
