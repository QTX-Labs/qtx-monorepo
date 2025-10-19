# 📋 PLAN DE IMPLEMENTACIÓN - 35% FALTANTE
## Sistema de Finiquitos QTX

**Fecha de creación:** 19 de Octubre, 2025
**Deadline:** Lunes (20 de Octubre)
**Tiempo estimado total:** ~5 horas
**Desarrollador asignado:** _____________

---

## 🎯 OBJETIVO

Completar el 35% faltante del sistema de finiquitos implementando 8 tareas específicas antes del lunes, asegurando que los cálculos coincidan EXACTAMENTE con el Excel del cliente.

---

## 📊 RESUMEN DE TAREAS

| # | Prioridad | Tarea | Tiempo | Estado |
|---|-----------|-------|--------|--------|
| 1 | 🔴 CRÍTICO | Vacaciones negativas | 5 min | ⏳ |
| 2 | 🔴 CRÍTICO | Prima antigüedad auto + toggle | 30 min | ⏳ |
| 3 | 🔴 CRÍTICO | ISR auto, eliminar IMSS/Subsidio | 45 min | ⏳ |
| 4 | 🟡 IMPORTANTE | Separadores miles en inputs | 45 min | ⏳ |
| 5 | 🟡 IMPORTANTE | PDF: agregar RFC/CURP/Empresa | 10 min | ⏳ |
| 6 | 🟡 IMPORTANTE | Listado: columnas Empresa/Cliente | 20 min | ⏳ |
| 7 | 🟢 DESEABLE | Flechitas en campos numéricos | 2 min | ⏳ |
| 8 | 🟢 DESEABLE | Optimizar espacios PDF | 5 min | ⏳ |
| 9 | 🧪 TESTING | Verificar con Excel del cliente | 1 hora | ⏳ |

---

## 🚀 PLAN DE EJECUCIÓN DETALLADO

### 📅 **VIERNES (19 Oct) - TARDE**
**Objetivo:** Completar tareas CRÍTICAS + Verificación Excel
**Tiempo:** 2.5 horas

#### **FASE 1: PREPARACIÓN (15 min)**

1. **Crear branch de trabajo**
   ```bash
   cd /Users/manny/Projects/qtx/qtx-monorepo
   git checkout -b feature/finiquitos-35-percent-fixes
   ```

2. **Verificar que todo compile**
   ```bash
   npm run build
   # Asegurar que no hay errores
   ```

3. **Preparar entorno de testing**
   - Abrir el sistema en desarrollo: http://localhost:3000
   - Tener el Excel del cliente abierto
   - Preparar datos de prueba

---

#### **FASE 2: TAREAS CRÍTICAS (1h 20min)**

### 🔴 **TAREA 1: Permitir Vacaciones Negativas** (5 min)
**Prioridad:** CRÍTICA
**Complejidad:** Muy Baja

**Archivos a modificar:**
1. `apps/dashboard/lib/finiquitos/schemas.ts`

**Cambios específicos:**

```typescript
// LÍNEA 50 - ANTES:
pendingVacationDays: z.coerce.number().nonnegative().default(0),

// LÍNEA 50 - DESPUÉS:
pendingVacationDays: z.coerce.number().default(0), // Permite negativos

// LÍNEA 54 - ANTES:
complementPendingVacationDays: z.coerce.number().nonnegative().default(0),

// LÍNEA 54 - DESPUÉS:
complementPendingVacationDays: z.coerce.number().default(0), // Permite negativos
```

2. `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx`

```typescript
// LÍNEA 998 - AGREGAR EN FormDescription:
<FormDescription>
  Días pendientes por pagar. Usar positivo (+) si se deben al empleado,
  negativo (-) si el empleado debe días
</FormDescription>

// LÍNEA 1049 - AGREGAR EN FormDescription (complemento):
<FormDescription>
  Días pendientes de complemento. Usar positivo (+) si se deben,
  negativo (-) si debe días
</FormDescription>
```

**Testing:**
```
✓ Ingresar -5 en vacaciones pendientes
✓ Verificar que el cálculo resta correctamente
✓ Verificar que se guarda con valor negativo
```

---

