'use client';

import { useState } from 'react';
import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { type SubmitHandler, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

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
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';
import { cn } from '@workspace/ui/lib/utils';

import { useEnhancedModal } from '~/hooks/use-enhanced-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  pdfComplementoConfigSchema,
  type PDFComplementoConfig
} from '~/lib/finiquitos/schemas/pdf-complemento-config-schema';
import {
  DEFAULT_COMPLEMENTO_CONFIG,
  ALL_COMPLEMENTO_CONCEPTS
} from '~/lib/finiquitos/pdf/pdf-complemento-config-defaults';

export type PDFComplementoConfigModalProps = NiceModalHocProps & {
  /**
   * Active complemento concepts (with amount > 0)
   * Used to filter available concepts in the UI
   */
  activeConcepts: string[];
};

/**
 * PDF Complemento Configuration Modal
 *
 * Pre-download configuration dialog for customizing how complemento concepts
 * are displayed in finiquito PDFs. Supports two display modes:
 * - Itemized: Each concept shows individually with its actual name
 * - Grouped: User-defined groups with custom labels summing selected concepts
 *
 * Features:
 * - Responsive design (Dialog on desktop, Drawer on mobile)
 * - Dynamic group management via useFieldArray
 * - Smart checkbox disabling to prevent concept reuse across groups
 * - Form validation with React Hook Form + Zod
 * - Default configuration matches previous hardcoded behavior
 *
 * Security:
 * - Maximum 20 groups (DoS protection)
 * - 50 char label limit with control character blocking
 * - 30 char field name limit with control character blocking
 * - Strict validation prevents concept duplication across groups
 *
 * Usage:
 * ```ts
 * const config = await NiceModal.show(PDFComplementoConfigModal, {
 *   activeConcepts: ['montoDiasTrabajadosComplemento', ...]
 * });
 * // Returns PDFComplementoConfig on submit, null on cancel
 * ```
 */
export const PDFComplementoConfigModal = NiceModal.create<PDFComplementoConfigModalProps>(
  ({ activeConcepts }) => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });

    // Filter default config to only include active concepts
    const defaultGroups = DEFAULT_COMPLEMENTO_CONFIG.groups?.map(group => ({
      ...group,
      conceptFields: group.conceptFields.filter(field => activeConcepts.includes(field))
    })).filter(group => group.conceptFields.length > 0);

    const methods = useZodForm({
      schema: pdfComplementoConfigSchema,
      mode: 'onSubmit',
      defaultValues: {
        displayMode: 'grouped' as const,
        groups: defaultGroups || []
      }
    });

    const { fields, append, remove } = useFieldArray({
      control: methods.control,
      name: 'groups'
    });

    const displayMode = methods.watch('displayMode');
    const groups = methods.watch('groups');

    // Track which concepts are already assigned to groups
    const assignedConcepts = new Set(
      groups?.flatMap(g => g.conceptFields) || []
    );

    const title = 'Configurar Conceptos de Complemento';
    const description = 'Personaliza cómo se muestran los conceptos de complemento en el PDF';

    const onSubmit: SubmitHandler<PDFComplementoConfig> = async (values) => {
      // Resolve the modal with the configuration
      modal.resolve(values);
      modal.handleClose();
    };

    const handleCancel = () => {
      // Resolve with null (user cancelled)
      modal.resolve(null);
      modal.handleClose();
    };

    const handleAddGroup = () => {
      append({
        label: '',
        conceptFields: []
      });
    };

    const canSubmit = !methods.formState.isSubmitting;

    // Filter available concepts to only show active ones
    const availableConcepts = ALL_COMPLEMENTO_CONCEPTS.filter(concept =>
      activeConcepts.includes(concept.field)
    );

    const renderForm = (
      <form
        className={cn('space-y-6', !mdUp && 'p-4')}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {/* Display Mode Selection */}
        <FormField
          control={methods.control}
          name="displayMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modo de Visualización</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="itemized" id="itemized" />
                    <label
                      htmlFor="itemized"
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div>Desglosados</div>
                      <p className="text-xs text-muted-foreground">
                        Cada concepto se muestra individualmente con su nombre
                      </p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grouped" id="grouped" />
                    <label
                      htmlFor="grouped"
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div>Agrupados</div>
                      <p className="text-xs text-muted-foreground">
                        Crea grupos personalizados para sumar conceptos
                      </p>
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grouped Mode: Group Configuration */}
        {displayMode === 'grouped' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Grupos de Conceptos</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGroup}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Grupo
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay grupos configurados. Haz clic en "Agregar Grupo" para comenzar.
              </p>
            )}

            {fields.map((field, groupIndex) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <FormField
                    control={methods.control}
                    name={`groups.${groupIndex}.label`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nombre del Grupo {groupIndex + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: BONOS, AYUDA DE SUELDO"
                            maxLength={50}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-8"
                    onClick={() => remove(groupIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <FormField
                  control={methods.control}
                  name={`groups.${groupIndex}.conceptFields`}
                  render={() => (
                    <FormItem>
                      <FormLabel>Conceptos en este grupo</FormLabel>
                      <div className="space-y-2">
                        {availableConcepts.map((concept) => {
                          const isAssignedToThisGroup = groups?.[groupIndex]?.conceptFields?.includes(concept.field);
                          const isAssignedToOtherGroup = assignedConcepts.has(concept.field) && !isAssignedToThisGroup;

                          return (
                            <FormField
                              key={concept.field}
                              control={methods.control}
                              name={`groups.${groupIndex}.conceptFields`}
                              render={({ field: checkboxField }) => (
                                <FormItem
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={checkboxField.value?.includes(concept.field)}
                                      disabled={isAssignedToOtherGroup}
                                      onCheckedChange={(checked) => {
                                        const current = checkboxField.value || [];
                                        if (checked) {
                                          checkboxField.onChange([...current, concept.field]);
                                        } else {
                                          checkboxField.onChange(
                                            current.filter((val) => val !== concept.field)
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className={cn(
                                    "font-normal",
                                    isAssignedToOtherGroup && "text-muted-foreground"
                                  )}>
                                    {concept.label}
                                    {isAssignedToOtherGroup && (
                                      <span className="ml-2 text-xs">(ya asignado)</span>
                                    )}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {/* Global form errors */}
        {methods.formState.errors.root && (
          <p className="text-sm text-destructive">
            {methods.formState.errors.root.message}
          </p>
        )}
        {methods.formState.errors.groups && (
          <p className="text-sm text-destructive">
            {methods.formState.errors.groups.message}
          </p>
        )}
      </form>
    );

    const renderButtons = (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
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
          Generar PDF
        </Button>
      </>
    );

    return (
      <FormProvider {...methods}>
        {mdUp ? (
          <Dialog open={modal.visible}>
            <DialogContent
              className="max-w-2xl max-h-[90vh] overflow-y-auto"
              onClose={handleCancel}
              onAnimationEndCapture={modal.handleAnimationEndCapture}
            >
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
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
                <DrawerDescription>
                  {description}
                </DrawerDescription>
              </DrawerHeader>
              <div className="max-h-[70vh] overflow-y-auto">
                {renderForm}
              </div>
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
