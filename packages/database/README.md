# `@workspace/database`

This package contains the following:

- **DB Schema**: The structure defining the tables and relationships within your database.
- **ORM (Client)**: A set of functions to interact with the database using an Object-Relational Mapper (ORM).
- **Generated DB Types**: TypeScript types generated from the database schema, ensuring type safety when interacting with the database.

## Important Notes

### Finiquito Schema (Version 2)

The Finiquito model uses version 2 field naming convention for all new records. When working with finiquito data:

**Use v2 fields** (current):
- `montoVacacionesFiniquito`, `montoPrimaVacacionalFiniquito`, `montoAguinaldoFiniquito`, `montoDiasTrabajadosFiniquito`
- `totalAPagar`
- `employeeRFC`, `employeeCURP` (both required)

**Avoid v1 fields** (deprecated, nullable):
- `realVacationAmount`, `realVacationPremiumAmount`, `realAguinaldoAmount`, `realWorkedDaysAmount`
- `totalToPay`

See `/apps/dashboard/actions/finiquitos/helpers/map-calculation.ts` for complete field mapping.
