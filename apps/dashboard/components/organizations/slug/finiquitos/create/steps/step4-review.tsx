'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Badge } from '@workspace/ui/components/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { toast } from '@workspace/ui/components/sonner';
import { Edit } from 'lucide-react';

import { useWizard } from '../wizard-context';
import { FiniquitoBreakdown } from '../../shared/finiquito-breakdown';
import { createFiniquito } from '~/actions/finiquitos/create-finiquito';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
  }).format(date);
}

export function Step4Review() {
  const router = useRouter();
  const params = useParams();
  const { step1Data, step2Data, step3Data, liveCalculation, goToStep } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!step1Data || !step2Data || !step3Data || !liveCalculation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hay datos para revisar. Por favor complete los pasos anteriores.
        </p>
        <Button onClick={() => goToStep(1)} className="mt-4">
          Volver al Paso 1
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Combinar todos los datos de los 3 pasos
      const finiquitoData = {
        ...step1Data,
        ...step2Data,
        ...step3Data,
      };

      const result = await createFiniquito(finiquitoData);

      if (result?.data?.finiquitoId) {
        toast.success('Finiquito creado exitosamente');
        router.push(`/organizations/${params.slug}/finiquitos/${result.data.finiquitoId}`);
      } else {
        toast.error('Error al crear el finiquito');
      }
    } catch (error) {
      console.error('Error creating finiquito:', error);
      toast.error('Error al crear el finiquito');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Revisión Final</h3>
        <p className="text-sm text-muted-foreground">
          Revise toda la información antes de guardar el finiquito
        </p>
      </div>

      <Accordion type="multiple" defaultValue={['datos', 'breakdown']} className="space-y-4">
        {/* Datos del Empleado */}
        <AccordionItem value="datos" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold">Datos del Empleado y Empresa</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  goToStep(1);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información del Empleado</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nombre:</span>
                    <p className="font-medium">{step1Data.employeeName}</p>
                  </div>
                  {step1Data.employeePosition && (
                    <div>
                      <span className="text-muted-foreground">Puesto:</span>
                      <p className="font-medium">{step1Data.employeePosition}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">RFC:</span>
                    <p className="font-medium">{step1Data.employeeRFC}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CURP:</span>
                    <p className="font-medium">{step1Data.employeeCURP}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha de Ingreso (Fiscal):</span>
                    <p className="font-medium">{formatDate(step1Data.hireDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha de Baja:</span>
                    <p className="font-medium">{formatDate(step1Data.terminationDate)}</p>
                  </div>
                  {step1Data.complementoActivado && step1Data.realHireDate && (
                    <div>
                      <span className="text-muted-foreground">Fecha de Ingreso Real:</span>
                      <p className="font-medium">{formatDate(step1Data.realHireDate)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Fecha Impresa en PDF:</span>
                    <p className="font-medium">
                      {step1Data.printedHireDate ? (
                        formatDate(step1Data.printedHireDate)
                      ) : (
                        <span className="text-muted-foreground italic">
                          {step1Data.complementoActivado && step1Data.realHireDate
                            ? `Usando fecha real: ${formatDate(step1Data.realHireDate)}`
                            : `Usando fecha fiscal: ${formatDate(step1Data.hireDate)}`}
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información de la Empresa</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Empresa:</span>
                    <p className="font-medium">{step1Data.empresaName}</p>
                  </div>
                  {step1Data.empresaRFC && (
                    <div>
                      <span className="text-muted-foreground">RFC:</span>
                      <p className="font-medium">{step1Data.empresaRFC}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-medium">{step1Data.clientName}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Configuración
                    <div className="flex gap-2">
                      {step1Data.liquidacionActivada && <Badge>Liquidación</Badge>}
                      {step1Data.complementoActivado && <Badge variant="outline">Complemento</Badge>}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Salario Diario Fiscal:</span>
                    <p className="font-medium">${step1Data.fiscalDailySalary.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salario Diario Integrado:</span>
                    <p className="font-medium">${step1Data.integratedDailySalary.toFixed(2)}</p>
                  </div>
                  {step1Data.complementoActivado && step1Data.realDailySalary && (
                    <div>
                      <span className="text-muted-foreground">Salario Diario Real:</span>
                      <p className="font-medium">${step1Data.realDailySalary.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Días de Aguinaldo:</span>
                    <p className="font-medium">{step1Data.aguinaldoDays} días</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Días de Vacaciones:</span>
                    <p className="font-medium">{step1Data.vacationDays} días</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prima Vacacional:</span>
                    <p className="font-medium">{step1Data.vacationPremiumPercentage}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Desglose de Factores y Montos */}
        <AccordionItem value="breakdown" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold">Desglose de Factores y Montos</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToStep(2);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Factores
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToStep(3);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Deducciones
                </Button>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <FiniquitoBreakdown calculation={liveCalculation} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => goToStep(3)}
          disabled={isSubmitting}
        >
          Volver a Deducciones
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Finiquito'}
        </Button>
      </div>
    </div>
  );
}
