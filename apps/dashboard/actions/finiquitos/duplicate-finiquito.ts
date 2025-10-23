'use server';

import { authOrganizationActionClient } from '../safe-action';
import { getFiniquitoById } from '~/data/finiquitos/get-finiquito-by-id';
import { mapFiniquitoToStep1, mapFiniquitoToStep2, mapFiniquitoToStep3 } from '~/lib/finiquitos/map-finiquito-to-wizard';
import type { Step1BaseConfig } from '~/lib/finiquitos/schemas/step1-base-config-schema';
import type { Step2Factors } from '~/lib/finiquitos/schemas/step2-factors-schema';
import type { Step3Deductions } from '~/lib/finiquitos/schemas/step3-deductions-schema';
import { z } from 'zod';

const duplicateFiniquitoSchema = z.object({
  finiquitoId: z.string(),
});

export const duplicateFiniquito = authOrganizationActionClient
  .metadata({ actionName: 'duplicateFiniquito' })
  .inputSchema(duplicateFiniquitoSchema)
  .action(async ({ parsedInput, ctx }) => {
    console.log('[duplicateFiniquito] Starting with finiquitoId:', parsedInput.finiquitoId);

    try {
      // Fetch full finiquito data
      console.log('[duplicateFiniquito] Fetching finiquito...');
      const finiquito = await getFiniquitoById(parsedInput.finiquitoId);

      if (!finiquito) {
        console.error('[duplicateFiniquito] Finiquito not found');
        throw new Error('Finiquito no encontrado');
      }

      // Version check - only v2 finiquitos can be duplicated
      if (finiquito.version !== 2) {
        console.error('[duplicateFiniquito] Invalid version:', finiquito.version);
        throw new Error('Solo se pueden duplicar finiquitos versión 2');
      }

      console.log('[duplicateFiniquito] Finiquito fetched successfully');

      // Transform to wizard format
      console.log('[duplicateFiniquito] Mapping to step1...');
      const step1: Step1BaseConfig = mapFiniquitoToStep1(finiquito);
      console.log('[duplicateFiniquito] Mapping to step2...');
      const step2: Step2Factors = mapFiniquitoToStep2(finiquito);
      console.log('[duplicateFiniquito] Mapping to step3...');
      const step3: Step3Deductions = mapFiniquitoToStep3(finiquito);
      console.log('[duplicateFiniquito] All mappings complete');

      // Serialize and deserialize to ensure plain objects, then restore Date objects
      console.log('[duplicateFiniquito] Serializing...');
      const serialized = JSON.parse(JSON.stringify({ step1, step2, step3 }));

      // Restore Date objects
      if (serialized.step1.hireDate) {
        serialized.step1.hireDate = new Date(serialized.step1.hireDate);
      }
      if (serialized.step1.terminationDate) {
        serialized.step1.terminationDate = new Date(serialized.step1.terminationDate);
      }
      if (serialized.step1.realHireDate) {
        serialized.step1.realHireDate = new Date(serialized.step1.realHireDate);
      }

      console.log('[duplicateFiniquito] Success, returning data');
      return serialized;
    } catch (error) {
      console.error('[duplicateFiniquito] Error:', error);

      // Provide user-friendly error messages
      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error('Error al duplicar el finiquito. Por favor, intente nuevamente.');
    }
  });
