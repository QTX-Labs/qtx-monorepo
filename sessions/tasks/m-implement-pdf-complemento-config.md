---
name: m-implement-pdf-complemento-config
branch: feature/pdf-complemento-config
status: pending
created: 2025-11-11
---

# Implement PDF Complemento Configuration Dialog

## Problem/Goal
When downloading a finiquito PDF with complemento activated, users currently have no control over how complemento concepts are displayed. All finiquito-complemento concepts are grouped under "BONOS" and all liquidación-complemento concepts under "GRATIFICACIÓN". Users need the ability to customize this grouping - either showing concepts individually with their actual names, or creating custom groupings with user-defined labels.

## Success Criteria
- [ ] When clicking "Descargar PDF" on a finiquito with complemento, a configuration dialog appears
- [ ] Dialog shows all complemento concepts that have value > 0
- [ ] User can choose to display concepts individually (desglosados) or grouped (agrupados)
- [ ] User can create custom groupings with custom labels and select which concepts to include
- [ ] Default template matches current behavior: "BONOS" for finiquito-complemento, "GRATIFICACIÓN" for liquidación-complemento
- [ ] PDF is generated with the selected configuration
- [ ] Same functionality works from both detail view and list view

## Context Manifest

### How PDF Generation Currently Works

**Entry Points - Where PDFs Are Downloaded:**

Users can download finiquito PDFs from two locations in the application:

1. **List View** (`/apps/dashboard/components/organizations/slug/finiquitos/finiquitos-list.tsx` lines 99-125):
   - Actions dropdown menu with "Descargar PDF" option
   - Handler: `handleDownloadPDF(finiquitoId)`
   - Makes fetch request to `/api/finiquitos/${id}/pdf`
   - Downloads resulting blob as file with auto-generated name

2. **Detail View** (`/apps/dashboard/components/organizations/slug/finiquitos/finiquito-detail-content.tsx` lines 64-90):
   - "Descargar PDF" button in header actions
   - Handler: `handleDownloadPDF()` (similar implementation)
   - Same API endpoint: `/api/finiquitos/${finiquito.id}/pdf`
   - Downloads blob with formatted filename

**API Route Architecture** (`/apps/dashboard/app/api/finiquitos/[id]/pdf/route.tsx`):

The PDF generation happens server-side through a Next.js API route handler:

```typescript
export async function GET(request, { params })
```

Flow:
1. Authenticates user via `getAuthContext()`
2. Fetches complete finiquito from Prisma including user and attachments
3. Validates user has membership in finiquito's organization (authorization check)
4. Calls `renderToBuffer(<FiniquitoPDF finiquito={finiquito} />)` from @react-pdf/renderer
5. Returns PDF buffer with Content-Type headers for download

The route is straightforward - it receives an ID, validates access, generates PDF, returns buffer. To add configuration dialog, we need to intercept BEFORE this API call.

**PDF Template Component** (`/apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx`):

The template is a React component that uses @react-pdf/renderer primitives (Document, Page, View, Text) with StyleSheet for layout. Key architectural patterns:

- **Dynamic margin adjustment** (lines 287-315): Reduces margins and font size based on number of concept lines to prevent overflow to 3rd page
- **Concept filtering** (line 228): Only renders concepts where `amount > 0`
- **Two-page layout**: Page 1 = resignation letter, Page 2 = detailed receipt with concept breakdown
- **Numeric formatting**: Uses numeral.js for currency formatting, custom `numeroALetra()` for text representation

**Current Hardcoded Complemento Grouping Logic** (lines 199-224):

The template has TWO hardcoded grouped concepts for complemento scenarios:

```typescript
// BONOS - Groups ALL finiquito-complemento concepts
{
  label: "BONOS",
  amount: _.sum([
    montoDiasTrabajadosComplemento,
    montoSeptimoDiaComplemento,
    montoPrimaVacacionalComplemento,
    montoVacacionesComplemento,
    realPendingVacationAmount,        // Pending vacation
    realPendingPremiumAmount,         // Pending premium
    montoAguinaldoComplemento
  ])
}

// GRATIFICACIÓN - Groups ALL liquidación-complemento concepts
{
  label: "GRATIFICACIÓN",
  amount: _.sum([
    montoIndemnizacion90DiasComplemento,
    montoIndemnizacion20DiasComplemento,
    montoPrimaAntiguedadComplemento
  ])
}
```

These groupings are static and always applied when `complementoActivado = true` (or both flags for liquidación complemento). The task is to make these groupings configurable via a pre-download dialog.

