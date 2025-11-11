import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { BorderZone, SalaryFrequency, type Finiquito } from '@workspace/database';
import { FileText } from 'lucide-react';

import { formatCurrency, formatDate, calculateYearsOfService, calculateDaysWorked } from '~/lib/finiquitos/format-helpers';

type GeneralInfoSectionProps = {
  finiquito: Finiquito;
};

const SALARY_FREQUENCY_LABELS: Record<SalaryFrequency, string> = {
  [SalaryFrequency.DAILY]: 'Diario',
  [SalaryFrequency.WEEKLY]: 'Semanal',
  [SalaryFrequency.BIWEEKLY]: 'Quincenal',
  [SalaryFrequency.MONTHLY]: 'Mensual',
};

const BORDER_ZONE_LABELS: Record<BorderZone, string> = {
  [BorderZone.NO_FRONTERIZA]: 'No Fronteriza',
  [BorderZone.FRONTERIZA]: 'Fronteriza',
};

export function GeneralInfoSection({ finiquito }: GeneralInfoSectionProps) {
  const yearsOfService = calculateYearsOfService(finiquito.hireDate, finiquito.terminationDate);
  const daysWorked = calculateDaysWorked(finiquito.hireDate, finiquito.terminationDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Información General
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Empleado */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Empleado
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Nombre:</span>
                <p className="font-medium">{finiquito.employeeName}</p>
              </div>
              {finiquito.employeePosition && (
                <div>
                  <span className="text-sm text-muted-foreground">Puesto:</span>
                  <p className="font-medium">{finiquito.employeePosition}</p>
                </div>
              )}
              {/* RFC y CURP son requeridos en el schema y se guardan en create-finiquito.ts */}
              <div>
                <span className="text-sm text-muted-foreground">RFC:</span>
                <p className="font-mono text-sm">{finiquito.employeeRFC || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">CURP:</span>
                <p className="font-mono text-sm">{finiquito.employeeCURP || '-'}</p>
              </div>
            </div>
          </div>

          {/* Información de la Empresa */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Empresa
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Nombre:</span>
                <p className="font-medium">{finiquito.empresaName}</p>
              </div>
              {finiquito.empresaRFC && (
                <div>
                  <span className="text-sm text-muted-foreground">RFC:</span>
                  <p className="font-mono text-sm">{finiquito.empresaRFC}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Cliente:</span>
                <p className="font-medium">{finiquito.clientName}</p>
              </div>
            </div>
          </div>

          {/* Fechas y Antigüedad */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Fechas
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Fecha de Ingreso:</span>
                <p className="font-medium">{formatDate(finiquito.hireDate)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fecha de Baja:</span>
                <p className="font-medium">{formatDate(finiquito.terminationDate)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Antigüedad:</span>
                <p className="font-medium">
                  {daysWorked} días ({yearsOfService.toFixed(2)} años)
                </p>
              </div>
              {finiquito.complementoActivado && finiquito.realHireDate && (
                <div>
                  <span className="text-sm text-muted-foreground">Fecha Ingreso Real:</span>
                  <p className="font-medium">{formatDate(finiquito.realHireDate)}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Fecha Impresa en PDF:</span>
                <p className="font-medium">
                  {finiquito.printedHireDate ? (
                    formatDate(finiquito.printedHireDate)
                  ) : (
                    <span className="text-muted-foreground italic">
                      {finiquito.complementoActivado && finiquito.realHireDate
                        ? `Usando fecha real: ${formatDate(finiquito.realHireDate)}`
                        : `Usando fecha fiscal: ${formatDate(finiquito.hireDate)}`}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Datos Salariales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Datos Salariales
              </h3>
              <div className="flex gap-2">
                {finiquito.liquidacionActivada && <Badge>Liquidación</Badge>}
                {finiquito.complementoActivado && <Badge variant="outline">Complemento</Badge>}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Salario Diario Fiscal:</span>
                <p className="font-medium font-mono">{formatCurrency(finiquito.fiscalDailySalary)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Salario Diario Integrado:</span>
                <p className="font-medium font-mono">{formatCurrency(finiquito.integratedDailySalary)}</p>
              </div>
              {finiquito.complementoActivado && (
                <div>
                  <span className="text-sm text-muted-foreground">Salario Diario Real:</span>
                  <p className="font-medium font-mono">{formatCurrency(finiquito.realDailySalary)}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Zona:</span>
                <p className="font-medium">{BORDER_ZONE_LABELS[finiquito.borderZone]}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Frecuencia de Pago:</span>
                <p className="font-medium">{SALARY_FREQUENCY_LABELS[finiquito.salaryFrequency]}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