### 🔴 **TAREA 2: Prima de Antigüedad Automática con Toggle** (30 min)
**Prioridad:** CRÍTICA
**Complejidad:** Media

**Archivos a modificar:**

1. **PASO 1: Agregar campo al schema**
   `apps/dashboard/lib/finiquitos/schemas.ts`

```typescript
// DESPUÉS DE LÍNEA 66, AGREGAR:
// Prima de antigüedad
includeSeniorityPremium: z.boolean().default(false),
calculateSeniorityPremium: z.boolean().default(true), // Calcular por default
```

2. **PASO 2: Agregar función de cálculo**
   `apps/dashboard/lib/finiquitos/utils.ts`

```typescript
// AL FINAL DEL ARCHIVO, AGREGAR:

/**
 * Calcula los días de prima de antigüedad según años trabajados
 * Fórmula: 12 días por año trabajado
 *
 * @param yearsWorked - Años trabajados con decimales
 * @returns Días de prima de antigüedad
 */
export function calculateSeniorityPremiumDays(
  yearsWorked: number,
  borderZone: BorderZone
): number {
  // 12 días por año trabajado
  const days = yearsWorked * 12;

  // Tope: 2 veces el salario mínimo de la zona
  const minimumSalary = getMinimumSalary(borderZone);
  const maxDailySalary = minimumSalary * 2;

  // Por ahora retornamos los días calculados
  // El tope se aplica en el monto, no en los días
  return round(days, DECIMAL_PRECISION.DAYS);
}
```

3. **PASO 3: Modificar formulario**
   `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx`

```typescript
// DESPUÉS DE LÍNEA 157 (watches), AGREGAR:
const includeSeniorityPremium = form.watch('includeSeniorityPremium');
const calculateSeniorityPremium = form.watch('calculateSeniorityPremium');

// DESPUÉS DE LÍNEA 223 (useEffect de liquidación), AGREGAR:
// Auto-calcular prima de antigüedad
useEffect(() => {
  if (calculateSeniorityPremium && hireDate && terminationDate) {
    const daysWorked = calculateDaysWorked(hireDate, terminationDate);
    const yearsWorked = calculateYearsWorked(daysWorked);
    const seniorityDays = calculateSeniorityPremiumDays(yearsWorked, borderZone);
    form.setValue('seniorityPremiumDays', seniorityDays);
  }
}, [calculateSeniorityPremium, hireDate, terminationDate, borderZone, form]);

// REEMPLAZAR SECCIÓN DE PRIMA DE ANTIGÜEDAD (líneas 1181-1200):
{/* Prima de Antigüedad con Toggle */}
<div>
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-sm font-medium">Prima de Antigüedad</h3>
      <p className="text-sm text-muted-foreground">
        Se calcula automáticamente (12 días por año)
      </p>
    </div>
    <FormField
      control={form.control}
      name="includeSeniorityPremium"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center gap-2">
          <FormLabel className="!mt-0 text-sm">
            Incluir en finiquito
          </FormLabel>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={!enableLiquidation}
            />
          </FormControl>
        </FormItem>
      )}
    />
  </div>

  <div className="grid gap-6 md:grid-cols-2">
    <FormField
      control={form.control}
      name="seniorityPremiumDays"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Días de Prima de Antigüedad</FormLabel>
          <div className="flex items-center gap-2">
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                disabled={!enableLiquidation || calculateSeniorityPremium}
                className={calculateSeniorityPremium ? "bg-muted cursor-not-allowed" : ""}
              />
            </FormControl>
            <FormField
              control={form.control}
              name="calculateSeniorityPremium"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormLabel className="!mt-0 text-xs">Auto</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!enableLiquidation}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormDescription>
            {calculateSeniorityPremium
              ? "Calculado: 12 días × años trabajados"
              : "Ingrese manualmente los días"}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
</div>
```

4. **PASO 4: Ajustar cálculo final**
   `apps/dashboard/lib/finiquitos/calculate-finiquito.ts`

```typescript
// LÍNEA 111-113 - MODIFICAR:
// Prima de antigüedad (aplicar solo si está incluida)
const finalSeniorityPremiumDays = input.includeSeniorityPremium
  ? (input.seniorityPremiumDays || 0)
  : 0;
```

