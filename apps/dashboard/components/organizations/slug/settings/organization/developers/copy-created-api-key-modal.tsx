'use client';

import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { AlertCircleIcon, CopyIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { InputWithAdornments } from '@workspace/ui/components/input-with-adornments';
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/components/sonner';

import { useCopyToClipboard } from '~/hooks/use-copy-to-clipboard';
import { useEnhancedModal } from '~/hooks/use-enhanced-modal';

export type CopyCreatedApiKeyModalProps = NiceModalHocProps & {
  apiKey: string;
};

export const CopyCreatedApiKeyModal =
  NiceModal.create<CopyCreatedApiKeyModalProps>(({ apiKey }) => {
    const modal = useEnhancedModal();
    const copyToClipboard = useCopyToClipboard();
    const handleCopy = async (): Promise<void> => {
      if (!apiKey) {
        return;
      }
      await copyToClipboard(apiKey);
      toast.success('¡Copiado!');
    };
    return (
      <AlertDialog open={modal.visible}>
        <AlertDialogContent
          className="max-w-sm"
          onClose={modal.handleClose}
          onAnimationEndCapture={modal.handleAnimationEndCapture}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Clave API creada</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Copia la clave API antes de cerrar el modal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-start gap-4">
            <Alert variant="warning">
              <AlertCircleIcon className="size-[18px] shrink-0" />
              <AlertDescription className="inline">
                <h3 className="mb-2 font-semibold">
                  Mostraremos esta clave solo una vez
                </h3>
                Por favor copia tu clave y guárdala en un lugar seguro. Por razones de seguridad no podremos mostrarla nuevamente.
              </AlertDescription>
            </Alert>
            <div className="flex w-full flex-col space-y-2">
              <Label>Clave API</Label>
              <InputWithAdornments
                readOnly
                type="text"
                value={apiKey}
                endAdornment={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Copiar clave API"
                    className="-mr-2.5 size-8"
                    onClick={handleCopy}
                  >
                    <CopyIcon className="size-4 shrink-0" />
                  </Button>
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Por favor copia la clave API antes de cerrar el diálogo.
            </p>
          </div>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="default"
              onClick={modal.handleClose}
            >
              Entendido
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  });