### Finiquito Data Structure - Complemento Concepts

**Database Model** (`/packages/database/prisma/schema.prisma`):

The Finiquito model uses **version 2 field naming** (all new finiquitos created with `version = 2`). Complemento-related fields:

**Finiquito-Complemento Amounts** (net differences, NOT full amounts):
- `montoDiasTrabajadosComplemento` (Decimal) - Net días trabajados difference
- `montoSeptimoDiaComplemento` (Decimal) - Net séptimo día difference
- `montoVacacionesComplemento` (Decimal) - Net vacaciones difference
- `realPendingVacationAmount` (Decimal) - Net pending vacation difference
- `montoPrimaVacacionalComplemento` (Decimal) - Net prima vacacional difference
- `realPendingPremiumAmount` (Decimal) - Net pending premium difference
- `montoAguinaldoComplemento` (Decimal) - Net aguinaldo difference

**Liquidación-Complemento Amounts** (net differences):
- `montoIndemnizacion90DiasComplemento` (Decimal) - Net 90-day indemnification difference
- `montoIndemnizacion20DiasComplemento` (Decimal) - Net 20-day indemnification difference
- `montoPrimaAntiguedadComplemento` (Decimal) - Net seniority premium difference

**Boolean Flags:**
- `complementoActivado` (Boolean) - Determines if complemento section exists
- `liquidacionActivada` (Boolean) - Determines if liquidación section exists

**Critical Implementation Detail - Net Complemento:**

Complemento represents the NET DIFFERENCE between real salary and fiscal salary, NOT an addition. When stored in database, these fields contain `complementoAmount - fiscalAmount`. This was fixed in November 2025 to prevent double-counting totals. See `/apps/dashboard/lib/finiquitos/calculadora-finiquitos/implementation.ts` lines 265-278 for net subtraction logic.

**Identifying Active Complemento Concepts:**

To determine which concepts to show in configuration dialog:
1. Check `finiquito.complementoActivado === true`
2. Filter finiquito-complemento fields where `toNumber(field) > 0`
3. Check `finiquito.liquidacionActivada && finiquito.complementoActivado` for liquidación complemento
4. Filter liquidación-complemento fields where `toNumber(field) > 0`

**Concept Labels Mapping:**

```typescript
const COMPLEMENTO_CONCEPTS = [
  { field: 'montoDiasTrabajadosComplemento', label: 'Días Trabajados (Complemento)' },
  { field: 'montoSeptimoDiaComplemento', label: 'Séptimo Día (Complemento)' },
  { field: 'montoVacacionesComplemento', label: 'Vacaciones (Complemento)' },
  { field: 'realPendingVacationAmount', label: 'Vacaciones Pendientes (Complemento)' },
  { field: 'montoPrimaVacacionalComplemento', label: 'Prima Vacacional (Complemento)' },
  { field: 'realPendingPremiumAmount', label: 'Prima Vacacional Pendiente (Complemento)' },
  { field: 'montoAguinaldoComplemento', label: 'Aguinaldo (Complemento)' },
];

const LIQUIDACION_COMPLEMENTO_CONCEPTS = [
  { field: 'montoIndemnizacion90DiasComplemento', label: 'Indemnización 90 Días (Complemento)' },
  { field: 'montoIndemnizacion20DiasComplemento', label: 'Indemnización 20 Días (Complemento)' },
  { field: 'montoPrimaAntiguedadComplemento', label: 'Prima de Antigüedad (Complemento)' },
];
```

### UI Patterns - Dialog/Modal Management

**Modal System - NiceModal Integration:**

The codebase uses `@ebay/nice-modal-react` for imperative modal management. Pattern observed in `/apps/dashboard/components/organizations/slug/contacts/details/modals/add-contact-person-modal.tsx`:

```typescript
import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';

export const MyModal = NiceModal.create<MyModalProps>(({ propA, propB }) => {
  const modal = useEnhancedModal(); // Custom hook wrapping NiceModal.useModal()

  return (
    <Dialog open={modal.visible}>
      <DialogContent
        onClose={modal.handleClose}
        onAnimationEndCapture={modal.handleAnimationEndCapture}
      >
        {/* Content */}
      </DialogContent>
    </Dialog>
  );
});

// Usage:
NiceModal.show(MyModal, { propA: value });
```

**Enhanced Modal Hook** (`/apps/dashboard/hooks/use-enhanced-modal.tsx`):