**Testing:**
```
✓ Toggle OFF por default
✓ Se calcula automáticamente (12 días × años)
✓ Toggle ON incluye en cálculo
✓ Toggle OFF excluye del cálculo
✓ Switch Auto ON/OFF permite edición manual
```

---

### 🔴 **TAREA 3: ISR Automático, Eliminar IMSS y Subsidio** (45 min)
**Prioridad:** CRÍTICA
**Complejidad:** Alta

**PASO 1: Eliminar campos del schema**
`apps/dashboard/lib/finiquitos/schemas.ts`

```typescript
// ELIMINAR LÍNEAS 69-70:
// isrAmount: z.coerce.number().nonnegative().default(0),
// subsidyAmount: z.coerce.number().nonnegative().default(0),
```

**PASO 2: Limpiar el formulario**
`apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx`

```typescript
// ELIMINAR LÍNEA 120:
// subsidyAmount: 0,

// ELIMINAR LÍNEA 167:
// const subsidyAmount = form.watch('subsidyAmount');

// ELIMINAR LÍNEA 185:
// const debouncedSubsidyAmount = useDebounce(subsidyAmount, 300);

// ELIMINAR LÍNEA 263:
// subsidyAmount: debouncedSubsidyAmount,

// ELIMINAR LÍNEA 303:
// debouncedSubsidyAmount,

// REEMPLAZAR SECCIÓN DE DEDUCCIONES (líneas 1206-1314):
{/* Deducciones */}
<Card className="border-2 hover:border-muted-foreground/20 transition-colors">
  <CardHeader className="space-y-1 pb-4">
    <CardTitle className="text-xl">Deducciones</CardTitle>
    <CardDescription>Montos a descontar del finiquito</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* ISR Calculado Automáticamente */}
    {calculationResult && (
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <FormLabel>ISR (Calculado Automáticamente)</FormLabel>
            <Input
              type="text"
              value={`$${formatMoney(calculationResult.deductions.isr)}`}
              disabled
              className="bg-muted cursor-not-allowed mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Calculado según percepciones totales
            </p>
          </div>
          <div>
            <FormLabel>Total Percepciones (Base ISR)</FormLabel>
            <Input
              type="text"
              value={`$${formatMoney(calculationResult.fiscalPerceptions.totalPerceptions)}`}
              disabled
              className="bg-muted cursor-not-allowed mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Base para cálculo de ISR
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Deducciones Manuales */}
    <div className="grid gap-6 md:grid-cols-3">
      <FormField
        control={form.control}
        name="infonavitAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Infonavit</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fonacotAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fonacot</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="otherDeductions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Otras Deducciones</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>
              Cualquier otra deducción aplicable
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </CardContent>
</Card>
```

**PASO 3: Ajustar el cálculo**
`apps/dashboard/lib/finiquitos/calculate-finiquito.ts`

```typescript
// LÍNEA 133-140 - CAMBIAR A:
// Calcular deducciones FISCALES (ISR siempre automático)
const fiscalISR = calculateISR(fiscalPerceptions.totalPerceptions);
const fiscalDeductions = calculateDeductions({
  isr: fiscalISR,
  subsidy: 0, // Ya no se usa
  infonavit: input.infonavitAmount,
  fonacot: input.fonacotAmount,
  other: input.otherDeductions
});
```

**PASO 4: Mejorar función de ISR**
`apps/dashboard/lib/finiquitos/calculate-deductions.ts`

```typescript
// LÍNEA 55-64 - MEJORAR:
/**
 * Calcula ISR para finiquitos
 * Tabla simplificada 2025
 */
export function calculateISR(totalPerceptions: number): number {
  // Exento hasta 90 UMAs (aproximadamente)
  const UMA = 108.57; // UMA 2025
  const diasExentos = 90;
  const montoExento = UMA * diasExentos; // ~9,771.30

  if (totalPerceptions <= montoExento) {
    return 0;
  }

  // Aplicar tasa simplificada del 30% sobre el excedente
  const excedente = totalPerceptions - montoExento;
  const isr = excedente * 0.30;

  return round(isr, DECIMAL_PRECISION.MONEY);
}
```

**PASO 5: Verificar acciones de crear/actualizar**

