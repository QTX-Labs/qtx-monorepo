import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { join } from 'path';

// Ruta al archivo Excel
const excelPath = join(__dirname, '..', 'RSs.xlsx');

// Leer el archivo
const workbook = XLSX.readFile(excelPath);

// Obtener la primera hoja
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convertir a JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Mostrar los primeros registros para analizar estructura
console.log('Nombre de la hoja:', sheetName);
console.log('Total de registros:', data.length);
console.log('\nPrimeros 3 registros:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

// Analizar estructura de campos
if (data.length > 0) {
  const firstRecord = data[0] as Record<string, any>;
  console.log('\n\nEstructura de campos encontrados:');
  Object.entries(firstRecord).forEach(([key, value]) => {
    const type = typeof value;
    console.log(`- ${key}: ${type} (ejemplo: ${value})`);
  });
}

// Exportar los datos para uso posterior
export { data };
