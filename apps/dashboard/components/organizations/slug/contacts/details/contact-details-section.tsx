'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import {
  IdCardIcon,
  LayoutListIcon,
  MailIcon,
  PhoneIcon,
  SquareDashedKanbanIcon,
  TrashIcon,
  UploadIcon
} from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';

import { ContactRecord, ContactType } from '@workspace/database';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@workspace/ui/components/form';
import { ImageDropzone } from '@workspace/ui/components/image-dropzone';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { toast } from '@workspace/ui/components/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';

import { updateContactImage } from '~/actions/contacts/update-contact-image';
import { updateContactProperties } from '~/actions/contacts/update-contact-properties';
import { CropPhotoModal } from '~/components/organizations/slug/settings/account/profile/crop-photo-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import { FileUploadAction, MAX_IMAGE_SIZE } from '~/lib/file-upload';
import { contactRecordLabel } from '~/lib/labels';
import {
  updateContactPropertiesSchema,
  type UpdateContactPropertiesSchema
} from '~/schemas/contacts/update-contact-properties-schema';
import type { ContactDto } from '~/types/dtos/contact-dto';

export type ContactDetailsSectionProps =
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    contact: ContactDto;
  };

export function ContactDetailsSection({
  contact,
  ...others
}: ContactDetailsSectionProps): React.JSX.Element {
  return (
    <section {...others}>
      <ContactImage {...contact} />
      <Properties {...contact} />
    </section>
  );
}

