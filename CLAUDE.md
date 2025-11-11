
@sessions/CLAUDE.sessions.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 monorepo for building SaaS applications, powered by Turborepo, pnpm workspaces, Auth.js (authentication), and Prisma (database ORM). The project uses TypeScript, React 19, Tailwind CSS, and shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 15 with App Router, React 19, TypeScript, Node.js ≥20
- **UI**: shadcn/ui, Radix UI, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Auth.js (supports Google, Microsoft Entra ID, credentials)
- **Forms**: React Hook Form with Zod validation
- **State**: Nuqs (URL state), NiceModal (modal management)
- **Monorepo**: Turborepo with pnpm workspaces
- **Icons**: Lucide React
- **Billing**: Stripe integration
- **Email**: Supports Nodemailer, Resend, Postmark, SendGrid

## Monorepo Structure

The repository is organized into three main workspace types using the `@workspace/*` namespace:

### `/apps` - Applications (executable)
- `dashboard` - Main web application (port 3000)
- `marketing` - Marketing website (port 3001)
- `public-api` - Public API service (port 3002)

### `/packages` - Shared packages
- `database` - Prisma schema, client, and migrations
- `ui` - Shared design system (shadcn/ui components)
- `auth` - Authentication logic
- `billing` - Stripe payment handling
- `email` - Email templates and providers
- `api-keys` - API key management
- `webhooks` - Webhook helpers
- `analytics` - Analytics integrations
- `monitoring` - Sentry monitoring
- `rate-limit` - Rate limiting utilities
- `routes` - Shared route definitions
- `common` - Common utilities

### `/tooling` - Build configuration
- `eslint-config` - Shared ESLint rules
- `typescript-config` - Shared TypeScript configurations
- `prettier-config` - Shared Prettier config

## Common Commands

### Development
```bash
# Start all apps in parallel
pnpm dev

# Start specific app
pnpm --filter dashboard dev
pnpm --filter marketing dev
pnpm --filter public-api dev

# Run dev server with Turbopack (faster)
cd apps/dashboard && pnpm dev
```

### Building
```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm --filter dashboard build
```

### Code Quality
```bash
# Type checking across all workspaces
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:fix

# Bundle analysis
pnpm --filter dashboard analyze
```

### Testing
```bash
# Run all tests
pnpm test

# Test email functionality
pnpm test:email
```

### Database (Prisma)
```bash
# Generate Prisma client (required after schema changes)
pnpm --filter database generate

# Create and apply migrations (development)
pnpm --filter database migrate dev

# Push schema without migrations
pnpm --filter database push

# Open Prisma Studio (database GUI on port 3003)
pnpm --filter database studio
```

### Workspace Management
```bash
# Check for version mismatches across workspaces
pnpm syncpack:list

# Fix version mismatches
pnpm syncpack:fix

# Clean all build artifacts
pnpm clean
pnpm clean:workspaces

# Update all dependencies
pnpm update
```

## Architecture Patterns

### Dashboard App Structure
```
apps/dashboard/
├── app/               # Next.js App Router pages and layouts
├── actions/           # Server actions (*.ts files for mutations)
├── data/              # Data fetching functions (get-*.ts pattern)
├── components/        # React components
├── hooks/             # Custom React hooks
├── schemas/           # Zod validation schemas (*-schema.ts)
├── types/             # TypeScript type definitions
│   └── dtos/          # Data Transfer Objects (*-dto.ts)
├── lib/               # Utility functions
└── middleware.ts      # Next.js middleware
```

### File Naming Conventions
- **Files/directories**: `kebab-case` (e.g., `add-item-form.tsx`)
- **Components**: PascalCase exports (e.g., `AddItemForm`)
- **Actions**: `*.ts` in `/actions` folder
- **Data fetching**: `get-*.ts` in `/data` folder
- **Schemas**: `*-schema.ts` (e.g., `add-item-schema.ts`)
- **DTOs**: `*-dto.ts` in `/types/dtos`
- **Variables/functions**: camelCase
- **Types/classes**: PascalCase
- **Constants/env vars**: UPPERCASE

### Code Organization Principles
- Prefer **named exports** over default exports
- Use **functional components** with hooks exclusively
- Favor **small, single-purpose components** over monolithic ones
- Separate **presentational and container components**
- Use **React Server Components (RSC)** by default; minimize `'use client'`
- Use **server actions for mutations** instead of route handlers
- Structure files logically, grouping related components, helpers, types

### TypeScript Standards
- Prefer `type` over `interface` for consistency
- Avoid `any` completely; use `unknown` with type guards
- Use Zod schemas for runtime validation and TypeScript inference
- Define explicit DTOs for API boundaries
- Prefer union types over enums for string literals
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Function naming patterns: `get*`, `create*`, `validate*`, `handle*`

### Data Management
- Access database via `@workspace/database/client` (Prisma)
- Leverage Prisma's generated types for type safety
- Data fetching functions go in `/data` folder with `get-*` prefix
- Server actions for mutations go in `/actions` folder

