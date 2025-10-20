
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
   - On submit, calls `calculateFiniquitoComplete()` to compute initial factors
   - Auto-populates Step 2 data via `updateStep2()` in wizard context
   - Sets `diasTrabajados` and `septimoDia` to 0 (user must fill manually)
   - Populates all other factors: vacaciones, primaVacacional, aguinaldo, liquidación, complemento
   - Stores initial calculation in context via `updateLiveCalculation()`

2. **Step 2 (Factors)**: User reviews and edits calculated factors
   - Form pre-populated with factors from Step 1
   - Live calculation updates as user edits (debounced 300ms)
   - Supports fiscal + complement scenarios, liquidación + complement combinations
   - Gratificación converts bidirectionally between días and pesos

3. **Step 3 (Deductions)**: User enters manual deductions (Infonavit, Fonacot, etc.)
   - Live calculation includes deductions in real-time

4. **Step 4 (Review)**: Final review before submission

**Live Calculation System** (`hooks/use-live-calculation.ts`):
- Uses `form.watch()` to detect changes in form data
- Debounces Step 2 and Step 3 data (300ms) to prevent excessive recalculation
- Implements stable dependency comparison using `JSON.stringify()` + `useMemo()`
- Avoids infinite loops by comparing serialized values instead of object references
- Recalculates entire finiquito on each change, updating context

**Calculation Orchestration** (`calculate-finiquito-complete.ts`):
- Entry point: accepts `CalculateFiniquitoInput`, returns `CalculateFiniquitoOutput`
- Flow:
  1. Calls `DefaultTerminationProportionalImpl` (calculadora-factores) for base factors
  2. Merges manual factors from Step 2 if provided (overrides calculated values)
  3. Calls `ImplementationV1` (calculadora-finiquitos) for monetary calculations
  4. Maps result to structured output with `factores`, `montos`, `isr`, `deducciones`, `totales`

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
- Total to pay: `totalAPagar`
- Employee identification: `employeeRFC`, `employeeCURP` (both required)

**V1 Field Names (DEPRECATED - DO NOT USE):**
- Legacy amounts: `realWorkedDaysAmount`, `realVacationAmount`, `realVacationPremiumAmount`, `realAguinaldoAmount`
- Legacy total: `totalToPay`
- These fields are NULL for all version 2 finiquitos

**Field Mapping Reference:**
See `/apps/dashboard/actions/finiquitos/helpers/map-calculation.ts` for the complete mapping from calculation results to Prisma fields.

#### File Reference

**Key Files:**
- Entry point: `/apps/dashboard/lib/finiquitos/calculate-finiquito-complete.ts`
- Field mapping: `/apps/dashboard/actions/finiquitos/helpers/map-calculation.ts`
- PDF template: `/apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx`
- Detail view: `/apps/dashboard/components/organizations/slug/finiquitos/detail/general-info-section.tsx`
- Live calc hook: `/apps/dashboard/components/organizations/slug/finiquitos/create/hooks/use-live-calculation.ts`
- Wizard context: `/apps/dashboard/components/organizations/slug/finiquitos/create/wizard-context.tsx`
- Step 1: `/apps/dashboard/components/organizations/slug/finiquitos/create/steps/step1-base-config.tsx`
- Step 2: `/apps/dashboard/components/organizations/slug/finiquitos/create/steps/step2-factors.tsx`
- Live panel: `/apps/dashboard/components/organizations/slug/finiquitos/shared/live-calculation-panel.tsx`

**Schemas:**
- Step 1: `/apps/dashboard/lib/finiquitos/schemas/step1-base-config-schema.ts`
- Step 2: `/apps/dashboard/lib/finiquitos/schemas/step2-factors-schema.ts`
- Step 3: `/apps/dashboard/lib/finiquitos/schemas/step3-deductions-schema.ts`
- Types: `/apps/dashboard/lib/finiquitos/types/calculate-finiquito-types.ts`

## Troubleshooting

- **Prisma types not loaded**: Restart TS server or VS Code, or run `pnpm --filter database generate`
- **Can't login**: Ensure database is set up and migrations applied
- **Use pnpm only**: npm/yarn are not supported in this monorepo
- **Port conflicts**: Dashboard (3000), Marketing (3001), API (3002), Prisma Studio (3003)
- **Finiquito live calculation not updating**: Check browser console for errors; ensure Step 1 data is complete
- **Infinite re-renders in wizard**: Verify `useLiveCalculation` uses stable keys (JSON.stringify) not object references
- **Finiquito PDF showing zeros**: Ensure PDF template uses v2 field names (e.g., `montoVacacionesFiniquito` not `realVacationAmount`)
- **Missing RFC/CURP in finiquito**: Ensure `create-finiquito.ts` saves `employeeRFC` and `employeeCURP` to database (lines 67-68)