Revisar que no usen `isrAmount` o `subsidyAmount`:
- `apps/dashboard/actions/finiquitos/create-finiquito.ts`
- `apps/dashboard/actions/finiquitos/update-finiquito.ts`

**Testing:**
```
✓ ISR se calcula automáticamente
✓ ISR no es editable
✓ IMSS no aparece
✓ Subsidio no aparece
✓ Solo 3 deducciones manuales
```

---

#### **FASE 3: VERIFICACIÓN CON EXCEL (1 hora)**

### 🧪 **Verificación con Excel del Cliente**

1. **Preparar datos de prueba del Excel:**
   ```
   Empleado: [Nombre del Excel]
   Salario: [Monto del Excel]
   Fecha ingreso: [Fecha del Excel]
   Fecha baja: [Fecha del Excel]
   Aguinaldo: [Días del Excel]
   Prima vacacional: [% del Excel]
   ```

2. **Crear finiquito en el sistema con mismos datos**

3. **Comparar línea por línea:**
   ```
   [ ] Aguinaldo proporcional: Sistema $___ vs Excel $___
   [ ] Prima vacacional: Sistema $___ vs Excel $___
   [ ] Vacaciones: Sistema $___ vs Excel $___
   [ ] ISR: Sistema $___ vs Excel $___
   [ ] Total: Sistema $___ vs Excel $___
   ```

4. **Si hay diferencias > $0.50:**
   - Documentar la diferencia
   - Revisar fórmulas
   - NO cambiar hasta confirmar con el cliente

---

### 📅 **SÁBADO (20 Oct) - MAÑANA**
**Objetivo:** Completar tareas IMPORTANTES
**Tiempo:** 1.5 horas

#### **FASE 4: TAREAS IMPORTANTES**

### 🟡 **TAREA 4: Separadores de Miles en Inputs** (45 min)
**Prioridad:** IMPORTANTE
**Complejidad:** Media

**PASO 1: Crear componente CurrencyInput**
`apps/dashboard/components/ui/currency-input.tsx` (NUEVO ARCHIVO)

```typescript
'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@workspace/ui/components/input';
import numeral from 'numeral';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
  disabled = false,
  className = ""
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Actualizar display cuando cambia el valor externo
  useEffect(() => {
    if (!isFocused && value !== undefined && value !== null) {
      setDisplayValue(numeral(value).format('0,0.00'));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Permitir vacío
    if (input === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Remover todo excepto números, punto y signo menos
    const cleaned = input.replace(/[^0-9.-]/g, '');

    // Validar formato
    const isValid = /^-?\d*\.?\d{0,2}$/.test(cleaned);

    if (isValid) {
      setDisplayValue(input);
      const num = parseFloat(cleaned) || 0;
      onChange(num);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Mostrar valor sin formato al enfocar
    if (value !== 0) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Aplicar formato al desenfocar
    const num = parseFloat(displayValue.replace(/[^0-9.-]/g, '')) || 0;
    setDisplayValue(numeral(num).format('0,0.00'));
    onChange(num);
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
```

**PASO 2: Usar en el formulario**
`apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx`

```typescript
// AGREGAR IMPORT AL INICIO:
import { CurrencyInput } from '~/components/ui/currency-input';

// REEMPLAZAR Input por CurrencyInput en:

// LÍNEA 744-755 (Salario real):
<FormControl>
  <CurrencyInput
    value={field.value}
    onChange={field.onChange}
    placeholder="12,999.90"
    disabled={!enableComplement}
  />
</FormControl>

// LÍNEA 1139-1150 (Gratificación pesos):
<FormControl>
  <CurrencyInput
    value={field.value || 0}
    onChange={(value) => handleGratificationPesosChange(value.toString())}
    placeholder="0.00"
    disabled={!enableLiquidation}
  />
</FormControl>

// LÍNEA 1256-1269 (Infonavit):
<FormControl>
  <CurrencyInput
    value={field.value}
    onChange={field.onChange}
    placeholder="0.00"
  />
</FormControl>

// LÍNEA 1277-1290 (Fonacot):
<FormControl>
  <CurrencyInput
    value={field.value}
    onChange={field.onChange}
    placeholder="0.00"
  />
</FormControl>

// LÍNEA 1296-1309 (Otras deducciones):
<FormControl>
  <CurrencyInput
    value={field.value}
    onChange={field.onChange}
    placeholder="0.00"
  />
</FormControl>
```

