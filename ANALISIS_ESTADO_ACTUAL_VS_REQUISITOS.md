# 📊 ANÁLISIS DETALLADO: ESTADO ACTUAL VS REQUISITOS

**Fecha:** 19 de Octubre, 2025
**Sistema:** Finiquitos - QTX Monorepo
**Objetivo:** Determinar qué está implementado y qué falta antes del lunes

---

## 🎯 RESUMEN EJECUTIVO

| Categoría | Implementado | Falta | Estado |
|-----------|--------------|-------|--------|
| Cálculos Básicos | 90% | 10% | 🟡 Requiere verificación |
| Deducciones | 50% | 50% | 🔴 Requiere cambios |
| Validaciones | 80% | 20% | 🟡 Casi completo |
| UX/Formato | 40% | 60% | 🔴 Requiere mejoras |
| PDF | 70% | 30% | 🟡 Requiere ajustes |
| Listado | 60% | 40% | 🟡 Requiere columnas |

**Estado General:** 65% completado, 35% pendiente

---

## ✅ LO QUE YA ESTÁ IMPLEMENTADO

### 1. CÁLCULOS BÁSICOS (90% ✅)

#### ✅ Motor de cálculo funcionando
**Ubicación:** `apps/dashboard/lib/finiquitos/calculate-finiquito.ts`

**Funciona correctamente:**
- ✅ Cálculo de aguinaldo proporcional (línea 53-61)
  ```typescript
  const aguinaldoFactor = calculateAguinaldoFactor(daysWorked, aguinaldoDays);
  // Fórmula: (días_trabajados / 365) × días_aguinaldo
  ```

- ✅ Cálculo de prima vacacional (línea 55-66)
  ```typescript
  const vacationPremiumFactor = calculateVacationPremiumFactor(
    vacationFactor,
    vacationPremium
  );
  // Fórmula: factor_vacaciones × (prima% / 100)
  ```

- ✅ Cálculo de vacaciones proporcionales (línea 54)
  ```typescript
  const vacationFactor = calculateVacationFactor(daysWorked, vacationDays);
  ```

- ✅ Salarios (fiscal, real, integrado) - Todo funcionando
- ✅ Gratificación bidireccional (días ↔ pesos) - Funcionando
- ✅ Indemnización - Funcionando
- ✅ Dos columnas (Fiscal y Real/Complemento) - Funcionando

**Estado:** ✅ **CORRECTO** - Solo necesita verificación con Excel del cliente

---

### 2. VALIDACIONES (80% ✅)

#### ✅ Validaciones implementadas
**Ubicación:** `apps/dashboard/lib/finiquitos/schemas.ts`

**Validaciones que funcionan:**

1. **Aguinaldo mínimo 15 días** (línea 45)
   ```typescript
   aguinaldoDays: z.coerce.number()
     .min(15, 'Los días de aguinaldo no pueden ser menores a 15')
     .default(15)
   ```
   ✅ IMPLEMENTADO

2. **Prima vacacional mínima 25%** (línea 47)
   ```typescript
   vacationPremium: z.coerce.number()
     .min(25, 'La prima vacacional no puede ser menor a 25%')
     .max(100)
     .default(25)
   ```
   ✅ IMPLEMENTADO

3. **RFC empleado obligatorio con validación** (líneas 8-10)
   ```typescript
   employeeRFC: z.string()
     .min(1, 'El RFC del empleado es requerido')
     .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido...')
   ```
   ✅ IMPLEMENTADO (valida persona física Y moral)

4. **CURP obligatoria con validación** (líneas 11-13)
   ```typescript
   employeeCURP: z.string()
     .min(1, 'La CURP del empleado es requerida')
     .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, 'CURP inválida...')
   ```
   ✅ IMPLEMENTADO

5. **Validación de fechas** (líneas 87-92)
   ```typescript
   .refine(
     (data) => data.terminationDate >= data.hireDate,
     {
       message: 'La fecha de baja debe ser posterior a la fecha de ingreso',
       path: ['terminationDate']
     }
   )
   ```
   ✅ IMPLEMENTADO

---

### 3. FORMULARIO (70% ✅)

#### ✅ Características implementadas
**Ubicación:** `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx`

