---
index: finiquitos
name: Finiquitos (Severance Calculations)
description: Tasks related to the finiquito calculation system, including calculations, UI/UX, data structures, and compliance with Mexican labor law
---

# Finiquitos (Severance Calculations)

## Active Tasks

### High Priority
<!-- No high priority tasks -->

### Medium Priority
- `m-refactor-finiquito-table-step1-pdf` - Fix visual problems in finiquitos table, enable manual editing of Salario Diario Fiscal with border zone validation, and add dynamic concepts to PDF

### Low Priority
<!-- No low priority tasks yet -->

### Investigate
<!-- No investigations yet -->

## Completed Tasks

### 2025-11-11
- `m-implement-fecha-ingreso-impresa` - Added optional "Fecha de Ingreso Impresa" field for custom PDF display date independent of fiscal/real hire dates. Features: No validation constraints, 3-tier fallback logic (printed → real → fiscal), transparent display with fallback indicators in Step 4 Review and Detail View, preserved during duplication.
- `m-implement-pdf-complemento-config` - Add configuration dialog for customizing complemento concept grouping and labeling in PDF downloads
- `h-fix-complemento-neto-calculation` - Fix complemento calculation to subtract fiscal amounts from complemento amounts (net = complemento - fiscal) instead of adding full complemento on top of fiscal

### 2025-10-23
- `m-implement-duplicar-finiquito` - Add duplication functionality to clone existing finiquitos with optional custom identifier field
- `h-fix-duplicate-step2-overwrite` - Fix bug where Step 2 values are overwritten when advancing from Step 1 in duplicated finiquito

### 2025-10-20
- `h-refactor-finiquito-creation-process/` - Refactorización completa del proceso de creación de finiquito: estructura de datos, interfaz/UX, y cálculos correctos
- `h-fix-finiquito-pdf-field-mapping` - Fixed PDF template to use v2 field names (montoVacacionesFiniquito, etc.) and ensured RFC/CURP are saved to database and displayed in detail view
