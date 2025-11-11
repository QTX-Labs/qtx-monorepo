---
name: m-implement-fecha-ingreso-impresa
branch: feature/fecha-ingreso-impresa
status: pending
created: 2025-11-11
---

# Implementar Fecha de Ingreso Impresa en Finiquitos

## Problem/Goal
Los clientes necesitan poder definir una fecha de ingreso específica para imprimir en el PDF del finiquito, independiente de las fechas usadas para cálculos fiscales o reales. Actualmente, el PDF usa las fechas de cálculo, pero algunos casos requieren mostrar una fecha diferente por razones legales o administrativas.

## Success Criteria
- [ ] Campo "Fecha de Ingreso Impresa" agregado en Step 1 sección "Datos Básicos"
- [ ] Campo permite seleccionar cualquier fecha sin validaciones de pasado/futuro
- [ ] Nueva propiedad `printedHireDate` se guarda en la base de datos (modelo Finiquito)
- [ ] PDF usa `printedHireDate` cuando está presente
- [ ] Fallback para finiquitos existentes sin esta propiedad:
  - Si `complementoActivado = true`: usa `realHireDate`
  - Si `complementoActivado = false`: usa `fiscalHireDate`
- [ ] Lógica de fallback implementada en template PDF
- [ ] Validación de que finiquitos nuevos guardan correctamente la fecha impresa
- [ ] Validación de que finiquitos existentes siguen funcionando con el fallback

## Context Manifest

### How the Finiquito System Currently Works

**Overview:**
The finiquito system is a comprehensive severance pay calculator for Mexican labor law compliance. It follows a multi-step wizard architecture where users input employee data, configure calculation factors, apply deductions, and review results before saving. The system stores all data in version 2 format (version field = 2) with extensive support for fiscal calculations, complemento (salary differences), and liquidación (indemnifications).

**The Hire Date Flow - Critical for This Feature:**

Currently, the system handles hire dates in three distinct ways:

1. **Fiscal Hire Date (`hireDate`)**: The primary hire date field used for all fiscal calculations (aguinaldo, vacations, etc.). This is ALWAYS required and stored in the database.

2. **Real Hire Date (`realHireDate`)**: Optional field that only appears when "complemento" is activated. Used for complemento (salary difference) calculations. Stored in database as nullable DateTime.

3. **PDF Display**: Currently, the PDF template uses `hireDate` directly in two places:
   - Line 357: "QUE VENIA DESEMPEÑANDO DESDE EL {formatDateLong(finiquito.hireDate)}"
   - Line 410: "Fecha de ingreso: {formatDateLong(finiquito.hireDate)}"

**Why We Need Printed Hire Date:**

Some clients need to display a different hire date on the PDF for legal or administrative reasons (e.g., contract amendments, seniority adjustments) WITHOUT affecting the actual calculations. The printed date is purely cosmetic for documentation purposes.

**Step 1 Form Architecture:**

The Step 1 component (`step1-base-config.tsx`) is a complex React Hook Form with:
- 29 form fields organized into sections: "Datos Básicos", "Factores Fiscales", "Prestaciones", "Complemento", "Liquidación"
- Auto-calculation effects that trigger when dependencies change (borderZone → fiscalDailySalary, hireDate/terminationDate → vacationDays, etc.)
- Manual edit tracking via useRef to preserve user changes
- Conditional field rendering based on toggle states (complementoActivado, liquidacionActivada)
- Uses native HTML date inputs (`<Input type="date" />`) with ISO string conversion

**Current Date Fields in Step 1:**
- Lines 572-588: `hireDate` (Fecha de Ingreso Fiscal) - always visible, required
- Lines 590-606: `terminationDate` (Fecha de Baja) - always visible, required
- Lines 849-865: `realHireDate` (Fecha de Ingreso Real) - only visible when complementoActivado=true, conditionally required

**Date Input Pattern:**
```tsx
<Input
  type="date"
  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
  onChange={(e) => field.onChange(new Date(e.target.value))}
/>
```

**Schema Validation:**

The Step 1 schema (`step1-base-config-schema.ts`) uses Zod with:
- `z.coerce.date()` for automatic date parsing
- Cross-field validations via `.refine()` chains
- Conditional validation (e.g., realHireDate required when complementoActivado=true)

Current hire date validations:
- Line 43: `hireDate: z.coerce.date({ required_error: 'La fecha de ingreso fiscal es requerida' })`
- Line 80: `realHireDate: z.coerce.date().optional()`
- Lines 110-116: Cross-validation ensuring terminationDate >= hireDate

**Database Schema:**

The Finiquito model (`schema.prisma` lines 610-838) stores hire dates as:
- `hireDate DateTime @db.Date` (required, line 630)
- `realHireDate DateTime? @db.Date` (nullable, line 645)

**CRITICAL**: All date fields use `@db.Date` type, not `@db.Timestamp`. This stores dates without time components, avoiding timezone issues.

**Create Action Flow:**