function ContactImage(contact: ContactDto): React.JSX.Element {
  const handleDrop = async (files: File[]): Promise<void> => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(
          `Uploaded image shouldn't exceed ${MAX_IMAGE_SIZE / 1000000} MB size limit`
        );
      } else {
        const base64Image: string = await NiceModal.show(CropPhotoModal, {
          file,
          aspectRatio: 1,
          circularCrop: contact.record === ContactRecord.PERSON
        });
        if (base64Image) {
          const result = await updateContactImage({
            id: contact.id,
            action: FileUploadAction.Update,
            image: base64Image
          });
          if (!result?.serverError && !result?.validationErrors) {
            toast.success('Image updated');
          } else {
            toast.error("Couldn't update image");
          }
        }
      }
    }
  };
  const handleRemoveImage = async (): Promise<void> => {
    const result = await updateContactImage({
      id: contact.id,
      action: FileUploadAction.Delete,
      image: undefined
    });
    if (!result?.serverError && !result?.validationErrors) {
      toast.success('Image removed');
    } else {
      toast.error("Couldn't remove image");
    }
  };
  return (
    <div className="flex items-center justify-center p-6">
      <div className="relative">
        <ImageDropzone
          accept={{ 'image/*': [] }}
          multiple={false}
          onDrop={handleDrop}
          borderRadius={contact.record === ContactRecord.PERSON ? 'full' : 'md'}
          src={contact.image}
          className="max-h-[120px] min-h-[120px] w-[120px] p-0.5"
        >
          <Avatar
            className={cn(
              'size-28',
              contact.record === ContactRecord.PERSON
                ? 'rounded-full'
                : 'rounded-md'
            )}
          >
            <AvatarFallback
              className={cn(
                'size-28 text-2xl',
                contact.record === ContactRecord.PERSON
                  ? 'rounded-full'
                  : 'rounded-md'
              )}
            >
              <UploadIcon className="size-5 shrink-0 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </ImageDropzone>
        {contact.image && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -bottom-1 -right-1 z-10 size-8 rounded-full bg-background"
                onClick={handleRemoveImage}
              >
                <TrashIcon className="size-4 shrink-0" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Remove image</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function Properties(contact: ContactDto): React.JSX.Element {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const methods = useZodForm({
    schema: updateContactPropertiesSchema,
    mode: 'onSubmit',
    defaultValues: {
      id: contact.id,
      record: contact.record,
      type: contact.type,
      name: contact.name,
      businessName: contact.businessName ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      address: contact.address ?? '',
      fiscalAddress: contact.fiscalAddress ?? '',
      fiscalPostalCode: contact.fiscalPostalCode ?? '',
      rfc: contact.rfc ?? '',
      businessActivity: contact.businessActivity ?? '',
      taxRegime: contact.taxRegime ?? ''
    }
  });
  const canSubmit = !methods.formState.isSubmitting;
  const handleEnableEditMode = async (): Promise<void> => {
    setEditMode(true);
  };
  const handleCancel = async (): Promise<void> => {
    methods.reset(methods.formState.defaultValues);
    setEditMode(false);
  };
  const onSubmit = async (values: z.input<typeof updateContactPropertiesSchema>) => {
    if (!canSubmit) {
      return;
    }
    const result = await updateContactProperties(values);
    if (!result?.serverError && !result?.validationErrors) {
      toast.success('Properties updated');
      setEditMode(false);
    } else {
      toast.error("Couldn't update properties");
    }
  };
  return (
    <FormProvider {...methods}>
      <form
        className="space-y-2 px-6 pb-6"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Properties</h3>
          {editMode ? (
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-success hover:text-success min-w-fit"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-success hover:text-success min-w-fit"
                disabled={!canSubmit}
                onClick={methods.handleSubmit(onSubmit)}
              >
                Save
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-success hover:text-success min-w-fit"
              disabled={methods.formState.isSubmitting}
              onClick={handleEnableEditMode}
            >
              Edit
            </Button>
          )}
        </div>
        <dl className="divide-y divide-border/50 [&>*]:py-3 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
          <Property
            icon={<SquareDashedKanbanIcon className="size-3 shrink-0" />}
            term="Record"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="record"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Select
                          required
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={methods.formState.isSubmitting}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ContactRecord).map((value) => (
                              <SelectItem
                                key={value}
                                value={value}
                              >
                                {contactRecordLabel[value as ContactRecord]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contactRecordLabel[contact.record]
              )
            }
            placeholder="No type available"
          />
          <Property
            icon={<IdCardIcon className="size-3 shrink-0" />}
            term="Name"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={70}
                          required
                          className="h-9"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.name
              )
            }
            placeholder="No name available"
          />
          <Property
            icon={<MailIcon className="size-3 shrink-0" />}
            term="Email"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="email"
                          maxLength={255}
                          className="h-9"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.email
              )
            }
            placeholder="No email available"
          />
          <Property
            icon={<PhoneIcon className="size-3 shrink-0" />}
            term="Phone"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="tel"
                          maxLength={70}
                          className="h-9"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.phone
              )
            }
            placeholder="No phone available"
          />
          <Property
            icon={<LayoutListIcon className="size-3 shrink-0" />}
            term="Address"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={255}
                          className="h-9"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.address
              )
            }
            placeholder="No address available"
          />
          <Property
            icon={<IdCardIcon className="size-3 shrink-0" />}
            term="Tipo"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Select
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                          disabled={methods.formState.isSubmitting}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ContactType.EMISOR}>Emisor</SelectItem>
                            <SelectItem value={ContactType.RECEPTOR}>Receptor</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.type ?? ''
              )
            }
            placeholder="No type available"
          />
          <Property
            icon={<IdCardIcon className="size-3 shrink-0" />}
            term="Razón Social"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={255}
                          className="h-9"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.businessName
              )
            }
            placeholder="No business name"
          />
          <Property
            icon={<IdCardIcon className="size-3 shrink-0" />}
            term="RFC"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="rfc"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={13}
                          className="h-9"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.rfc
              )
            }
            placeholder="No RFC"
          />
          <Property
            icon={<LayoutListIcon className="size-3 shrink-0" />}
            term="Dir. Fiscal"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="fiscalAddress"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Textarea
                          maxLength={500}
                          className="min-h-[80px] resize-none"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.fiscalAddress
              )
            }
            placeholder="No fiscal address"
          />
          <Property
            icon={<IdCardIcon className="size-3 shrink-0" />}
            term="C.P. Fiscal"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="fiscalPostalCode"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={16}
                          className="h-9"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.fiscalPostalCode
              )
            }
            placeholder="No postal code"
          />
          <Property
            icon={<LayoutListIcon className="size-3 shrink-0" />}
            term="Giro"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="businessActivity"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Textarea
                          className="min-h-[80px] resize-none"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.businessActivity
              )
            }
            placeholder="No business activity"
          />
          <Property
            icon={<IdCardIcon className="size-3 shrink-0" />}
            term="Régimen Fiscal"
            details={
              editMode ? (
                <FormField
                  control={methods.control}
                  name="taxRegime"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          type="text"
                          maxLength={255}
                          className="h-9"
                          disabled={methods.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                contact.taxRegime
              )
            }
            placeholder="No tax regime"
          />
        </dl>
      </form>
    </FormProvider>
  );
}

type PropertyProps = {
  icon: React.ReactNode;
  term: string;
  details?: React.ReactNode;
  placeholder: string;
};

function Property({
  icon,
  term,
  details,
  placeholder
}: PropertyProps): React.JSX.Element {
  const isTextContent = typeof details === 'string';

  return (
    <div className="flex flex-col gap-1.5">
      <dt className="flex flex-row items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {term}
      </dt>
      <dd className="flex min-h-[28px] w-full flex-row items-start">
        {details ? (
          isTextContent ? (
            <p className="text-sm leading-relaxed break-words">{details}</p>
          ) : (
            <div className="w-full">{details}</div>
          )
        ) : (
          <p className="text-sm italic text-muted-foreground opacity-50">{placeholder}</p>
        )}
      </dd>
    </div>
  );
}
