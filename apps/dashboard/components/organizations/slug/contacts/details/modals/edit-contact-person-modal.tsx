'use client';

import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { Trash2Icon } from 'lucide-react';
import { z } from 'zod';

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

import { deleteContactPerson } from '~/actions/contacts/delete-contact-person';
import { updateContactPerson } from '~/actions/contacts/update-contact-person';
import { DeleteContactPersonModal } from '~/components/organizations/slug/contacts/details/modals/delete-contact-person-modal';
import { useEnhancedModal } from '~/hooks/use-enhanced-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import { updateContactPersonSchema } from '~/schemas/contacts/update-contact-person-schema';
import type { ContactPersonDto } from '~/types/dtos/contact-person-dto';

export type EditContactPersonModalProps = NiceModalHocProps & {
  person: ContactPersonDto;
};

export const EditContactPersonModal = NiceModal.create<EditContactPersonModalProps>(
  ({ person }) => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    const methods = useZodForm({
      schema: updateContactPersonSchema,
      mode: 'onSubmit',
      defaultValues: {
        id: person.id,
        name: person.name,
        position: person.position || '',
        email: person.email || '',
        phone: person.phone || '',
        isPrimary: person.isPrimary
      }
    });
    const title = 'Editar Persona de Contacto';
    const description = 'Editar información de la persona de contacto';
    const canSubmit =
      !methods.formState.isSubmitting &&
      (!methods.formState.isSubmitted || methods.formState.isDirty);

    const handleDelete = async (): Promise<void> => {
      const confirmed = await NiceModal.show(DeleteContactPersonModal);
      if (confirmed) {
        const result = await deleteContactPerson({ id: person.id });
        if (!result?.serverError && !result?.validationErrors) {
          toast.success('Persona de contacto eliminada');
          modal.handleClose();
        } else {
          toast.error('No se pudo eliminar la persona de contacto');
        }
      }
    };

    const onSubmit = async (values: z.input<typeof updateContactPersonSchema>) => {
      if (!canSubmit) {
        return;
      }
      const result = await updateContactPerson(values);
      if (!result?.serverError && !result?.validationErrors) {
        toast.success('Persona de contacto actualizada');
        modal.handleClose();
      } else {
        toast.error('No se pudo actualizar la persona de contacto');
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
        <div className="flex justify-start border-t pt-4">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={methods.formState.isSubmitting}
          >
            <Trash2Icon className="mr-1 size-4" />
            Eliminar
          </Button>
        </div>
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
          Guardar Cambios
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