**Testing:**
```
✓ Muestra formato mientras escribes
✓ Permite negativos en vacaciones
✓ Al enfocar, muestra sin formato
✓ Al desenfocar, aplica formato
```

---

### 🟡 **TAREA 5: PDF - Agregar RFC, CURP y Empresa** (10 min)
**Prioridad:** IMPORTANTE
**Complejidad:** Muy Baja

**Archivo:** `apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx`

```typescript
// LÍNEAS 191-200 - REEMPLAZAR TODO EL BLOQUE:
<Text style={[styles.center, { marginTop: 10, marginBottom: 12, textAlign: 'center' }]}>
  <Text style={styles.bold}>R E C I B O   F I N I Q U I T O</Text>
</Text>

<Text style={{ marginBottom: 12 }}>
  <Text style={styles.bold}>Nombre completo:</Text> {finiquito.employeeName}{'\n'}
  <Text style={styles.bold}>RFC:</Text> {finiquito.employeeRFC || 'No proporcionado'}{'\n'}
  <Text style={styles.bold}>CURP:</Text> {finiquito.employeeCURP || 'No proporcionada'}{'\n'}
  <Text style={styles.bold}>Empresa:</Text> {finiquito.empresaName}{'\n'}
  <Text style={styles.bold}>Fecha de ingreso:</Text> {formatDateLong(finiquito.hireDate)}{'\n'}
  <Text style={styles.bold}>Fecha de baja:</Text> {formatDateLong(finiquito.terminationDate)}{'\n'}
  <Text style={styles.bold}>Puesto:</Text> {puesto}{'\n'}
  <Text style={styles.bold}>Salario diario:</Text> ${formatCurrency(finiquito.fiscalDailySalary)}{'\n'}
  <Text style={styles.bold}>Cantidad con letra:</Text> {salarioLetra} 00/100 M.N.{'\n'}
  <Text style={styles.bold}>Recibí de {finiquito.empresaName} la cantidad de:</Text> ${formatCurrency(totalNeto)}{'\n'}
  <Text style={styles.bold}>CANTIDAD CON LETRA:</Text> <Text style={styles.textUnderline}>{numeroALetra(totalNeto)}</Text> 00 / 100 M.N.
</Text>
```

**Testing:**
```
✓ PDF muestra RFC
✓ PDF muestra CURP
✓ PDF muestra nombre empresa
✓ PDF muestra fecha de baja
```

---

### 🟡 **TAREA 6: Listado - Agregar Columnas Empresa y Cliente** (20 min)
**Prioridad:** IMPORTANTE
**Complejidad:** Baja

**PASO 1: Actualizar tipos**
`apps/dashboard/components/organizations/slug/finiquitos/finiquitos-list.tsx`

```typescript
// LÍNEAS 48-61 - REEMPLAZAR:
type FiniquitoListItem = Pick<
  Finiquito,
  | 'id'
  | 'employeeName'
  | 'empresaName'      // ← AGREGAR
  | 'clientName'       // ← AGREGAR
  | 'hireDate'
  | 'terminationDate'
  | 'salary'
  | 'salaryFrequency'
  | 'borderZone'
  | 'totalToPay'
  | 'createdAt'
> & {
  user: Pick<User, 'name' | 'email'>;
};
```

**PASO 2: Actualizar tabla**

```typescript
// LÍNEAS 150-158 - REEMPLAZAR HEADERS:
<TableHeader>
  <TableRow>
    <TableHead>Empleado</TableHead>
    <TableHead>Empresa</TableHead>
    <TableHead>Cliente</TableHead>
    <TableHead>Fecha de Baja</TableHead>
    <TableHead>Total</TableHead>
    <TableHead>Creado Por</TableHead>
    <TableHead>Fecha</TableHead>
    <TableHead className="text-right">Acciones</TableHead>
  </TableRow>
</TableHeader>

// LÍNEAS 167-176 - AGREGAR CELDAS DESPUÉS DE employeeName:
<TableCell className="font-medium">
  {finiquito.employeeName}
</TableCell>
<TableCell className="text-sm">
  {finiquito.empresaName}
</TableCell>
<TableCell className="text-sm">
  {finiquito.clientName}
</TableCell>
```