### UI and Styling
- Use **shadcn/ui** and **Radix UI** components from `@workspace/ui`
- Style with **Tailwind CSS** using mobile-first approach
- Import components from `@workspace/ui/components`
- Use hooks from `@workspace/ui/hooks`
- Use utilities from `@workspace/ui/lib`
- Optimize images with `next/image`

### Error Handling
- Implement robust error handling with custom error types
- Provide clear, user-friendly error messages
- Use proper error boundaries in React components
- Handle errors gracefully in server actions

## Important Workflows

### Adding a New Feature
1. Determine if shared logic belongs in `/packages` or app-specific code
2. Create Zod schemas first for type inference and validation
3. Build data fetching in `/data` folder (RSC by default)
4. Build mutations in `/actions` folder using server actions
5. Create UI components (mark with `'use client'` only if needed)

### Database Schema Changes
1. Modify `packages/database/prisma/schema.prisma`
2. Run `pnpm --filter database migrate dev` to create and apply migration
3. Regenerate Prisma client: `pnpm --filter database generate`
4. Update `.env` files in apps if DATABASE_URL changed

### Running a Single Test
Check individual package.json files for test commands. Most packages use standard:
```bash
pnpm --filter <package-name> test
```

## Environment Variables

Key environment variables are managed in:
- `apps/dashboard/.env`
- `apps/marketing/.env`
- `apps/public-api/.env`
- `packages/database/.env`

Copy from `.env.example` files when setting up. See `turbo.json` for global environment variable configuration.

## Localization

The project is being translated to Spanish. Look for translation files and follow existing patterns when adding new text.

## Git Commit Format

When making commits, include co-authorship:

```
<main commit message>

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>
```

## Feature Modules

### Finiquito (Severance Pay) Calculator

The dashboard app includes a comprehensive finiquito calculator system for Mexican labor law compliance. The system is organized into calculation libraries and a multi-step wizard UI.

#### Architecture Overview

**Calculation Libraries** (`apps/dashboard/lib/finiquitos/`):
- `calculadora-factores/` - Calculates proportional factors (vacation, aguinaldo, etc.)
- `calculadora-finiquitos/` - Main finiquito calculation orchestration
- `calculadora-isr/` - ISR (tax) calculations
- `calculadora-infonavit/` - Infonavit credit calculations
- `calculate-finiquito-complete.ts` - Entry point that orchestrates all calculators

**Wizard UI** (`apps/dashboard/components/organizations/slug/finiquitos/create/`):
- Four-step wizard: Base Config → Factors → Deductions → Review
- Live calculation panel that updates as user edits data
- Shared context for managing wizard state across steps

#### Key Implementation Details

**Step-to-Step Data Flow:**
1. **Step 1 (Base Config)**: User enters employee info, dates, salaries
   - **Custom Identifier**: Optional field (max 20 chars) to help distinguish finiquitos in list view
     - Displayed below employee name in stacked layout on list page
     - When duplicating: original truncated to 15 chars, "-copy" appended
   - **Printed Hire Date**: Optional field to specify custom hire date for PDF display
     - Independent of fiscal/real hire dates used for calculations
     - Located in "Datos Básicos" section after terminationDate field (corrected placement as of Nov 2025)
     - Purely cosmetic for PDF documentation purposes
     - No validation constraints (can be any date, past/future/present)
     - Fallback logic when null: `complementoActivado ? realHireDate : fiscalHireDate` (with nested null safety)
     - Display includes fallback indicators in Step 4 Review and Detail View
   - **Vacation Days Editing**: Field is editable with smart auto-recalculation
     - When hire/termination dates change: recalculates vacation days automatically
     - When user manually edits vacation days: preserves manual value, only recalculates integration factor
     - When dates change after manual edit: resets to auto-calculated value
     - Integration factor formula: `FI = (365 + aguinaldo + (vacationDays * PV/100)) / 365`
   - **Step 1 Submit Handler Behavior**:
     - **New finiquito scenario** (when `step2Data` is null): Calls `calculateFiniquitoComplete()` without `manualFactors`, auto-populates Step 2 via `updateStep2()`, sets `diasTrabajados` and `septimoDia` to 0
     - **Duplication scenario** (when `step2Data` exists): Preserves all Step 2 values by passing `step2Data` as `manualFactors` parameter, skips `updateStep2()` call, only validates that liquidación/complemento factors match current toggle states
     - Both scenarios: Store calculation result via `updateLiveCalculation()` and advance to next step

2. **Step 2 (Factors)**: User reviews and edits calculated factors
   - Form pre-populated with factors from Step 1
   - Live calculation updates as user edits (debounced 300ms)
   - Supports fiscal + complement scenarios, liquidación + complement combinations
   - Gratificación converts bidirectionally between días and pesos
   - **CRITICAL**: Manual edits are preserved via `manualFactors` parameter when saving

3. **Step 3 (Deductions)**: User enters manual deductions (Infonavit, Fonacot, etc.)
   - Live calculation includes deductions in real-time