When a finiquito is saved (`create-finiquito.ts`):
1. Line 22-54: Calls `calculateFiniquitoComplete()` with form data
2. Line 79: Maps calculation results to Prisma fields via `mapCalculationToPrisma()`
3. Lines 85-159: Creates database record with all fields
4. Line 107: Stores `hireDate: parsedInput.hireDate`
5. Line 119: Stores `realHireDate: parsedInput.realHireDate ?? null`

**Duplication Flow:**

When duplicating a finiquito (`duplicate-finiquito.ts`):
1. Fetches complete finiquito via `getFiniquitoById()`
2. Maps to wizard format using three functions:
   - `mapFiniquitoToStep1()`: Line 40 maps `hireDate: finiquito.hireDate`
   - `mapFiniquitoToStep2()`: Maps factors
   - `mapFiniquitoToStep3()`: Maps deductions
3. Lines 53-61: Serializes/deserializes, then restores Date objects

**Custom Identifier Pattern:**

The system already has an optional field `customFiniquitoIdentifier` (max 20 chars) that follows this exact pattern:
- Step 1 schema: Lines 28-30 define max length validation
- Step 1 form: Lines 448-463 render optional text input with description
- Database: `customFiniquitoIdentifier String? @db.VarChar(20)` (line 623)
- Create action: Line 98 saves it
- Duplication: Lines 16-20 truncate to 15 chars and append "-copy"

**PDF Template Architecture:**

The PDF template (`finiquito-pdf-template.tsx`) uses @react-pdf/renderer with:
- Dynamic margin/font adjustments based on concept count (lines 310-338)
- Helper functions for data conversion (toNumber, formatCurrency)
- `formatDateLong()` utility for Spanish date formatting (from utils.ts)
- Two pages: resignation letter (lines 344-398) + receipt (lines 400-504)

Current hire date usage:
- Line 357: Resignation letter body text
- Line 410: Receipt metadata section

Both use: `{formatDateLong(finiquito.hireDate)}`

**Date Formatting Utilities:**

Two formatting functions available:
1. `formatDateLong()` in `utils.ts` (lines 197-218): Returns uppercase Spanish format "15 DE OCTUBRE DE 2025", uses UTC methods to avoid timezone issues
2. `formatDate()` in `format-helpers.ts` (lines 35-44): Returns title case format "15 octubre 2025", uses date-fns with es locale

**Detail View Display:**

The general info section (`general-info-section.tsx`) displays:
- Line 96-98: "Fecha de Ingreso: {formatDate(finiquito.hireDate)}" (always shown)
- Lines 109-114: "Fecha Ingreso Real: {formatDate(finiquito.realHireDate)}" (only when complementoActivado=true)

### What Needs to Connect: Printed Hire Date Implementation

**Database Layer:**

Add new nullable column to Finiquito model in `schema.prisma`:
```prisma
printedHireDate DateTime? @db.Date // Line 646, after realHireDate
```

This follows the exact pattern of `realHireDate` - nullable DateTime with Date type to avoid timezone issues.

**Migration Creation:**

Use pnpm workspace commands from project root:
```bash
# Navigate to database package
cd packages/database

# Create migration
pnpm prisma migrate dev --name add_printed_hire_date

# This generates migration file in prisma/migrations/
# Then regenerate Prisma client
pnpm prisma generate
```

The migration will add the column as nullable, ensuring backward compatibility with existing finiquitos.

**Step 1 Schema Update:**

Add field to `step1-base-config-schema.ts` after `realHireDate` (around line 81):
```typescript
printedHireDate: z.coerce.date().optional(),
```

No cross-validation needed since this field has no calculation dependencies.

**Step 1 Form Update:**

Add date input in `step1-base-config.tsx` in the "Factores Fiscales" section after `terminationDate` field (after line 606):

```tsx
<FormField
  control={form.control}
  name="printedHireDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Fecha de Ingreso Impresa (Opcional)</FormLabel>
      <FormControl>
        <Input
          type="date"
          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
        />
      </FormControl>
      <FormDescription>
        Fecha que aparecerá en el PDF. Si está vacío, se usa la fecha de ingreso fiscal o real según corresponda.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

**CRITICAL**: Use conditional assignment in onChange to support empty date clearing:
- If user clears the date input, `e.target.value` is empty string
- Pass `undefined` instead of `new Date('')` to avoid invalid date

**Default Values Update:**

Add to defaultValues in `step1-base-config.tsx` line 74:
```typescript
printedHireDate: undefined,
```

**Create Action Update:**

Add to `create-finiquito.ts` in the Prisma create data object (after line 119):
```typescript
printedHireDate: parsedInput.printedHireDate ?? null,
```

This stores the value if provided, otherwise NULL for backward compatibility.

**Duplication Mapping:**

Add to `mapFiniquitoToStep1()` in `map-finiquito-to-wizard.ts` (after line 55):
```typescript
printedHireDate: finiquito.printedHireDate || undefined,
```

**PDF Template Update:**

Implement fallback logic in `finiquito-pdf-template.tsx`:

1. Add helper function after line 131 (after toNumber function):
```typescript
// Determine which hire date to display in PDF
const displayHireDate = finiquito.printedHireDate ??
  (finiquito.complementoActivado ? finiquito.realHireDate : finiquito.hireDate);