**PASO 3: Actualizar query**
`apps/dashboard/data/finiquitos/get-finiquitos.ts`

```typescript
// AGREGAR empresaName y clientName al select:
const finiquitos = await prisma.finiquito.findMany({
  where: {
    organizationId: slug
  },
  select: {
    id: true,
    employeeName: true,
    empresaName: true,     // ← AGREGAR
    clientName: true,      // ← AGREGAR
    hireDate: true,
    terminationDate: true,
    salary: true,
    salaryFrequency: true,
    borderZone: true,
    totalToPay: true,
    createdAt: true,
    user: {
      select: {
        name: true,
        email: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

**Testing:**
```
✓ Listado muestra empresa
✓ Listado muestra cliente
✓ Columnas alineadas correctamente
```

---

### 📅 **SÁBADO (20 Oct) - TARDE**
**Objetivo:** Tareas DESEABLES + Testing Final
**Tiempo:** 1 hora

#### **FASE 5: TAREAS DESEABLES**

### 🟢 **TAREA 7: Flechitas en Campos Numéricos** (2 min)
**Prioridad:** DESEABLE
**Complejidad:** Muy Baja

**Archivo:** `apps/dashboard/components/organizations/slug/finiquitos/finiquito-form.tsx`

```typescript
// LÍNEA 915-921 (Aguinaldo):
<Input
  type="number"
  min="15"
  step="1"          // ← AGREGAR
  {...field}
  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
  disabled={!enableSuperiorBenefits}
/>

// LÍNEA 957-963 (Prima Vacacional):
<Input
  type="number"
  min="25"
  max="100"
  step="1"          // ← AGREGAR
  {...field}
  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
  disabled={!enableSuperiorBenefits}
/>

// LÍNEA 936-942 (Días de Vacaciones - aunque es auto):
<Input
  type="number"
  min="0"
  step="1"          // ← AGREGAR
  {...field}
  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
  disabled
  className="bg-muted cursor-not-allowed"