4. **Step 4 (Review)**: Final review before submission
   - Displays all concepts including pending vacation amounts and gratification

**Live Calculation System** (`hooks/use-live-calculation.ts`):
- Uses `form.watch()` to detect changes in form data
- Debounces Step 2 and Step 3 data (300ms) to prevent excessive recalculation
- Implements stable dependency comparison using `JSON.stringify()` + `useMemo()`
- Avoids infinite loops by comparing serialized values instead of object references
- Recalculates entire finiquito on each change, updating context

**Calculation Orchestration** (`calculate-finiquito-complete.ts`):
- Entry point: accepts `CalculateFiniquitoInput`, returns `CalculateFiniquitoOutput`
- **IMPORTANT**: Supports optional `manualFactors` parameter to preserve Step 2 user edits
- Flow:
  1. Calls `DefaultTerminationProportionalImpl` (calculadora-factores) for base factors
  2. Merges manual factors from Step 2 if provided (overrides calculated values)
  3. Calls `ImplementationV1` (calculadora-finiquitos) for monetary calculations
  4. Maps result to structured output with `factores`, `montos`, `isr`, `deducciones`, `totales`
- When creating finiquito: `create-finiquito.ts` must pass `step2Data` as `manualFactors` to preserve user edits

**Complemento Calculation - Net Differences** (Fixed Nov 2025):
- **Complemento represents a DIFFERENCE, not an addition**: When an employee's real salary exceeds their fiscal salary, the complemento pays only the net difference between the two amounts
- **Formula**: `Net Complemento = Complemento Amount - Fiscal Amount`
- **Example**: If aguinaldo fiscal = $1,200 and aguinaldo complemento = $1,600, the net complemento stored is $400 (not $1,600)
- **Applies to all perception concepts**:
  - Finiquito: días trabajados, séptimo día, vacaciones, vacaciones pendientes, prima vacacional, prima vacacional pendiente, aguinaldo
  - Liquidación complemento: 90-day indemnification, 20-day indemnification, seniority premium
- **Implementation**:
  - `implementation.ts` lines 265-278: Subtracts fiscal amounts from complemento amounts during summation
  - `calculate-finiquito-complete.ts` lines 489-502: Uses `mapNetComplementoPercept()` helper to map net values to output
  - Helper subtracts fiscal values from complemento for: `totalAmount`, `totalTaxBase`, `totalExemptBase`
- **Database storage**: Complemento fields (`montoDiasTrabajadosComplemento`, etc.) store NET differences, not full amounts
- **Total to pay calculation**: `totalAPagar = netoFiniquito + netoLiquidacion + netoLiquidacionComplemento + netoComplemento` (all net values)

**Important Data Distinctions:**
- **Prima Vacacional Factor vs Value**:
  - In `Step2Factors.primaVacacional`: stored as percentage factor (e.g., 0.24 for 24%)
  - In `ConceptosFiniquito.primaVacacional`: stored as vacation days (calculator applies percentage)
  - This prevents double-application of percentage during calculations
  - See `/home/n3m/projects/freelance/qtx-monorepo/apps/dashboard/lib/finiquitos/calculate-finiquito-complete.ts` lines 273-276

**Wizard Context** (`wizard-context.tsx`):
- Manages current step, data for all 4 steps, and live calculation result
- Provides navigation methods: `goNext()`, `goPrevious()`, `goToStep()`
- Update methods: `updateStep1()`, `updateStep2()`, `updateStep3()`, `updateLiveCalculation()`

#### Database Field Structure (Version 2)

**IMPORTANT**: The finiquito system uses version 2 field names. All new finiquitos are created with `version = 2`. When working with finiquito data, always use v2 field names:

**V2 Field Names (CURRENT - USE THESE):**
- Finiquito amounts: `montoDiasTrabajadosFiniquito`, `montoVacacionesFiniquito`, `montoPrimaVacacionalFiniquito`, `montoAguinaldoFiniquito`
- Finiquito factors: `factorDiasTrabajadosFiniquito`, `factorVacacionesFiniquito`, `factorPrimaVacacionalFiniquito`, `factorAguinaldoFiniquito`
- Liquidacion amounts: `montoIndemnizacion90Dias`, `montoIndemnizacion20Dias`, `montoPrimaAntiguedad`
- Complemento amounts: `montoDiasTrabajadosComplemento`, `montoVacacionesComplemento`, etc.
- **Liquidacion Complemento**: `totalPercepcionesLiquidacionComplemento`, `totalDeduccionesLiquidacionComplemento`, `totalLiquidacionComplemento`
- **Pending Concepts** (stored as input values for display):
  - `pendingVacationDays`, `pendingVacationPremiumDays` (fiscal)
  - `complementPendingVacationDays`, `complementPendingVacationPremiumDays` (complemento)
- **Input Preservation Fields** (store original input values before calculations):
  - `integrationFactor`, `complementIntegrationFactor`
  - `realSalary`, `complementIntegratedDailySalary`
  - `pendingWorkDays`
