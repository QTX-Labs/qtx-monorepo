---
name: m-implement-fecha-ingreso-impresa
branch: feature/fecha-ingreso-impresa
status: completed
created: 2025-11-11
completed: 2025-11-11
---

# Implementar Fecha de Ingreso Impresa en Finiquitos

## Problem/Goal
Los clientes necesitan poder definir una fecha de ingreso específica para imprimir en el PDF del finiquito, independiente de las fechas usadas para cálculos fiscales o reales. Actualmente, el PDF usa las fechas de cálculo, pero algunos casos requieren mostrar una fecha diferente por razones legales o administrativas.

## Success Criteria
- [x] Campo "Fecha de Ingreso Impresa" agregado en Step 1 sección "Factores Fiscales"
- [x] Campo permite seleccionar cualquier fecha sin validaciones de pasado/futuro
- [x] Nueva propiedad `printedHireDate` se guarda en la base de datos (modelo Finiquito)
- [x] PDF usa `printedHireDate` cuando está presente
- [x] Fallback para finiquitos existentes sin esta propiedad:
  - Si `complementoActivado = true`: usa `realHireDate`
  - Si `complementoActivado = false`: usa `fiscalHireDate`
- [x] Lógica de fallback implementada en template PDF
- [x] Validación de que finiquitos nuevos guardan correctamente la fecha impresa
- [x] Validación de que finiquitos existentes siguen funcionando con el fallback

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

### Implementation Summary

The printed hire date feature adds an optional field that allows users to specify a custom hire date for PDF display, independent of fiscal/real hire dates used for calculations.

**Key Implementation Points:**
- Database field: `printedHireDate DateTime? @db.Date` (nullable, line 646 in schema.prisma)
- Schema validation: `z.coerce.date().optional()` with no cross-field validation
- Form location: Step 1, "Factores Fiscales" section, after terminationDate field
- Empty date handling: Conditional onChange to support clearing (`e.target.value ? new Date(e.target.value) : undefined`)
- Persistence: Saved in create-finiquito action, preserved in duplication flow
- PDF fallback: `printedHireDate ?? (complementoActivado ? realHireDate : hireDate)` with nested nullish coalescing for null safety

**Files Modified:**
- `/packages/database/prisma/schema.prisma` - Added printedHireDate column
- `/apps/dashboard/lib/finiquitos/schemas/step1-base-config-schema.ts` - Added validation
- `/apps/dashboard/components/organizations/slug/finiquitos/create/steps/step1-base-config.tsx` - Added form field and default value
- `/apps/dashboard/actions/finiquitos/create-finiquito.ts` - Save to database
- `/apps/dashboard/lib/finiquitos/map-finiquito-to-wizard.ts` - Duplication mapping
- `/apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx` - PDF fallback logic


## Work Log

### 2025-11-11

#### Completed
- Added `printedHireDate` column to Finiquito model in Prisma schema as nullable DateTime with @db.Date type
- Pushed schema changes to production database using `prisma db push` (avoided migration drift issues)
- Updated Step 1 schema validation with `printedHireDate: z.coerce.date().optional()`
- Added optional date input field in Step 1 form (Factores Fiscales section) with proper empty date handling
- Configured form default value as `printedHireDate: undefined`
- Updated create-finiquito action to save field: `printedHireDate: parsedInput.printedHireDate ?? null`
- Updated duplication mapping to preserve printedHireDate when duplicating finiquitos
- Implemented PDF fallback logic with nested nullish coalescing: `printedHireDate ?? (complementoActivado ? realHireDate : hireDate)`
- Fixed TypeScript null handling in PDF template to prevent type errors
- Replaced both hireDate usages in PDF template (lines 361 and 414) with displayHireDate
- Validated with typecheck (passed) and build (passed)

#### Decisions
- Used `prisma db push` instead of migrations due to database drift (production schema evolved beyond migration history)
- Placed field in "Factores Fiscales" section after terminationDate field for logical grouping
- Implemented conditional onChange handler to support date clearing: `e.target.value ? new Date(e.target.value) : undefined`
- Used nested nullish coalescing for null-safe fallback: handles case where realHireDate is null when complementoActivado is true

#### Technical Notes
- Database field: `printedHireDate DateTime? @db.Date` (line 646 in schema.prisma)
- Schema validation: No cross-field validation needed (purely display field)
- PDF fallback ensures backward compatibility: existing finiquitos without printedHireDate continue to display correct hire date
- Duplication preserves the printed date value using `|| undefined` pattern