/>
```

**Testing:**
```
✓ Aparecen flechitas arriba/abajo
✓ Incrementan de 1 en 1
✓ Respetan mínimos
```

---

### 🟢 **TAREA 8: Optimizar Espacios en PDF** (5 min)
**Prioridad:** DESEABLE
**Complejidad:** Muy Baja

**Archivo:** `apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx`

```typescript
// LÍNEAS 19-40 - MODIFICAR ESTILOS:
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,           // ← CAMBIAR de 11 a 10
        lineHeight: 1.05,       // ← CAMBIAR de 1.08 a 1.05
        color: '#000000',
        paddingTop: 40,         // ← CAMBIAR de 52 a 40
        paddingBottom: 50,      // ← CAMBIAR de 72 a 50
        paddingLeft: 60,        // ← CAMBIAR de 72 a 60
        paddingRight: 60,       // ← CAMBIAR de 72 a 60
    },
    paragraph: {
        marginBottom: 8,        // ← CAMBIAR de 12 a 8
        textAlign: 'justify',
        textIndent: 50          // ← CAMBIAR de 70 a 50
    },
    signature: {
        marginTop: 30,          // ← CAMBIAR de 40 a 30
        textAlign: 'center',
        alignItems: 'center'
    },
    hr: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginVertical: 20      // ← CAMBIAR de 30 a 20
    }
});
```

**Testing:**
```
✓ PDF tiene menos páginas
✓ Texto sigue siendo legible
✓ Márgenes correctos
```

---

#### **FASE 6: TESTING FINAL (45 min)**

### 🧪 **Testing Completo E2E**

**1. Crear finiquito completo:**
```
[ ] Datos básicos correctos
[ ] Validaciones funcionan
[ ] Cálculos correctos
[ ] ISR automático
[ ] Prima antigüedad con toggle
[ ] Vacaciones negativas
[ ] Formato de miles
[ ] Se guarda correctamente
```

**2. Verificar PDF:**
```
[ ] RFC y CURP aparecen
[ ] Empresa aparece
[ ] Formato correcto
[ ] Menos páginas
```

**3. Verificar listado:**
```
[ ] Columna empresa
[ ] Columna cliente
[ ] Formato de moneda
```

**4. Casos extremos:**
```
[ ] 0 años trabajados
[ ] 30 años trabajados
[ ] Salario muy alto
[ ] Salario mínimo
[ ] Vacaciones -100 días
```

---

### 📅 **DOMINGO (21 Oct) - MAÑANA**
**Objetivo:** Preparación para Demo
**Tiempo:** 30 min

#### **FASE 7: PREPARACIÓN PARA DEMO**

1. **Merge a main:**
   ```bash
   git add .
   git commit -m "feat: complete 35% remaining finiquitos features

   - Allow negative vacation days
   - Add automatic seniority premium with toggle
   - Make ISR automatic, remove IMSS/Subsidy fields
   - Add thousand separators to currency inputs
   - Add RFC/CURP/Company to PDF
   - Add Company/Client columns to list
   - Add numeric steppers to benefit fields
   - Optimize PDF spacing"

   git push origin feature/finiquitos-35-percent-fixes

   # Crear PR en GitHub
   gh pr create --title "Complete 35% remaining finiquitos features" \
     --body "Implements all critical and important features for Monday demo"

   # Merge después de review
   ```

2. **Crear datos de demo:**
   - Finiquito con prestaciones mínimas
   - Finiquito con prestaciones superiores
   - Finiquito con liquidación completa
   - Finiquito con vacaciones negativas

3. **Preparar documentación:**
   - Excel comparativo
   - Lista de cambios implementados
   - Casos de prueba ejecutados

---

## 📊 MÉTRICAS DE ÉXITO

| Criterio | Meta | Verificación |
|----------|------|--------------|
| Cálculos coinciden con Excel | 100% | ✓ Diferencia < $0.50 |
| Validaciones funcionan | 100% | ✓ No permite valores inválidos |
| ISR automático | ✓ | No editable |
| Prima antigüedad | ✓ | Toggle funciona |
| Vacaciones negativas | ✓ | Acepta valores negativos |
| Formato miles | ✓ | Todos los campos de dinero |
| PDF completo | ✓ | RFC, CURP, Empresa visibles |
| Listado mejorado | ✓ | Columnas empresa/cliente |
| Build sin errores | ✓ | npm run build exitoso |
| Testing E2E | ✓ | Todos los casos pasan |

---

## 🚨 PUNTOS DE ATENCIÓN

1. **NO cambiar fórmulas matemáticas** - Solo ajustar cómo se pasan los parámetros
2. **Verificar con Excel ANTES de cambiar cálculos**
3. **Hacer backup antes de empezar:**
   ```bash
   git stash
   git checkout -b backup-before-changes
   git stash pop
   ```
4. **Si algo sale mal:**
   ```bash
   git checkout main
   git branch -D feature/finiquitos-35-percent-fixes
   ```
5. **Documentar CUALQUIER diferencia con Excel**

---

## 📝 CHECKLIST FINAL

### Antes de empezar:
- [ ] Branch creado
- [ ] Build funciona
- [ ] Excel del cliente disponible
- [ ] Entorno de desarrollo listo

### Durante el desarrollo:
- [ ] Commits frecuentes
- [ ] Testing después de cada tarea
- [ ] Documentar problemas encontrados

### Antes del demo:
- [ ] Todos los casos de prueba pasan
- [ ] Build de producción funciona
- [ ] PR aprobado y mergeado
- [ ] Datos de demo preparados
- [ ] Documentación lista

---

## 🎯 RESULTADO ESPERADO

Al completar este plan, el sistema de finiquitos estará 100% funcional con:
- ✅ Cálculos idénticos al Excel del cliente
- ✅ ISR automático sin campos manuales innecesarios
- ✅ Prima de antigüedad calculada automáticamente con opción de incluir/excluir
- ✅ Vacaciones pendientes permitiendo valores negativos
- ✅ Formato profesional con separadores de miles
- ✅ PDF completo con toda la información requerida
- ✅ Listado mejorado para búsquedas eficientes
- ✅ UX optimizada con controles numéricos
- ✅ Listo para demo el lunes

---

**¿Preguntas antes de comenzar la implementación?**