- Total to pay: `totalAPagar`
- Employee identification: `employeeRFC`, `employeeCURP` (both required)
- Custom identifier: `customFiniquitoIdentifier` (optional, max 20 chars) - helps distinguish finiquitos in list view
- Hire dates:
  - `hireDate DateTime @db.Date` (required) - Fiscal hire date used for calculations
  - `realHireDate DateTime? @db.Date` (optional) - Real hire date for complemento calculations
  - `printedHireDate DateTime? @db.Date` (optional) - Custom hire date for PDF display, independent of calculation dates

**V1 Field Names (DEPRECATED - DO NOT USE):**
- Legacy amounts: `realWorkedDaysAmount`, `realVacationAmount`, `realVacationPremiumAmount`, `realAguinaldoAmount`
- Legacy total: `totalToPay`
- These fields are NULL for all version 2 finiquitos

**Field Mapping Reference:**
See `/apps/dashboard/actions/finiquitos/helpers/map-calculation.ts` for the complete mapping from calculation results to Prisma fields. This file includes mappings for:
- Base finiquito concepts (fiscal amounts and factors)
- Liquidación concepts (90-day, 20-day indemnification, seniority premium)
- Complemento concepts (complement amounts for all categories)
- Liquidación Complemento totals (percepciones, deducciones, total)
- Input preservation fields (integration factors, pending concepts)

#### PDF Generation

**Hire Date Display** (`finiquito-pdf-template.tsx` lines 140-141, 361, 414):
The PDF template uses smart fallback logic to determine which hire date to display:
- **Primary**: Uses `printedHireDate` if provided (custom date specified by user in Step 1 "Datos Básicos")
- **Fallback when null**:
  - If `complementoActivado === true`: Uses `realHireDate` (or `hireDate` if `realHireDate` is also null)
  - If `complementoActivado === false`: Uses `hireDate` (fiscal hire date)
- Implementation: `const displayHireDate = printedHireDate ?? (complementoActivado ? (realHireDate ?? hireDate) : hireDate)`
- Displayed in two locations: resignation letter body (line 361) and receipt metadata section (line 414)
- Transparent to user: Step 4 Review and Detail View both show which date will be used with clear fallback indicators

**Dynamic Layout Optimization** (`finiquito-pdf-template.tsx`):
The PDF template dynamically adjusts margins and font size based on the number of concepts to prevent overflow to a third page:
- Counts concept lines: dynamic concepts + 1 total line
- **If > 4 lines**: Reduces margins
  - Horizontal: 2.54cm → 1.41cm
  - Vertical top: 1.83cm → 1.27cm
  - Vertical bottom: 2.54cm → 1.76cm
- **If >= 10 lines**: Also reduces font size from 11pt → 10pt
- Ensures signature section stays on second page

**Dynamic Concept Rendering**:
The PDF filters and displays only concepts with non-zero amounts, supporting:
- Fiscal finiquito concepts (días trabajados, vacaciones, prima vacacional, aguinaldo)
- Liquidación concepts (90-day/20-day indemnification, seniority premium)
- Complemento concepts (all categories)
- Pending concepts (vacaciones pendientes, prima vacacional pendiente)
- Gratification (if present)

**Complemento Configuration Dialog** (Added Nov 2025):
When downloading a finiquito PDF with complemento activated, users can customize how complemento concepts are displayed through a pre-download configuration dialog. This provides flexibility in grouping concepts for different business needs.

**User Flow:**
1. User clicks "Descargar PDF" button (from list or detail view)
2. If `complementoActivado === true`, configuration dialog appears automatically
3. If complemento inactive, PDF generates directly (no dialog shown)
4. Dialog presents two display modes:
   - **Desglosados (Itemized)**: Each complemento concept shows individually with its actual name
   - **Agrupados (Grouped)**: User creates custom groups with custom labels to sum selected concepts
5. For grouped mode:
   - Custom groups can be created (e.g., "BONOS", "AYUDA DE SUELDO", "GRATIFICACIÓN")
   - Maximum 20 groups allowed (security constraint to prevent DoS attacks)
   - Each group has an editable label (max 50 chars)
   - User selects which concepts belong to each group via checkboxes
   - Strict validation prevents concept reuse (each concept can only belong to one group)
   - Groups display summed amounts in PDF
6. Default configuration matches previous hardcoded behavior:
   - Finiquito-complemento concepts → "BONOS" group
   - Liquidación-complemento concepts → "GRATIFICACIÓN" group
7. User confirms configuration or cancels
8. PDF generates with selected configuration

**Technical Architecture:**

**Configuration Data Flow:**
- Dialog modal managed via NiceModal integration (`PDFComplementoConfigModal`)
- Configuration encoded as JSON and passed to API via URL query parameter
- API route validates configuration against Zod schema (`pdfComplementoConfigSchema`)
- PDF template receives optional `pdfConfig` prop for dynamic rendering
- Backward compatible: defaults to current grouping when no config provided