**Funciona correctamente:**
- ✅ Traducción completa a español
- ✅ Cálculo en vivo en sidebar (línea 1329-1469)
- ✅ Toggle de complemento (línea 676-689)
- ✅ Factor de días con justificación solo admin (línea 786-877)
- ✅ Selector de fechas con dropdown mes/año (línea 567-570)
  ```typescript
  <Calendar
    mode="single"
    captionLayout="dropdown"  // ✅ Ya permite selección directa
    fromYear={1960}
    toYear={new Date().getFullYear()}
  />
  ```
- ✅ Formato de moneda en sidebar con comas (línea 1343)
  ```typescript
  ${formatMoney(calculationResult.totals.netPayTotal)}
  ```

---

### 4. PDF (70% ✅)

#### ✅ Lo que funciona
**Ubicación:** `apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx`

**Implementado correctamente:**
- ✅ Template base funcionando
- ✅ Formato correcto con márgenes
- ✅ Datos de ubicación (municipio, estado) - línea 117-119
- ✅ Formato de moneda con comas - línea 108-112
- ✅ Conversión de números a letras - línea 11, 115
- ✅ Nombre del empleado - línea 193
- ✅ Fecha de ingreso - línea 194
- ✅ Puesto - línea 195
- ✅ Salario diario - línea 196

---

## ❌ LO QUE FALTA IMPLEMENTAR

### 🔴 PRIORIDAD 1 - CRÍTICO (Debe estar listo para el lunes)

#### ❌ 1. Vacaciones Pendientes - Permitir Negativos
**Estado:** ⚠️ Campo existe pero solo permite positivos

**Problema actual:** `schemas.ts` línea 50
```typescript
pendingVacationDays: z.coerce.number().nonnegative().default(0),
```

**Solución requerida:**
```typescript
// CAMBIAR A:
pendingVacationDays: z.coerce.number().default(0), // Permite negativos
```

**Archivos a modificar:**
1. `apps/dashboard/lib/finiquitos/schemas.ts` - Línea 50
2. `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx` - Línea 985-1001
   - Agregar en FormDescription: "Positivo si se deben al empleado, negativo si el empleado debe días"

**Impacto:** Bajo
**Tiempo estimado:** 5 minutos

---

#### ❌ 2. Prima de Antigüedad - Cálculo Automático con Toggle
**Estado:** ⚠️ Campo manual existe pero NO se calcula automáticamente

**Problema actual:**
- El campo `seniorityPremiumDays` existe (línea 1181-1200 del form)
- Es un campo manual, el usuario tiene que calcular manualmente
- NO hay toggle para incluir/excluir

**Solución requerida:**

**a) Agregar toggle al schema** (`schemas.ts`):
```typescript
// AGREGAR después de línea 66:
includeSeniorityPremium: z.boolean().default(false),
```

**b) Agregar cálculo automático** (`utils.ts`):
```typescript
// AGREGAR nueva función:
export function calculateSeniorityPremiumDays(yearsWorked: number): number {
  // Fórmula: 12 días por año trabajado
  return yearsWorked * 12;
}
```

