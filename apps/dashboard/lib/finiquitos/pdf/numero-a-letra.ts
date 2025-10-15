/**
 * Convierte un número a su representación en letras en español
 * @param num - El número a convertir
 * @returns La representación en texto del número
 */
export function numeroALetra(num: number): string {
  const entero = Math.floor(num);

  if (entero === 0) return 'CERO';
  if (entero < 0) return 'MENOS ' + numeroALetra(Math.abs(entero));

  return convertirEntero(entero).toUpperCase();
}

function convertirEntero(num: number): string {
  if (num < 10) return unidades(num);
  if (num < 100) return decenas(num);
  if (num < 1000) return centenas(num);
  if (num < 1000000) return miles(num);
  if (num < 1000000000) return millones(num);
  return num.toString();
}

function unidades(num: number): string {
  const unidad = [
    '',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
  ];
  return unidad[num] || '';
}

function decenas(num: number): string {
  const decena = Math.floor(num / 10);
  const unidad = num % 10;

  if (num < 10) return unidades(num);
  if (num === 10) return 'diez';
  if (num === 11) return 'once';
  if (num === 12) return 'doce';
  if (num === 13) return 'trece';
  if (num === 14) return 'catorce';
  if (num === 15) return 'quince';
  if (num < 20) return 'dieci' + unidades(unidad);
  if (num === 20) return 'veinte';
  if (num < 30) return 'veinti' + unidades(unidad);

  const decenas = [
    '',
    '',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ];

  if (unidad === 0) return decenas[decena] || '';
  return decenas[decena] + ' y ' + unidades(unidad);
}

function centenas(num: number): string {
  const centena = Math.floor(num / 100);
  const resto = num % 100;

  if (num === 100) return 'cien';
  if (num < 100) return decenas(num);

  const centenas = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ];

  if (resto === 0) return centenas[centena] || '';
  return centenas[centena] + ' ' + decenas(resto);
}

function miles(num: number): string {
  const mil = Math.floor(num / 1000);
  const resto = num % 1000;

  if (num < 1000) return centenas(num);

  let result = '';
  if (mil === 1) {
    result = 'mil';
  } else {
    result = convertirEntero(mil) + ' mil';
  }

  if (resto > 0) {
    result += ' ' + centenas(resto);
  }

  return result;
}

function millones(num: number): string {
  const millon = Math.floor(num / 1000000);
  const resto = num % 1000000;

  if (num < 1000000) return miles(num);

  let result = '';
  if (millon === 1) {
    result = 'un millón';
  } else {
    result = convertirEntero(millon) + ' millones';
  }

  if (resto > 0) {
    result += ' ' + miles(resto);
  }

  return result;
}