**Modal Component** (`pdf-complemento-config-modal.tsx`):
- Responsive design: Dialog for desktop (>= md breakpoint), Drawer for mobile
- Form validation with React Hook Form + Zod
- Dynamic group management via `useFieldArray` hook
- Smart checkbox disabling: concepts assigned to one group are disabled in others
- Visual feedback for assigned concepts ("ya asignado" label)
- Resolves with configuration object on submit, null on cancel

**Validation Layer** (`pdf-complemento-config-schema.ts`):
- Display mode validation: enum `['itemized', 'grouped']`
- Group validation: label required (1-50 chars), at least one concept per group
- Custom refinements:
  - Grouped mode must have at least one group
  - Strict duplicate prevention: no concept can appear in multiple groups
- TypeScript type inference for `PDFComplementoConfig`, `ConceptGroup`
- **Security Constraints:**
  - Maximum 20 groups (prevents DoS attacks via excessive group creation)
  - Concept field names limited to 30 characters with control character blocking
  - Group labels limited to 50 characters with control character blocking
  - Control character regex validation: `/^[^\x00-\x1F\x7F]+$/` prevents injection attacks

**Concept Definitions** (`pdf-complemento-config-defaults.ts`):
- `FINIQUITO_COMPLEMENTO_CONCEPTS`: 7 finiquito-complemento field mappings
- `LIQUIDACION_COMPLEMENTO_CONCEPTS`: 3 liquidación-complemento field mappings
- `ALL_COMPLEMENTO_CONCEPTS`: Combined array of all 10 concepts
- `DEFAULT_COMPLEMENTO_CONFIG`: Preserves previous behavior (BONOS + GRATIFICACIÓN)

**API Integration** (`/api/finiquitos/[id]/pdf/route.tsx`):
- Extracts `config` query parameter via `request.nextUrl.searchParams`
- Decodes URI component and parses JSON string
- Validates against schema, returns 400 error if invalid
- Passes validated config to PDF template component
- Null config when parameter absent (backward compatibility)
- Structured error logging with context (error message, truncated payload, finiquito ID, user ID) for security monitoring

**PDF Template Rendering** (`finiquito-pdf-template.tsx`):
- New `renderComplementoConcepts(config)` helper function
- Accepts optional `PDFComplementoConfig` parameter
- Itemized mode: filters concepts with amount > 0, maps to uppercase labels
- Grouped mode: sums concept amounts by group, filters out zero-amount groups
- Uses lodash `_.sum()` for robust summation
- Handles Prisma Decimal conversion via existing `toNumber()` utility
- Replaces previous hardcoded "BONOS" and "GRATIFICACIÓN" sections

#### Finiquito Duplication

The system supports duplicating existing finiquitos to streamline the creation of similar records. This feature is accessible from the finiquitos list view via the Actions dropdown menu.

**Duplication Workflow:**
1. User clicks "Duplicar" button in the Actions dropdown for any finiquito in the list
2. System fetches the complete finiquito data from the database
3. All data is transformed from database format to wizard step formats (Step 1, Step 2, Step 3)
4. Wizard opens with all fields pre-populated from the selected finiquito
5. **Step 2 Value Preservation**: When advancing from Step 1 to Step 2, all manually edited Step 2 values (gratification, pending vacation days, edited factors) are preserved by passing existing `step2Data` as `manualFactors` to `calculateFiniquitoComplete()`
6. User can modify any field (including the custom identifier) before saving
7. Clicking "Guardar Finiquito" creates a new database record (original remains unchanged)

**Custom Identifier Handling:**
- The `customFiniquitoIdentifier` field (optional, max 20 chars) helps users distinguish finiquitos in the list view
- Displayed below the employee name in stacked layout (matching date/time pattern)
- When duplicating WITH an identifier: original is truncated to 15 chars, "-copy" is appended (total max 20 chars)
- When duplicating WITHOUT an identifier: field remains empty (user can optionally add one)
- User can manually edit the identifier in Step 1 before saving the duplicated finiquito

**Technical Implementation:**

**Data Mapping Layer** (`/apps/dashboard/lib/finiquitos/map-finiquito-to-wizard.ts`):
- `mapFiniquitoToStep1()`: Maps all 31 Step 1 fields including employee info, dates (hireDate, realHireDate, printedHireDate), salaries, and toggles
- `mapFiniquitoToStep2()`: Maps all 22 factor groups (finiquito, liquidación, complemento, gratification, pending benefits)
- `mapFiniquitoToStep3()`: Maps all 3 manual deductions (Infonavit, Fonacot, Otras)
- Handles Prisma Decimal to number conversions throughout
- Implements custom identifier truncation logic
- Preserves `printedHireDate` when duplicating via `|| undefined` pattern (line 56)

**Server Action** (`/apps/dashboard/actions/finiquitos/duplicate-finiquito.ts`):
- Uses `authOrganizationActionClient` for proper authorization
- Fetches complete finiquito via `getFiniquitoById()`
- Validates finiquito exists and enforces version 2 requirement (v1 finiquitos cannot be duplicated)
- Transforms database model to wizard format using mapping functions
- Serializes Decimals and restores Date objects for client transmission
- Returns structured data ready for wizard consumption

