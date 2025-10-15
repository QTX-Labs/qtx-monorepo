'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { type Finiquito, type User, type FiniquitoAttachment } from '@workspace/database';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import numeral from 'numeral';

import { Button } from '@workspace/ui/components/button';
import { toLocalDate } from '~/lib/finiquitos/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@workspace/ui/components/alert-dialog';

import { deleteFiniquito } from '~/actions/finiquitos/delete-finiquito';

type FiniquitoDetail = Finiquito & {
  user: Pick<User, 'name' | 'email'>;
  attachments: FiniquitoAttachment[];
};

interface FiniquitoDetailContentProps {
  finiquito: FiniquitoDetail;
}

export function FiniquitoDetailContent({ finiquito }: FiniquitoDetailContentProps) {
  const router = useRouter();
  const params = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { execute: executeDelete, status: deleteStatus } = useAction(deleteFiniquito, {
    onSuccess: () => {
      toast.success('Finiquito eliminado exitosamente');
      router.push(`/organizations/${params.slug}/finiquitos`);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Error al eliminar el finiquito');
    }
  });

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/finiquitos/${finiquito.id}/pdf`);

      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finiquito-${finiquito.employeeName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error al generar PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteConfirm = () => {
    executeDelete({ id: finiquito.id });
  };

  const formatCurrency = (amount: number | string | { toString: () => string }) => {
    return `$${numeral(Number(amount.toString())).format('0,0.00')}`;
  };

  const translateSalaryFrequency = (frequency: string) => {
    const translations: Record<string, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual'
    };
    return translations[frequency.toLowerCase()] || frequency;
  };

  const translateBorderZone = (zone: string) => {
    return zone === 'fronteriza' ? 'Sí' : 'No';
  };

  const isLoading = isDownloading || deleteStatus === 'executing';

  return (
    <>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/organizations/${params.slug}/finiquitos`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isLoading}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Descargar PDF
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Información del Empleado */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Empleado y Empresa</CardTitle>
            <CardDescription>Datos del trabajador y compañía</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre del Empleado</p>
              <p className="text-base font-semibold">{finiquito.employeeName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Puesto</p>
              <p className="text-base">{finiquito.employeePosition || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Empresa</p>
              <p className="text-base">{finiquito.empresaName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">RFC Empresa</p>
              <p className="text-base">{finiquito.empresaRFC || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <p className="text-base">{finiquito.clientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
              <p className="text-base">
                {[finiquito.empresaMunicipio, finiquito.empresaEstado].filter(Boolean).join(', ') || 'No especificado'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información Laboral */}
        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
            <CardDescription>Datos del empleo y terminación</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Contratación</p>
              <p className="text-base">
                {format(toLocalDate(finiquito.hireDate), 'PPP', { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Baja</p>
              <p className="text-base">
                {format(toLocalDate(finiquito.terminationDate), 'PPP', { locale: es })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información Salarial */}
        <Card>
          <CardHeader>
            <CardTitle>Información Salarial</CardTitle>
            <CardDescription>Compensación y prestaciones</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Salario</p>
              <p className="text-base font-semibold">{formatCurrency(finiquito.salary)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Frecuencia de Pago</p>
              <p className="text-base">{translateSalaryFrequency(finiquito.salaryFrequency)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Zona Fronteriza</p>
              <p className="text-base">{translateBorderZone(finiquito.borderZone)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Cálculos del Finiquito */}
        <Card>
          <CardHeader>
            <CardTitle>Cálculos del Finiquito</CardTitle>
            <CardDescription>Desglose de conceptos y cantidades (valores reales)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Días Laborados</span>
                <span className="text-base">{finiquito.daysWorked} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Años Laborados</span>
                <span className="text-base">{Number(finiquito.yearsWorked).toFixed(2)} años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Días Trabajados Pendientes</span>
                <span className="text-base">{formatCurrency(finiquito.realWorkedDaysAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Aguinaldo ({finiquito.aguinaldoDays} días)</span>
                <span className="text-base">{formatCurrency(finiquito.realAguinaldoAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Vacaciones ({finiquito.vacationDays} días)</span>
                <span className="text-base">{formatCurrency(finiquito.realVacationAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Prima Vacacional ({(Number(finiquito.vacationPremiumPercentage) * 100).toFixed(0)}%)</span>
                <span className="text-base">{formatCurrency(finiquito.realVacationPremiumAmount)}</span>
              </div>
              {Number(finiquito.pendingVacationDays) > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Vacaciones Pendientes</span>
                    <span className="text-base">{formatCurrency(finiquito.realPendingVacationAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Prima Pendiente</span>
                    <span className="text-base">{formatCurrency(finiquito.realPendingPremiumAmount)}</span>
                  </div>
                </>
              )}
              {Number(finiquito.realGratificationAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Gratificación</span>
                  <span className="text-base">{formatCurrency(finiquito.realGratificationAmount)}</span>
                </div>
              )}
              {Number(finiquito.severanceTotalReal) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Indemnización</span>
                  <span className="text-base">{formatCurrency(finiquito.severanceTotalReal)}</span>
                </div>
              )}
              {Number(finiquito.seniorityPremiumReal) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Prima de Antigüedad</span>
                  <span className="text-base">{formatCurrency(finiquito.seniorityPremiumReal)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Percepciones</span>
                <span className="text-base font-semibold">{formatCurrency(finiquito.realTotalPerceptions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Deducciones</span>
                <span className="text-base font-semibold text-destructive">-{formatCurrency(finiquito.realTotalDeductions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Neto Real</span>
                <span className="text-base font-semibold">{formatCurrency(finiquito.realNetAmount)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold">Total a Pagar</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(finiquito.totalToPay)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Creado Por</p>
              <p className="text-base">{finiquito.user.name}</p>
              <p className="text-sm text-muted-foreground">{finiquito.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
              <p className="text-base">
                {format(toLocalDate(finiquito.createdAt), 'PPP \'a las\' p', { locale: es })}
              </p>
            </div>
            {finiquito.daysFactorModified && finiquito.daysFactorModificationReason && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Razón de Modificación del Factor de Días</p>
                <p className="text-base whitespace-pre-wrap">{finiquito.daysFactorModificationReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el finiquito
              de {finiquito.employeeName} y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStatus === 'executing'}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteStatus === 'executing'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStatus === 'executing' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