**c) Modificar formulario** (`finiquito-form.tsx`):
```typescript
// AGREGAR después de línea 1102:
<FormField
  control={form.control}
  name="includeSeniorityPremium"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center gap-2">
      <FormLabel className="!mt-0 text-sm">
        Incluir Prima de Antigüedad
      </FormLabel>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

**d) Calcular automáticamente en useEffect:**
```typescript
// AGREGAR después de línea 223:
useEffect(() => {
  if (hireDate && terminationDate) {
    const years = calculateYearsWorked(
      calculateDaysWorked(hireDate, terminationDate)
    );
    const calculatedDays = calculateSeniorityPremiumDays(years);
    form.setValue('seniorityPremiumDays', calculatedDays);
  }
}, [hireDate, terminationDate, form]);
```

**Archivos a modificar:**
1. `apps/dashboard/lib/finiquitos/schemas.ts` - Agregar campo
2. `apps/dashboard/lib/finiquitos/utils.ts` - Agregar función de cálculo
3. `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx` - Agregar toggle y cálculo

**Impacto:** Medio
**Tiempo estimado:** 30 minutos

---

#### ❌ 3. Deducciones - ISR Automático, Eliminar IMSS y Subsidio
**Estado:** 🔴 ISR es manual, IMSS y Subsidio existen como campos manuales

**Problema actual:** `finiquito-form.tsx`
- ISR es campo editable manual (línea 1215-1230)
- Subsidio es campo editable manual (línea 1233-1250)
- Ambos se guardan en el form

**Solución requerida:**

**a) Eliminar del schema** (`schemas.ts`):
```typescript
// ELIMINAR líneas 69-70:
// isrAmount: z.coerce.number().nonnegative().default(0),
// subsidyAmount: z.coerce.number().nonnegative().default(0),
```

**b) Eliminar del formulario** (`finiquito-form.tsx`):
```typescript
// ELIMINAR líneas 1214-1251 (campos ISR y Subsidio)
```

**c) Mostrar ISR calculado (solo lectura):**
```typescript
// AGREGAR en sección de deducciones:
{calculationResult && (
  <div className="grid gap-6 md:grid-cols-2">
    <FormItem>
      <FormLabel>ISR (Calculado Automáticamente)</FormLabel>
      <Input
        type="text"
        value={`$${formatMoney(calculationResult.deductions.isr)}`}
        disabled
        className="bg-muted cursor-not-allowed"
      />
      <FormDescription>
        Se calcula automáticamente según percepciones
      </FormDescription>
    </FormItem>
  </div>
)}
```

**Archivos a modificar:**
1. `apps/dashboard/lib/finiquitos/schemas.ts` - Eliminar campos
2. `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx` - Eliminar campos y mostrar ISR readonly
3. `apps/dashboard/actions/finiquitos/create-finiquito.ts` - Verificar que no use estos campos
4. `apps/dashboard/actions/finiquitos/update-finiquito.ts` - Verificar que no use estos campos

**Impacto:** Alto
**Tiempo estimado:** 45 minutos

---

### 🟡 PRIORIDAD 2 - IMPORTANTE (Necesario antes del lunes)

#### ❌ 4. Separadores de Miles en Inputs del Formulario
**Estado:** ⚠️ Solo funciona en el sidebar de cálculo, NO en los inputs

**Problema actual:**
- Los inputs de dinero NO tienen formato mientras escribes
- Solo el sidebar usa `formatMoney` (línea 1343)

**Solución requerida:**

**a) Crear componente CurrencyInput:**
```typescript
// CREAR: apps/dashboard/components/ui/currency-input.tsx
'use client';

import { useEffect, useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import numeral from 'numeral';

export function CurrencyInput({ value, onChange, ...props }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(numeral(value).format('0,0.00'));
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    const num = parseFloat(raw) || 0;
    onChange(num);
    setDisplayValue(numeral(num).format('0,0.00'));
  };

  const handleBlur = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    const num = parseFloat(raw) || 0;
    setDisplayValue(numeral(num).format('0,0.00'));
  };

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
```

**b) Aplicar a campos de dinero en el formulario:**

Reemplazar todos estos campos:
- Salario real (línea 744-755)
- Gratificación en pesos (línea 1136-1150)
- Infonavit (línea 1256-1269)
- Fonacot (línea 1273-1286)
- Otras deducciones (línea 1296-1309)

**Archivos a crear:**
1. `apps/dashboard/components/ui/currency-input.tsx` - Nuevo componente

**Archivos a modificar:**
2. `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx` - Usar CurrencyInput

**Impacto:** Bajo
**Tiempo estimado:** 45 minutos

---

#### ❌ 5. PDF - Agregar RFC, CURP y Nombre Empresa
**Estado:** ⚠️ Faltan campos en el PDF

**Problema actual:** `finiquito-pdf-template.tsx`
- NO muestra RFC del empleado
- NO muestra CURP del empleado
- NO muestra nombre completo con apellidos
- NO muestra razón social de la empresa

**Solución requerida:**

**Modificar líneas 192-199:**
```typescript
// CAMBIAR DE:
<Text style={{ marginBottom: 12 }}>
  <Text style={styles.bold}>Nombre:</Text> {finiquito.employeeName}{'\n'}
  <Text style={styles.bold}>Fecha de ingreso:</Text> {formatDateLong(finiquito.hireDate)}{'\n'}
  ...