**UI Integration:**
- Actions dropdown in list view includes "Duplicar" menu item
- `FiniquitosContent` component handles duplication via `handleDuplicateClick()` handler
- Success/error states displayed via toast notifications
- Wizard automatically opens with pre-populated data from context updates

**Step 2 Preservation Logic** (`step1-base-config.tsx` lines 253-297):
- Step 1 submit handler checks if `step2Data` exists in wizard context
- If exists (duplication scenario): passes entire `step2Data` as `manualFactors` parameter, validates toggle state consistency (liquidación/complemento factors only included if toggles are enabled), skips `updateStep2()` call to preserve all manually edited values
- If null (new finiquito): uses existing auto-population logic with fresh calculations
- Ensures gratification, pending vacation days, and all edited factors are maintained during Step 1 → Step 2 transition

**Version Requirement:**
Only version 2 finiquitos can be duplicated. This avoids complexity with legacy v1 field mappings and ensures all duplicated finiquitos use current field structure.

#### Known Edge Cases and Limitations

**Complemento Calculation Edge Cases:**

1. **Negative Net Complemento** (Not yet handled):
   - **Scenario**: When fiscal amount exceeds complemento amount (e.g., fiscal aguinaldo $1,600 vs complemento aguinaldo $1,200)
   - **Current behavior**: Subtraction produces negative value ($-400) which is included in totals
   - **Impact**: Can corrupt total to pay calculation if negative values aren't properly accounted for
   - **Status**: Edge case identified in code review (Nov 2025), validation layer not yet implemented
   - **Mitigation**: Unusual scenario (typically fiscal < real salary), likely indicates data entry error or retroactive adjustment
   - **Future work**: Add validation to prevent or warn when complemento < fiscal for any concept

2. **Tax Base Relationship Integrity** (Not yet validated):
   - **Invariant**: `totalAmount = totalTaxBase + totalExemptBase` must hold for each concept
   - **Current behavior**: Net complemento independently subtracts fiscal from complemento for all three fields
   - **Risk**: If fiscal and complemento have different tax exempt calculations, subtraction can violate the invariant (e.g., produce negative exempt base)
   - **Example**:
     - Fiscal: totalAmount=$100, taxBase=$75, exemptBase=$25
     - Complemento: totalAmount=$150, taxBase=$150, exemptBase=$0
     - Net: totalAmount=$50, taxBase=$75, exemptBase=$-25 (INVALID)
   - **Status**: Edge case identified in code review (Nov 2025), deeper analysis needed
   - **Mexican labor law context**: Tax exempt rules for severance concepts have specific thresholds (UMA-based) that may differ between fiscal and real salary calculations
   - **Future work**: Research correct tax base handling for net complemento, potentially require complemento tax bases to inherit fiscal exempt amounts

3. **Total Mismatch Between Layers** (Monitoring needed):
   - **Scenario**: Net complemento total calculated using `BigCalculatorImpl` may not exactly match sum of individual concept net amounts
   - **Cause**: If negative clamping or rounding differs between calculation layers
   - **Impact**: Minor discrepancies in cents between detail breakdown and summary totals
   - **Status**: Warning raised in code review, requires real-world testing
   - **Future work**: Add integration tests with complemento scenarios, monitor for user-reported discrepancies

**General Notes:**
- Edge cases primarily affect complemento (salary complement) feature, which is optional
- Most finiquitos use fiscal-only calculation without these risks
- Code review completed Nov 11, 2025 - follow-up task recommended for validation layer
- See task file `/sessions/tasks/h-fix-complemento-neto-calculation.md` for full technical analysis

#### File Reference

**Key Files:**
- Entry point: `/apps/dashboard/lib/finiquitos/calculate-finiquito-complete.ts` (orchestration, includes `mapNetComplementoPercept()` helper)
- Core calculator: `/apps/dashboard/lib/finiquitos/calculadora-finiquitos/implementation.ts` (monetary calculations, net complemento summation)
- Create action: `/apps/dashboard/actions/finiquitos/create-finiquito.ts` (includes manualFactors parameter, saves customFiniquitoIdentifier)
- Duplicate action: `/apps/dashboard/actions/finiquitos/duplicate-finiquito.ts` (fetches and transforms finiquito for duplication)
- Field mapping: `/apps/dashboard/actions/finiquitos/helpers/map-calculation.ts` (calculation to Prisma)
- Wizard mapping: `/apps/dashboard/lib/finiquitos/map-finiquito-to-wizard.ts` (Prisma to wizard format for duplication)
- PDF template: `/apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx` (hire date fallback logic lines 140-141)
- List components: `/apps/dashboard/components/organizations/slug/finiquitos/`
  - `finiquitos-list.tsx` (displays custom identifier, includes "Duplicar" action)
  - `finiquitos-content.tsx` (handles duplication click, manages wizard state)