Provides three lifecycle handlers:
- `handleClose()` - Hides modal
- `handleAnimationEndCapture()` - Resolves hide promise, removes if not keepMounted
- `handleOpenChange(value)` - Used by Drawer component for swipe-to-close

**Responsive Dialog/Drawer Pattern:**

Desktop uses Dialog, mobile uses Drawer (swipeable bottom sheet). Pattern:

```typescript
const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });

return (
  <FormProvider {...methods}>
    {mdUp ? (
      <Dialog open={modal.visible}>
        <DialogContent onClose={modal.handleClose}>
          {/* Content */}
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={modal.visible} onOpenChange={modal.handleOpenChange}>
        <DrawerContent>
          {/* Same content */}
        </DrawerContent>
      </Drawer>
    )}
  </FormProvider>
);
```

**Dialog Components** (`/packages/ui/src/components/dialog.tsx`):

Radix UI-based primitives:
- `Dialog` - Root container
- `DialogContent` - Main content area with overlay, close button, escape/click-outside handlers
- `DialogHeader` - Title/description area
- `DialogFooter` - Action buttons (Cancel/Confirm pattern)
- `DialogTitle` / `DialogDescription` - Accessible labels

**Form Components Available:**
- `Checkbox` (Radix UI) - Single checkbox with checkmark indicator
- `RadioGroup` + `RadioGroupItem` (Radix UI) - Radio button groups
- `Input` - Text inputs
- `Select` - Dropdown selects
- `Switch` - Toggle switches
- `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage` - React Hook Form integration

**Form Management Pattern:**

```typescript
const methods = useZodForm({
  schema: mySchema,
  mode: 'onSubmit',
  defaultValues: { /* ... */ }
});

const onSubmit: SubmitHandler<MySchema> = async (values) => {
  // Handle submission
};

return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <FormField
        control={methods.control}
        name="fieldName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  </FormProvider>
);
```

**useZodForm Hook** (`/apps/dashboard/hooks/use-zod-form.tsx`):

Thin wrapper around react-hook-form's `useForm` with zodResolver integration. Sets `raw: true` to allow transforms in schemas without double-application on server.

### Configuration Dialog Requirements

**User Flow:**

1. User clicks "Descargar PDF" button (list or detail view)
2. BEFORE fetch to `/api/finiquitos/${id}/pdf`, check if `complementoActivado === true`
3. If complemento inactive → proceed directly to PDF generation (current behavior)
4. If complemento active → show configuration dialog modal
5. Dialog presents all complemento concepts with amount > 0
6. User chooses display mode:
   - **Desglosados (Itemized)**: Each concept shows individually with its actual label
   - **Agrupados (Grouped)**: User creates custom groups with custom labels
7. For grouped mode:
   - User can create multiple groups (e.g., "BONOS", "AYUDA DE SUELDO", "GRATIFICACIÓN")
   - Each group has editable label text
   - User selects which concepts belong to each group via checkboxes
   - Groups display summed amounts in PDF
8. Default template matches current behavior:
   - Finiquito-complemento concepts → "BONOS" group
   - Liquidación-complemento concepts → "GRATIFICACIÓN" group
9. User confirms configuration
10. Configuration passed to PDF generation (options: URL params, POST body, or state)
11. PDF template uses configuration to render concepts accordingly

**Technical Approach - Interception Strategy:**

Since API route is GET (stateless), we have three options for passing configuration:

**Option A: URL Query Parameters** (Simplest)
```typescript
const config = encodeURIComponent(JSON.stringify(groupingConfig));
fetch(`/api/finiquitos/${id}/pdf?config=${config}`);
```
Pros: Works with existing GET route
Cons: URL length limits (~2000 chars), visible in browser history

**Option B: Convert to POST Route**
```typescript
fetch(`/api/finiquitos/${id}/pdf`, {
  method: 'POST',
  body: JSON.stringify({ config: groupingConfig }),
});
```
Pros: No length limits, cleaner
Cons: Requires route refactor, changes download handling

**Option C: Session/Cookie Storage**
Store config in session, retrieve in API route
Pros: Clean URLs
Cons: Adds complexity, requires session management

**Recommendation**: Option A (query params) for MVP, migrate to Option B if needed.

**Configuration Data Structure:**

