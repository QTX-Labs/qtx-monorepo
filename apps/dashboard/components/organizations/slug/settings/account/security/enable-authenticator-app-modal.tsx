'use client';

import Link from 'next/link';
import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { CopyIcon, InfoIcon } from 'lucide-react';
import { type SubmitHandler } from 'react-hook-form';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@workspace/ui/components/drawer';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider
} from '@workspace/ui/components/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS
} from '@workspace/ui/components/input-otp';
import { toast } from '@workspace/ui/components/sonner';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';
import { cn } from '@workspace/ui/lib/utils';

import { enableAuthenticatorApp } from '~/actions/account/enable-authenticator-app';
import { useCopyToClipboard } from '~/hooks/use-copy-to-clipboard';
import { useEnhancedModal } from '~/hooks/use-enhanced-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  enableAuthenticatorAppSchema,
  type EnableAuthenticatorAppSchema
} from '~/schemas/account/enable-authenticator-app-schema';

export type EnableAuthenticatorAppModalProps = NiceModalHocProps & {
  accountName: string;
  issuer: string;
  secret: string;
  dataUri: string;
};

export const EnableAuthenticatorAppModal =
  NiceModal.create<EnableAuthenticatorAppModalProps>(
    ({ accountName, issuer, secret, dataUri }) => {
      const modal = useEnhancedModal();
      const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
      const methods = useZodForm({
        schema: enableAuthenticatorAppSchema,
        mode: 'onSubmit',
        defaultValues: {
          accountName,
          issuer,
          secret,
          totpCode: ''
        }
      });
      const copyToClipboard = useCopyToClipboard();
      const title = 'App autenticadora';
      const description =
        'Agrega una app autenticadora completando el formulario a continuación.';
      const canSubmit =
        !methods.formState.isSubmitting && methods.formState.isValid;
      const handleCopySecret = async (): Promise<void> => {
        await copyToClipboard(secret);
        toast.success('¡Copiado!');
      };
      const onSubmit: SubmitHandler<EnableAuthenticatorAppSchema> = async (
        values
      ) => {
        if (!canSubmit) {
          return;
        }

        const result = await enableAuthenticatorApp(values);
        if (!result?.serverError && !result?.validationErrors && result?.data) {
          toast.success('App autenticadora activada');
          modal.resolve(result.data.recoveryCodes);
          modal.handleClose();
        } else {
          if (result?.validationErrors?.totpCode?._errors?.[0]) {
            methods.setError('totpCode', {
              message: result.validationErrors.totpCode._errors[0]
            });
          } else {
            toast.error('No se pudo activar la app autenticadora');
          }
        }
      };
      const renderForm = (
        <form
          className={cn('space-y-4', !mdUp && 'p-4')}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <p className="text-sm text-muted-foreground">
            Usando una app autenticadora como{' '}
            <Link
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:underline"
            >
              Google Authenticator
            </Link>
            ,{' '}
            <Link
              href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:underline"
            >
              Microsoft Authenticator
            </Link>
            ,{' '}
            <Link
              href="https://authy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:underline"
            >
              Authy
            </Link>{' '}
            o{' '}
            <Link
              href="https://1password.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:underline"
            >
              1Password
            </Link>{' '}
            escanea este código QR. Generará un código de 6 dígitos para que lo ingreses a continuación.
          </p>
          <div>
            <div className="mx-auto size-48">
              <img
                src={dataUri}
                alt="Código QR"
              />
            </div>
            <div className="mx-auto flex flex-row items-center justify-center gap-2 text-xs font-semibold">
              {secret}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={handleCopySecret}
              >
                <CopyIcon className="size-4 shrink-0" />
              </Button>
            </div>
          </div>
          <FormField
            control={methods.control}
            name="totpCode"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col items-center">
                <FormLabel>Ingresa el código de 6 dígitos de la app</FormLabel>
                <FormControl>
                  <InputOTP
                    {...field}
                    inputMode="numeric"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    disabled={methods.formState.isSubmitting}
                    onComplete={methods.handleSubmit(onSubmit)}
                  >
                    <InputOTPGroup>
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="size-12"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Alert variant="info">
            <InfoIcon className="size-[18px] shrink-0" />
            <AlertDescription className="inline">
              Si tu app solicita un emisor, usa "
              <strong className="text-foreground">{issuer}</strong>" y para el nombre de cuenta usa "
              <strong className="text-foreground">{accountName}</strong>".
            </AlertDescription>
          </Alert>
        </form>
      );
      const renderButtons = (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={modal.handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!canSubmit}
            loading={methods.formState.isSubmitting}
            onClick={methods.handleSubmit(onSubmit)}
          >
            Activar
          </Button>
        </>
      );
      return (
        <FormProvider {...methods}>
          {mdUp ? (
            <Dialog open={modal.visible}>
              <DialogContent
                className="max-w-lg"
                onClose={modal.handleClose}
                onAnimationEndCapture={modal.handleAnimationEndCapture}
              >
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                  <DialogDescription className="sr-only">
                    {description}
                  </DialogDescription>
                </DialogHeader>
                {renderForm}
                <DialogFooter>{renderButtons}</DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer
              open={modal.visible}
              onOpenChange={modal.handleOpenChange}
            >
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle>{title}</DrawerTitle>
                  <DrawerDescription className="sr-only">
                    {description}
                  </DrawerDescription>
                </DrawerHeader>
                {renderForm}
                <DrawerFooter className="flex-col-reverse pt-4">
                  {renderButtons}
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </FormProvider>
      );
    }
  );
