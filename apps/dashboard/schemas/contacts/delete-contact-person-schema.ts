import { z } from 'zod';

export const deleteContactPersonSchema = z.object({
  id: z
    .string({
      required_error: 'Contact person ID is required.',
      invalid_type_error: 'Contact person ID must be a string.'
    })
    .uuid('Contact person ID must be a valid UUID.')
});

export type DeleteContactPersonSchema = z.infer<typeof deleteContactPersonSchema>;