```typescript
type ComplementoDisplayMode = 'itemized' | 'grouped';

type ConceptGroup = {
  label: string;                    // Custom group label (e.g., "BONOS")
  conceptFields: string[];          // Field names to include
};

type ComplementoPDFConfig = {
  displayMode: ComplementoDisplayMode;
  groups?: ConceptGroup[];          // Only if displayMode === 'grouped'
};

// Example grouped config:
{
  displayMode: 'grouped',
  groups: [
    {
      label: 'AYUDA DE SUELDO',
      conceptFields: ['montoDiasTrabajadosComplemento', 'montoSeptimoDiaComplemento']
    },
    {
      label: 'BONOS',
      conceptFields: ['montoVacacionesComplemento', 'montoPrimaVacacionalComplemento', 'montoAguinaldoComplemento']
    },
    {
      label: 'GRATIFICACIÓN',
      conceptFields: ['montoIndemnizacion90DiasComplemento', 'montoIndemnizacion20DiasComplemento', 'montoPrimaAntiguedadComplemento']
    }
  ]
}

// Example itemized config:
{
  displayMode: 'itemized'
}
```

### Type Safety & Validation

**Zod Schema for Configuration:**

Create new schema at `/apps/dashboard/lib/finiquitos/schemas/pdf-complemento-config-schema.ts`:

```typescript
import { z } from 'zod';

const conceptGroupSchema = z.object({
  label: z.string().min(1, 'El nombre del grupo es requerido').max(50),
  conceptFields: z.array(z.string()).min(1, 'Debe seleccionar al menos un concepto'),
});

export const pdfComplementoConfigSchema = z.object({
  displayMode: z.enum(['itemized', 'grouped']),
  groups: z.array(conceptGroupSchema).optional(),
}).refine(
  (data) => {
    if (data.displayMode === 'grouped') {
      return data.groups && data.groups.length > 0;
    }
    return true;
  },
  {
    message: 'Debe crear al menos un grupo en modo agrupado',
    path: ['groups'],
  }
);

export type PDFComplementoConfig = z.infer<typeof pdfComplementoConfigSchema>;
export type ConceptGroup = z.infer<typeof conceptGroupSchema>;
```

**API Route Validation:**

In `/apps/dashboard/app/api/finiquitos/[id]/pdf/route.tsx`, add query param parsing:

```typescript
const searchParams = request.nextUrl.searchParams;
const configParam = searchParams.get('config');
let pdfConfig: PDFComplementoConfig | null = null;

if (configParam) {
  try {
    const parsed = JSON.parse(decodeURIComponent(configParam));
    pdfConfig = pdfComplementoConfigSchema.parse(parsed);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid PDF configuration' }, { status: 400 });
  }
}
```

### PDF Template Modification Strategy

**Current Hardcoded Section** (lines 199-224):

Replace with dynamic rendering based on configuration:

```typescript
// NEW: Dynamic complemento rendering
const renderComplementoConcepts = (finiquito: Finiquito, config?: PDFComplementoConfig) => {
  if (!finiquito.complementoActivado) return [];

  if (!config || config.displayMode === 'itemized') {
    // Itemized mode - show each concept individually
    return COMPLEMENTO_CONCEPTS
      .filter(c => toNumber(finiquito[c.field]) > 0)
      .map(c => ({
        label: c.label,
        amount: toNumber(finiquito[c.field]),
      }));
  }

  // Grouped mode - sum concepts by group
  return config.groups.map(group => ({
    label: group.label,
    amount: _.sum(
      group.conceptFields.map(field => toNumber(finiquito[field]))
    ),
  }));
};

// In allConcepts array:
...renderComplementoConcepts(finiquito, pdfConfig),
```

**Backward Compatibility:**

When no config provided (direct API access, old links), use current hardcoded grouping as default:

```typescript
const DEFAULT_COMPLEMENTO_CONFIG: PDFComplementoConfig = {
  displayMode: 'grouped',
  groups: [
    {
      label: 'BONOS',
      conceptFields: [
        'montoDiasTrabajadosComplemento',
        'montoSeptimoDiaComplemento',
        'montoPrimaVacacionalComplemento',
        'montoVacacionesComplemento',
        'realPendingVacationAmount',
        'realPendingPremiumAmount',
        'montoAguinaldoComplemento',
      ],
    },
    {
      label: 'GRATIFICACIÓN',
      conceptFields: [
        'montoIndemnizacion90DiasComplemento',
        'montoIndemnizacion20DiasComplemento',
        'montoPrimaAntiguedadComplemento',
      ],
    },
  ],
};

const finalConfig = pdfConfig || DEFAULT_COMPLEMENTO_CONFIG;
```

### Implementation File Locations

**New Files to Create:**