```

2. Replace both usages:
   - Line 357: Change `{formatDateLong(finiquito.hireDate)}` to `{formatDateLong(displayHireDate)}`
   - Line 410: Change `{formatDateLong(finiquito.hireDate)}` to `{formatDateLong(displayHireDate)}`

**Fallback Logic Explanation:**
- If `printedHireDate` exists: use it (user explicitly set custom date)
- Else if `complementoActivado = true`: use `realHireDate` (salary difference scenario)
- Else: use `hireDate` (standard fiscal date)

This ensures existing finiquitos without printedHireDate continue working correctly.

**Detail View Update (Optional):**

Consider adding display in `general-info-section.tsx` after line 114 if you want to show the printed date in detail view:
```tsx
{finiquito.printedHireDate && (
  <div>
    <span className="text-sm text-muted-foreground">Fecha Ingreso Impresa:</span>
    <p className="font-medium">{formatDate(finiquito.printedHireDate)}</p>
  </div>
)}
```

### Technical Reference Details

#### File Locations

**Schema & Validation:**
- Prisma schema: `/packages/database/prisma/schema.prisma` (model Finiquito, lines 610-838)
- Step 1 schema: `/apps/dashboard/lib/finiquitos/schemas/step1-base-config-schema.ts`
- Step 1 type: Auto-inferred from schema via `type Step1BaseConfig = z.infer<typeof step1BaseConfigSchema>`

**Components:**
- Step 1 form: `/apps/dashboard/components/organizations/slug/finiquitos/create/steps/step1-base-config.tsx`
- General info section: `/apps/dashboard/components/organizations/slug/finiquitos/detail/general-info-section.tsx`
- PDF template: `/apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx`

**Actions:**
- Create finiquito: `/apps/dashboard/actions/finiquitos/create-finiquito.ts`
- Duplicate finiquito: `/apps/dashboard/actions/finiquitos/duplicate-finiquito.ts`
- Wizard mapping: `/apps/dashboard/lib/finiquitos/map-finiquito-to-wizard.ts`

**Utilities:**
- Date formatting: `/apps/dashboard/lib/finiquitos/utils.ts` (formatDateLong function)
- Format helpers: `/apps/dashboard/lib/finiquitos/format-helpers.ts` (formatDate function)

#### Data Flow Diagram

```
User Input (Step 1)
  ↓
Step1BaseConfig type (validated by Zod)
  ↓
calculateFiniquitoComplete() (does NOT use printedHireDate - purely display)
  ↓
create-finiquito.ts action
  ↓
Prisma.finiquito.create({ data: { printedHireDate, ... } })
  ↓
Database (printedHireDate column, nullable DateTime)
  ↓
PDF Generation: displayHireDate = printedHireDate ?? (complemento ? realHireDate : hireDate)
  ↓
PDF Output
```

#### Key Patterns to Follow

1. **Nullable DateTime Pattern**: Use `DateTime?` in Prisma, `z.coerce.date().optional()` in Zod, `undefined` in TypeScript
2. **Date Input Pattern**: Always convert to/from ISO string for HTML date inputs
3. **Empty Date Handling**: Use conditional in onChange to support clearing: `e.target.value ? new Date(e.target.value) : undefined`
4. **Backward Compatibility**: Default to null/undefined, implement fallback logic in PDF
5. **Database Date Type**: Use `@db.Date` not `@db.Timestamp` to avoid timezone issues
6. **Duplication Handling**: Map field in `mapFiniquitoToStep1()` using `|| undefined` pattern

#### Migration Command Reference

```bash
# From project root
cd packages/database

# Create migration
pnpm prisma migrate dev --name add_printed_hire_date

# Regenerate Prisma client (runs automatically after migrate dev)
pnpm prisma generate

# If needed, push to database without migration
pnpm prisma db push --skip-generate

# Return to root
cd ../..
```

#### Validation Requirements

- No temporal validation (no past/future checks)
- No relationship validation with other dates
- Optional field, no required validation
- No cross-field dependencies in calculations
- PDF fallback handles null case automatically

#### Testing Checklist

After implementation, verify:
1. New finiquito with printedHireDate set → PDF shows printed date
2. New finiquito without printedHireDate, complemento OFF → PDF shows fiscal hireDate
3. New finiquito without printedHireDate, complemento ON → PDF shows realHireDate
4. Existing finiquito (NULL printedHireDate) → PDF continues working with fallback
5. Duplicate finiquito with printedHireDate → preserves printed date in wizard
6. Clear printed date in form → saves as NULL
7. Detail view (if added) → displays printed date when present
8. Date input supports empty/clearing behavior

## User Notes
Requisitos específicos:
- Campo en Step 1 "Datos Básicos" después de las fechas de ingreso fiscal/real
- Sin validaciones temporales (libre para cualquier fecha)
- Base de datos: nueva columna `printedHireDate` (DateTime, nullable)
- PDF fallback logic:
  ```typescript
  const displayHireDate = printedHireDate ??
    (complementoActivado ? realHireDate : fiscalHireDate);
  ```

## Work Log
<!-- Updated as work progresses -->
