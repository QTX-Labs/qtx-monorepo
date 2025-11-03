import { z } from 'zod';

export const addContactPersonSchema = z.object({
  contactId: z
    .string({
      required_error: 'Contact ID is required.',
      invalid_type_error: 'Contact ID must be a string.'
    })
    .uuid('Contact ID must be a valid UUID.'),
  name: z
    .string({
      required_error: 'Name is required.',
      invalid_type_error: 'Name must be a string.'
    })
    .trim()
    .min(1, 'Name is required.')
    .max(255, 'Maximum 255 characters allowed.'),
  position: z
    .string({
      invalid_type_error: 'Position must be a string.'
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
    .max(32, 'Maximum 32 characters allowed.')
    .optional()
    .or(z.literal('')),
  isPrimary: z.boolean().default(false)
});

export type AddContactPersonSchema = z.infer<typeof addContactPersonSchema>;