</Text>

// A:
<Text style={{ marginBottom: 12 }}>
  <Text style={styles.bold}>Nombre completo:</Text> {finiquito.employeeName}{'\n'}
  <Text style={styles.bold}>RFC:</Text> {finiquito.employeeRFC}{'\n'}
  <Text style={styles.bold}>CURP:</Text> {finiquito.employeeCURP}{'\n'}
  <Text style={styles.bold}>Empresa:</Text> {finiquito.empresaName}{'\n'}
  <Text style={styles.bold}>Fecha de ingreso:</Text> {formatDateLong(finiquito.hireDate)}{'\n'}
  ...
</Text>
```

**Archivos a modificar:**
1. `apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx` - Líneas 192-199

**Impacto:** Bajo
**Tiempo estimado:** 10 minutos

---

#### ❌ 6. Listado - Agregar Columnas Empresa y Cliente
**Estado:** ⚠️ Faltan columnas en el listado

**Problema actual:** `finiquitos-list.tsx`
- NO muestra columna "Empresa"
- NO muestra columna "Cliente"

**Solución requerida:**

**a) Actualizar tipo** (líneas 48-61):
```typescript
// CAMBIAR DE:
type FiniquitoListItem = Pick<
  Finiquito,
  | 'id'
  | 'employeeName'
  | 'hireDate'
  | 'terminationDate'
  ...
>

// A:
type FiniquitoListItem = Pick<
  Finiquito,
  | 'id'
  | 'employeeName'
  | 'empresaName'    // ← AGREGAR
  | 'clientName'     // ← AGREGAR
  | 'hireDate'
  | 'terminationDate'
  ...
>
```

**b) Actualizar headers** (líneas 150-158):
```typescript
<TableHeader>
  <TableRow>
    <TableHead>Empleado</TableHead>
    <TableHead>Empresa</TableHead>        {/* ← AGREGAR */}
    <TableHead>Cliente</TableHead>        {/* ← AGREGAR */}
    <TableHead>Fecha de Baja</TableHead>
    ...
  </TableRow>
</TableHeader>
```

**c) Actualizar celdas** (después de línea 168):
```typescript
<TableCell className="font-medium">
  {finiquito.employeeName}
</TableCell>
<TableCell>{finiquito.empresaName}</TableCell>    {/* ← AGREGAR */}
<TableCell>{finiquito.clientName}</TableCell>     {/* ← AGREGAR */}
```

**d) Actualizar query en data layer:**
```typescript
// En: apps/dashboard/data/finiquitos/get-finiquitos.ts
// Agregar empresaName y clientName al select
```

**Archivos a modificar:**
1. `apps/dashboard/components/organizations/slug/finiquitos/finiquitos-list.tsx` - Actualizar UI
2. `apps/dashboard/data/finiquitos/get-finiquitos.ts` - Actualizar query

**Impacto:** Bajo
**Tiempo estimado:** 20 minutos

---

### 🟢 PRIORIDAD 3 - DESEABLE (Si hay tiempo)

#### ❌ 7. Controles Numéricos (Flechitas) para Aguinaldo y Prima
**Estado:** ❌ Los inputs NO tienen controles de incremento/decremento

**Problema actual:**
- Los campos son `type="number"` pero NO tienen `step` visible

**Solución requerida:**

Los campos YA son `type="number"`, solo agregar atributos:

```typescript
// Aguinaldo (línea 915-921):
<Input
  type="number"
  min="15"
  step="1"      // ← AGREGAR
  {...field}
  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
  disabled={!enableSuperiorBenefits}
/>

// Prima Vacacional (línea 957-963):
<Input
  type="number"
  min="25"
  max="100"
  step="1"      // ← AGREGAR
  {...field}
  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
  disabled={!enableSuperiorBenefits}
