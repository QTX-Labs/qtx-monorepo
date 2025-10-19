'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, ArrowLeft, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { type Finiquito, type User, type FiniquitoAttachment } from '@workspace/database';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { deleteFiniquito } from '~/actions/finiquitos/delete-finiquito';
import { toLocalDate } from '~/lib/finiquitos/utils';
import { formatDate } from '~/lib/finiquitos/format-helpers';

// Nuevos componentes
import { GeneralInfoSection } from './detail/general-info-section';
import { FiniquitoSection } from './detail/finiquito-section';
import { LiquidacionSection } from './detail/liquidacion-section';
import { ComplementoSection } from './detail/complemento-section';
import { DeduccionesManualesSection } from './detail/deducciones-manuales-section';
import { TotalSection } from './detail/total-section';

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

  const isLoading = isDownloading || deleteStatus === 'executing';
  const isLegacyFiniquito = !finiquito.version || finiquito.version < 2;

  // Si es un finiquito legacy (versión < 2), mostrar vista antigua
  if (isLegacyFiniquito) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/organizations/${params.slug}/finiquitos`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} disabled={isLoading}>
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Descargar PDF
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isLoading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Alert de versión antigua */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Finiquito con Sistema Anterior</AlertTitle>
          <AlertDescription>
            Este finiquito fue creado con el sistema anterior (versión {finiquito.version || 1}).
            La información mostrada puede no incluir todos los detalles del nuevo sistema.
          </AlertDescription>
        </Alert>

        {/* Card básico con información */}
        <Card>
          <CardHeader>
            <CardTitle>Finiquito - {finiquito.employeeName}</CardTitle>
            <CardDescription>
              Creado el {formatDate(finiquito.createdAt)} por {finiquito.user.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Empleado:</span>
                <p className="font-medium">{finiquito.employeeName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Empresa:</span>
                <p className="font-medium">{finiquito.empresaName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total a Pagar:</span>
                <p className="font-bold text-lg">${Number(finiquito.totalToPay || 0).toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Para ver el desglose completo, descargue el PDF.
            </p>
          </CardContent>
        </Card>

        {/* Delete Dialog */}
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
      </div>
    );
  }

  // Vista nueva para finiquitos v2
  return (
    <>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* Header con acciones */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              onClick={() => router.push(`/organizations/${params.slug}/finiquitos`)}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al listado
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Finiquito - {finiquito.employeeName}
            </h1>
            {finiquito.employeePosition && (
              <p className="text-muted-foreground">{finiquito.employeePosition}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Creado el {format(toLocalDate(finiquito.createdAt), 'PPP', { locale: es })} por {finiquito.user.name}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} disabled={isLoading}>
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

        {/* Información General */}
        <GeneralInfoSection finiquito={finiquito} />

        {/* Finiquito Section */}
        <FiniquitoSection finiquito={finiquito} />

        {/* Liquidación Section (si existe) */}
        {finiquito.liquidacionActivada && (
          <LiquidacionSection finiquito={finiquito} />
        )}

        {/* Complemento Section (si existe) */}
        {finiquito.complementoActivado && (
          <ComplementoSection finiquito={finiquito} />
        )}

        {/* Deducciones Manuales */}
        <DeduccionesManualesSection finiquito={finiquito} />

        {/* Total a Pagar */}
        <TotalSection finiquito={finiquito} />
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