- Detail sections: `/apps/dashboard/components/organizations/slug/finiquitos/detail/`
  - `general-info-section.tsx` (displays printed hire date with fallback indicator in Fechas section)
  - `finiquito-section.tsx` (displays pending concepts)
  - `complemento-section.tsx` (displays pending concepts)
  - `liquidacion-complemento-section.tsx` (displays liquidación complemento)
  - `total-section.tsx` (includes liquidación complemento in totals)
- Live calc hook: `/apps/dashboard/components/organizations/slug/finiquitos/create/hooks/use-live-calculation.ts`
- Wizard context: `/apps/dashboard/components/organizations/slug/finiquitos/create/wizard-context.tsx`
- Step 1: `/apps/dashboard/components/organizations/slug/finiquitos/create/steps/step1-base-config.tsx` (vacation days editing, custom identifier field, printed hire date field in "Datos Básicos" section)
- Step 2: `/apps/dashboard/components/organizations/slug/finiquitos/create/steps/step2-factors.tsx` (label corrections)
- Step 4: `/apps/dashboard/components/organizations/slug/finiquitos/create/steps/step4-review.tsx` (displays printed hire date with fallback indicator)
- Live panel: `/apps/dashboard/components/organizations/slug/finiquitos/shared/live-calculation-panel.tsx`
- Data fetching: `/apps/dashboard/data/finiquitos/get-finiquitos.ts` (includes customFiniquitoIdentifier in query)

**Schemas:**
- Step 1: `/apps/dashboard/lib/finiquitos/schemas/step1-base-config-schema.ts` (includes customFiniquitoIdentifier, printedHireDate validation)
- Step 2: `/apps/dashboard/lib/finiquitos/schemas/step2-factors-schema.ts`
- Step 3: `/apps/dashboard/lib/finiquitos/schemas/step3-deductions-schema.ts`
- PDF Config: `/apps/dashboard/lib/finiquitos/schemas/pdf-complemento-config-schema.ts` (complemento display configuration)
- Types: `/apps/dashboard/lib/finiquitos/types/calculate-finiquito-types.ts`

**PDF Files:**
- Template: `/apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx` (includes `renderComplementoConcepts()` helper)
- Config defaults: `/apps/dashboard/lib/finiquitos/pdf/pdf-complemento-config-defaults.ts` (concept mappings, default config)
- Config modal: `/apps/dashboard/components/organizations/slug/finiquitos/pdf-complemento-config-modal.tsx` (configuration dialog)
- API route: `/apps/dashboard/app/api/finiquitos/[id]/pdf/route.tsx` (query param parsing, validation)

## Troubleshooting