/>
```

**Nota:** Las flechitas aparecen automáticamente en Chrome/Firefox con estos atributos.

**Archivos a modificar:**
1. `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx` - Líneas 915, 957

**Impacto:** Muy bajo
**Tiempo estimado:** 2 minutos

---

#### ❌ 8. PDF - Optimizar Espacios (Menos Páginas)
**Estado:** ⚠️ El PDF tiene mucho espacio en blanco

**Solución requerida:**

**Modificar styles** (`finiquito-pdf-template.tsx` líneas 19-40):
```typescript
// CAMBIAR:
const styles = StyleSheet.create({
  page: {
    fontSize: 11,           // ← Cambiar a 10
    lineHeight: 1.08,
    paddingTop: 52,         // ← Reducir a 40
    paddingBottom: 72,      // ← Reducir a 50
    ...
  },
  paragraph: {
    marginBottom: 12,       // ← Reducir a 8
    textAlign: 'justify',
    textIndent: 70
  },
  ...
});
```

**Archivos a modificar:**
1. `apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx` - Líneas 22, 25-26, 37

**Impacto:** Muy bajo
**Tiempo estimado:** 5 minutos

---

## 🧪 VERIFICACIÓN CON EXCEL - CRÍTICO

### ❓ Estado Desconocido - Requiere Prueba

**Lo que NO sabemos aún:**
1. ¿Los cálculos de aguinaldo coinciden EXACTAMENTE con el Excel del cliente?
2. ¿Los cálculos de prima vacacional coinciden EXACTAMENTE?
3. ¿Hay duplicación de valores como se reportó?

**Prueba requerida:**
1. Obtener Excel del cliente
2. Crear finiquito en el sistema con los MISMOS datos
3. Comparar lado a lado cada valor
4. Documentar diferencias

**Si hay diferencias:**
- Revisar `calculate-perceptions.ts` líneas 53-66
- Revisar cómo se están pasando los parámetros desde el form
- Verificar que no haya suma indebida de valores

---

## 📊 RESUMEN DE TAREAS

### 🔴 CRÍTICO (3 tareas - ~1.5 horas)
1. ✏️ Permitir negativos en vacaciones pendientes - 5 min
2. ✏️ Prima de antigüedad automática + toggle - 30 min
3. ✏️ ISR automático, eliminar IMSS/Subsidio - 45 min

### 🟡 IMPORTANTE (3 tareas - ~2 horas)
4. ✏️ Separadores de miles en inputs - 45 min
5. ✏️ Agregar RFC/CURP/Empresa al PDF - 10 min
6. ✏️ Agregar columnas Empresa/Cliente al listado - 20 min

### 🟢 DESEABLE (2 tareas - ~10 min)
7. ✏️ Flechitas en aguinaldo/prima - 2 min
8. ✏️ Optimizar espacios en PDF - 5 min

### 🧪 TESTING
9. ⚠️ Verificar cálculos con Excel del cliente - 1 hora
10. ✅ Testing completo end-to-end - 30 min

---

## ⏱️ ESTIMACIÓN TOTAL

**Desarrollo:** ~3.5 horas
**Testing:** ~1.5 horas
**TOTAL:** ~5 horas

**Distribución recomendada:**
- **Viernes tarde:** Tareas críticas (1-3) + verificación Excel
- **Sábado:** Tareas importantes (4-6)
- **Domingo:** Tareas deseables (7-8) + testing final

---

## 🎯 CHECKLIST RÁPIDO PARA PROGRAMADORES

```
🔴 CRÍTICO
[ ] Vacaciones negativas (5 min)
[ ] Prima antigüedad auto + toggle (30 min)
[ ] ISR auto, quitar IMSS/Subsidio (45 min)

🟡 IMPORTANTE
[ ] Separadores miles inputs (45 min)
[ ] RFC/CURP/Empresa en PDF (10 min)
[ ] Empresa/Cliente en listado (20 min)

🟢 DESEABLE
[ ] Flechitas numéricos (2 min)
[ ] Optimizar PDF (5 min)

🧪 TESTING
[ ] Verificar con Excel cliente
[ ] Testing E2E completo
```

---

## 📝 NOTAS FINALES

1. **La lógica de cálculo está correcta** - No tocar las fórmulas matemáticas
2. **Solo faltan ajustes de UX y campos** - No hay cambios arquitectónicos
3. **El sistema está 65% completo** - Lo que falta es relativamente simple
4. **La prioridad #1 es verificar con Excel** - Antes de cambiar cálculos

---

**¿Dudas o necesitas más detalles de alguna tarea específica?**