1. `/apps/dashboard/lib/finiquitos/schemas/pdf-complemento-config-schema.ts` - Zod schema and types
2. `/apps/dashboard/components/organizations/slug/finiquitos/pdf-complemento-config-modal.tsx` - Dialog component
3. `/apps/dashboard/lib/finiquitos/pdf/pdf-complemento-config-defaults.ts` - Default config constant

**Files to Modify:**

1. `/apps/dashboard/components/organizations/slug/finiquitos/finiquitos-list.tsx` - Intercept download handler
2. `/apps/dashboard/components/organizations/slug/finiquitos/finiquito-detail-content.tsx` - Intercept download handler
3. `/apps/dashboard/app/api/finiquitos/[id]/pdf/route.tsx` - Parse config from query params
4. `/apps/dashboard/lib/finiquitos/pdf/finiquito-pdf-template.tsx` - Dynamic rendering logic

**Pattern for Download Handler Modification:**

```typescript
const handleDownloadPDF = async (id: string) => {
  // NEW: Check if complemento active
  const finiquito = finiquitos.find(f => f.id === id);

  if (finiquito?.complementoActivado) {
    // Show configuration modal
    const config = await NiceModal.show(PDFComplementoConfigModal, {
      finiquitoId: id,
      // Pass active concepts for checkbox rendering
      activeConcepts: getActiveConcepts(finiquito),
    });

    if (!config) return; // User cancelled

    // Proceed with config
    const configParam = encodeURIComponent(JSON.stringify(config));
    const response = await fetch(`/api/finiquitos/${id}/pdf?config=${configParam}`);
    // ... rest of download logic
  } else {
    // Original flow - no config needed
    const response = await fetch(`/api/finiquitos/${id}/pdf`);
    // ... rest of download logic
  }
};
```

### Edge Cases & Considerations

**Empty Groups:**
If user creates group but selects no concepts, validation should catch this (schema refine). If somehow bypassed, group will have `amount: 0` and be filtered out by existing `concepts.filter(c => c.amount > 0)` logic.

**All Concepts in One Group:**
Valid configuration. Will render single grouped line in PDF.

**Mixed Itemized/Grouped:**
Not supported in schema. Either all itemized or all grouped. Could be future enhancement.

**Very Long Group Labels:**
Schema limits to 50 characters. PDF template should truncate if needed to prevent overflow.

**Configuration Persistence:**
This implementation is per-download. If user wants to save preferred config for reuse, that's a future enhancement (would require database storage).

**Performance:**
JSON encoding/decoding is negligible. Query param approach has ~2000 char limit, sufficient for ~5-10 groups with typical field names.

**Accessibility:**
Dialog/Drawer components from workspace/ui are already ARIA-compliant (DialogTitle, DialogDescription for screen readers).

### Related Finiquito Context

**Calculation System:**

Finiquitos are calculated through a multi-stage pipeline orchestrated by `calculateFiniquitoComplete()`:
1. Factor calculation (days) via `DefaultTerminationProportionalImpl`
2. Monetary conversion via `ImplementationV1`
3. ISR calculation via `ISRCalculatorImpl`
4. Manual deduction application
5. Total aggregation

For this task, we only need the STORED finiquito data (already calculated), not the calculation system itself.

**Version 2 Fields:**

All new finiquitos use v2 naming:
- Finiquito amounts: `montoXXXFiniquito`
- Liquidación amounts: `montoXXX` (no suffix)
- Complemento amounts: `montoXXXComplemento`
- Total: `totalAPagar` (NOT `totalToPay`)

Legacy v1 finiquitos (rare) have different field names but can't have complemento (feature added in v2), so configuration dialog won't show for them anyway.

**Wizard System:**

The finiquito creation wizard (4 steps) is not involved in this task. We're working with completed, stored finiquitos being downloaded from list/detail views.

## User Notes
Example configuration:
- `montoDiasTrabajadosComplemento` + `montoSeptimoDiaComplemento` → "AYUDA DE SUELDO"
- Rest of finiquito-complemento concepts → "BONOS"
- Liquidación-complemento concepts → "GRATIFICACIÓN" (unchanged)

Complemento concepts to support:
- Finiquito: diasTrabajados, septimoDia, primaVacacional, vacaciones, vacacionesPendientes, primaVacacionalPendiente, aguinaldo
- Liquidación: indemnizacion90Dias, indemnizacion20Dias, primaAntiguedad

## Work Log
- [2025-11-11] Created task file
