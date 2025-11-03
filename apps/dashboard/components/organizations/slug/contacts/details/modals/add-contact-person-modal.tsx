'use client';

import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { type SubmitHandler } from 'react-hook-form';

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
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { toast } from '@workspace/ui/components/sonner';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';
import { cn } from '@workspace/ui/lib/utils';

import { addContactPerson } from '~/actions/contacts/add-contact-person';
import { useEnhancedModal } from '~/hooks/use-enhanced-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  addContactPersonSchema,
  type AddContactPersonSchema
} from '~/schemas/contacts/add-contact-person-schema';

export type AddContactPersonModalProps = NiceModalHocProps & {
  contactId: string;
};

export const AddContactPersonModal = NiceModal.create<AddContactPersonModalProps>(
  ({ contactId }) => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    const methods = useZodForm({
      schema: addContactPersonSchema,
      mode: 'onSubmit',
      defaultValues: {
        contactId,
        name: '',
        position: '',
        email: '',
        phone: '',
        isPrimary: false
      }
    });
    const title = 'Agregar Persona de Contacto';
    const description = 'Agregar una nueva persona de contacto (máximo 3)';
    const canSubmit =
      !methods.formState.isSubmitting &&
      (!methods.formState.isSubmitted || methods.formState.isDirty);
    const onSubmit: SubmitHandler<AddContactPersonSchema> = async (values) => {
      if (!canSubmit) {
        return;
      }
      const result = await addContactPerson(values);
      if (!result?.serverError && !result?.validationErrors) {
        toast.success('Persona de contacto agregada');
        modal.handleClose();
      } else {
        if (result?.serverError?.includes('Maximum 3')) {
          toast.error('Máximo 3 personas de contacto permitidas');
        } else {
          toast.error('No se pudo agregar la persona de contacto');
        }
      }
    };
    const renderForm = (
      <form
        className={cn('space-y-4', !mdUp && 'p-4')}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <FormField
          control={methods.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel required>Nombre Completo</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  maxLength={255}
                  required
                  disabled={methods.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              {(methods.formState.touchedFields.name ||
                methods.formState.submitCount > 0) && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="position"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel>Cargo / Puesto</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  maxLength={255}
                  disabled={methods.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  maxLength={255}
                  disabled={methods.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  maxLength={32}
                  disabled={methods.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="isPrimary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Contacto Principal</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Marcar como persona de contacto principal
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={methods.formState.isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />
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
          Guardar
        </Button>
      </>
    );
    return (
      <FormProvider {...methods}>
        {mdUp ? (
          <Dialog open={modal.visible}>
            <DialogContent
              className="max-w-sm"
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
