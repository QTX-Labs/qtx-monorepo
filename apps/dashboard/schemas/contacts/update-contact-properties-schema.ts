import { z } from 'zod';

import { ContactRecord, ContactType } from '@workspace/database';

export const updateContactPropertiesSchema = z.object({
  id: z
    .string({
      required_error: 'Id is required.',
      invalid_type_error: 'Id must be a string.'
    })
    .trim()
    .uuid('Id is invalid.')
    .min(1, 'Id is required.')
    .max(36, 'Maximum 36 characters allowed.'),
  record: z.nativeEnum(ContactRecord, {
    required_error: 'Record is required',
    invalid_type_error: 'Record must be a string'
  }),
  type: z.nativeEnum(ContactType, {
    invalid_type_error: 'Type must be a valid ContactType'
  }).optional(),
  name: z
    .string({
      required_error: 'Name is required.',
      invalid_type_error: 'Name must be a string.'
    })
    .trim()
    .min(1, 'Name is required.')
    .max(255, 'Maximum 255 characters allowed.'),
  businessName: z
    .string({
      invalid_type_error: 'Business name must be a string.'
    })
    .trim()
    .max(255, 'Maximum 255 characters allowed.')
    .optional()
    .or(z.literal('')),
  email: z
    .string({
      invalid_type_error: 'Email must be a string.'
    })
    .trim()
    .max(255, 'Maximum 255 characters allowed.')
    .email('Enter a valid email address.')
    .optional()
    .or(z.literal('')),
  phone: z
    .string({
      invalid_type_error: 'Phone must be a string.'
    })
    .trim()
    .max(16, 'Maximum 16 characters allowed.')
    .optional()
    .or(z.literal('')),
  address: z
    .string({
      invalid_type_error: 'Address must be a string.'
    })
    .trim()
    .max(255, 'Maximum 255 characters allowed.')
    .optional()
    .or(z.literal('')),
  fiscalAddress: z
    .string({
      invalid_type_error: 'Fiscal address must be a string.'
    })
    .trim()
    .max(500, 'Maximum 500 characters allowed.')
    .optional()
    .or(z.literal('')),
  fiscalPostalCode: z
    .string({
      invalid_type_error: 'Fiscal postal code must be a string.'
    })
    .trim()
    .max(16, 'Maximum 16 characters allowed.')
    .optional()
    .or(z.literal('')),
  rfc: z
    .string({
      invalid_type_error: 'RFC must be a string.'
    })
    .trim()
    .max(13, 'Maximum 13 characters allowed.')
    .optional()
    .or(z.literal('')),
  businessActivity: z
    .string({
      invalid_type_error: 'Business activity must be a string.'
    })
    .trim()
    .optional()
    .or(z.literal('')),
  taxRegime: z
    .string({
      invalid_type_error: 'Tax regime must be a string.'
    })
    .trim()
    .max(255, 'Maximum 255 characters allowed.')
    .optional()
    .or(z.literal(''))
});

export type UpdateContactPropertiesSchema = z.infer<
  typeof updateContactPropertiesSchema
>;