- **Prisma types not loaded**: Restart TS server or VS Code, or run `pnpm --filter database generate`
- **Can't login**: Ensure database is set up and migrations applied
- **Use pnpm only**: npm/yarn are not supported in this monorepo
- **Port conflicts**: Dashboard (3000), Marketing (3001), API (3002), Prisma Studio (3003)
- **Finiquito live calculation not updating**: Check browser console for errors; ensure Step 1 data is complete
- **Infinite re-renders in wizard**: Verify `useLiveCalculation` uses stable keys (JSON.stringify) not object references
- **Finiquito PDF showing zeros**: Ensure PDF template uses v2 field names (e.g., `montoVacacionesFiniquito` not `realVacationAmount`)
- **Missing RFC/CURP in finiquito**: Ensure `create-finiquito.ts` saves `employeeRFC` and `employeeCURP` to database (lines 75-76)
- **Step 2 edits not saving**: CRITICAL - Ensure `create-finiquito.ts` passes `step2Data` as `manualFactors` parameter to `calculateFiniquitoComplete()`. Without this, all Step 2 edits are lost and calculations restart from scratch.
- **PDF overflowing to 3rd page**: The template has dynamic margin/font adjustments (>4 lines reduces margins, >=10 lines reduces font to 10pt). If still overflowing, check that `conceptLines` calculation includes all displayed concepts.
- **Missing liquidación complemento in totals**: Ensure `total-section.tsx` includes `totalLiquidacionComplemento` in final sum calculation.
- **Vacation days not respecting manual edits**: Step 1 uses refs to track manual edits. Check that `vacationDaysManuallyEdited` ref is properly set when user changes value, and that date changes reset the flag.
- **Duplication fails with version error**: Only version 2 finiquitos can be duplicated. Check `finiquito.version === 2` in the database. V1 finiquitos must be manually recreated.
- **Custom identifier not showing in list**: Ensure `getFiniquitos()` includes `customFiniquitoIdentifier` in the select clause and that the list component renders it conditionally.
- **Duplicated identifier exceeds 20 chars**: The mapping function truncates to 15 chars before appending "-copy". If still exceeding limit, check truncation logic in `mapFiniquitoToStep1()`.
- **Wizard not opening with duplicated data**: Verify that `handleDuplicateClick()` in `FiniquitosContent` properly updates all wizard context (step1, step2, step3, liveCalculation) before setting `isCreating=true`.
- **Step 2 values overwritten when duplicating**: FIXED - The Step 1 submit handler now checks if `step2Data` exists and preserves values during duplication. If Step 2 values are still being lost, verify that `step2Data` is properly set in wizard context before advancing from Step 1, and that the conditional logic in `step1-base-config.tsx` (lines 253-297) properly passes `manualFactors` when `step2Data` is present.
- **Complemento amounts appearing doubled in totals**: FIXED (Nov 2025) - Complemento now correctly calculates NET differences (complemento - fiscal) instead of full amounts. If totals still seem incorrect, verify that `implementation.ts` lines 265-278 and 245-251 subtract fiscal amounts, and that `mapNetComplementoPercept()` helper is used in output mapping.
- **Negative complemento values in display**: This can occur when fiscal amounts exceed complemento amounts (unusual but possible with data entry errors or retroactive adjustments). Known edge case - validation not yet implemented. See task notes for details on future tax base integrity validation.
- **Complemento concepts showing zero when they shouldn't**: Verify that both fiscal and complemento toggles are enabled in Step 1. Check that `manualFactors` parameter includes complemento data when calling `calculateFiniquitoComplete()`. Confirm that real daily salary differs from fiscal daily salary.
- **PDF complemento configuration dialog not appearing**: Ensure `complementoActivado === true` in the finiquito data. Check that `handleDownloadPDF()` in list/detail view properly checks this flag before showing modal. Verify modal import: `PDFComplementoConfigModal` from correct path.
- **Configuration modal validation errors**: "Debe crear al menos un grupo" means grouped mode requires at least one group - click "Agregar Grupo" button. "Un concepto no puede pertenecer a múltiples grupos" means a concept is assigned to multiple groups - uncheck duplicates. "Debe seleccionar al menos un concepto" means a group has no concepts selected - select at least one checkbox per group.
- **PDF showing wrong complemento grouping**: If PDF doesn't match configuration, check that query parameter is properly encoded in fetch URL. Verify API route successfully parses and validates config (check server logs for parsing errors). Confirm `pdfConfig` prop is passed to `FiniquitoPDF` component. Test with direct API access to verify default config still works.
- **URL too long error when downloading PDF**: Occurs when configuration JSON exceeds ~2000 char query param limit (rare, requires many groups with long labels). Reduce number of groups, shorten group labels, or migrate to POST endpoint approach. Typical configurations (5-10 groups) fit comfortably within limit.
- **Complemento concepts missing from dialog**: In detail view, only concepts with amount > 0 are shown (active concepts filtering). In list view, all concept fields are passed (PDF API filters during rendering). If concept should appear but doesn't, verify database field has non-zero value and field name matches `ALL_COMPLEMENTO_CONCEPTS` array.
- **Configuration not persisting between downloads**: By design - configuration is per-download only, not saved to database. Each PDF download shows fresh dialog with default configuration. To implement persistence, add `pdfConfig` field to Finiquito model and pre-populate modal with saved config.
- **Security validation errors in PDF config**: Schema enforces security constraints to prevent attacks. "No puede crear más de 20 grupos" means you've exceeded the DoS protection limit - reduce number of groups. Control character errors ("no puede contener caracteres de control") indicate invalid input - remove special characters from labels or field names. These limits protect against prototype pollution, injection attacks, and resource exhaustion.
- **PDF showing wrong hire date**: The PDF uses 3-tier fallback logic for displaying hire dates. Priority order: (1) `printedHireDate` if set by user (2) `realHireDate` if complemento is active and realHireDate exists (3) `hireDate` (fiscal) as final fallback. If wrong date appears, verify `printedHireDate` field is saved in database (nullable DateTime @db.Date). For existing finiquitos without `printedHireDate`, ensure fallback logic in PDF template (lines 140-141, 361, 414) properly checks complemento activation state and handles null values with nested nullish coalescing.
- **Printed hire date not preserving during duplication**: Verify that `mapFiniquitoToStep1()` includes `printedHireDate: finiquito.printedHireDate || undefined` mapping (line 56 in `map-finiquito-to-wizard.ts`). Also check that `create-finiquito.ts` saves the field: `printedHireDate: parsedInput.printedHireDate ?? null` (line 120). The field accepts any date without validation - no past/future restrictions.
- **Printed hire date field not showing in Step 1**: The field is located in "Datos Básicos" section (not "Factores Fiscales" as initially planned). Check that schema includes `printedHireDate: z.coerce.date().optional()` and form uses conditional onChange to support clearing: `onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}`. Default value should be `undefined` not null.
- **Step 4 or Detail View not showing printed hire date fallback**: Both views should display the printed hire date field with clear indicators of which date will be used. Check for proper conditional rendering that shows italicized fallback text when `printedHireDate` is null. Implementation pattern: `{printedHireDate ? formatDate(printedHireDate) : <span className="italic">Usando fecha [real/fiscal]: {date}</span>}`
