import { z } from 'zod';

import { passwordValidator } from '@workspace/auth/password';

export const signUpSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre es requerido.',
      invalid_type_error: 'El nombre debe ser una cadena de texto.'
    })
    .trim()
    .min(1, 'El nombre es requerido.')
    .max(64, 'Máximo 64 caracteres permitidos.'),
  email: z
    .string({
      required_error: 'El correo electrónico es requerido.',
      invalid_type_error: 'El correo electrónico debe ser una cadena de texto.'
    })
    .trim()
    .min(1, 'El correo electrónico es requerido.')
    .max(255, 'Máximo 255 caracteres permitidos.')
    .email('Ingresa una dirección de correo electrónico válida.'),
  password: z
    .string({
      required_error: 'La contraseña es requerida.',
      invalid_type_error: 'La contraseña debe ser una cadena de texto.'
    })
    .min(1, 'La contraseña es requerida.')
    .max(72, 'Máximo 72 caracteres permitidos.')
    .refine((arg) => passwordValidator.validate(arg).success, {
      message: 'La contraseña no cumple con los requisitos.'
    })
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
