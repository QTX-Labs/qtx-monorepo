import { AuthErrorCode } from '@workspace/auth/errors';
import { Provider } from '@workspace/auth/providers.types';
import {
  ContactRecord,
  ContactStage,
  FeedbackCategory,
  Role,
  WebhookTrigger
} from '@workspace/database';

export const contactStageLabel: Record<ContactStage, string> = {
  [ContactStage.LEAD]: 'Lead',
  [ContactStage.QUALIFIED]: 'Qualified',
  [ContactStage.OPPORTUNITY]: 'Opportunity',
  [ContactStage.PROPOSAL]: 'Proposal',
  [ContactStage.IN_NEGOTIATION]: 'In negotiation',
  [ContactStage.LOST]: 'Lost',
  [ContactStage.WON]: 'Won'
};

export const contactRecordLabel: Record<ContactRecord, string> = {
  [ContactRecord.PERSON]: 'Person',
  [ContactRecord.COMPANY]: 'Company'
};

export const roleLabels: Record<Role, string> = {
  [Role.MEMBER]: 'Member',
  [Role.ADMIN]: 'Admin'
};

export const feedbackCategoryLabels: Record<FeedbackCategory, string> = {
  [FeedbackCategory.SUGGESTION]: 'Suggestion',
  [FeedbackCategory.PROBLEM]: 'Problem',
  [FeedbackCategory.QUESTION]: 'Question'
};

export const webhookTriggerLabels: Record<WebhookTrigger, string> = {
  [WebhookTrigger.CONTACT_CREATED]: 'Contact created',
  [WebhookTrigger.CONTACT_UPDATED]: 'Contact updated',
  [WebhookTrigger.CONTACT_DELETED]: 'Contact deleted'
};

export const identityProviderLabels: Record<Provider, string> = {
  [Provider.Credentials]: 'Credentials',
  [Provider.TotpCode]: 'TOTP code',
  [Provider.RecoveryCode]: 'Recovery code',
  [Provider.Google]: 'Google',
  [Provider.MicrosoftEntraId]: 'Microsoft'
};

export const authErrorLabels: Record<AuthErrorCode, string> = {
  [AuthErrorCode.NewEmailConflict]: 'El correo electrónico ya existe.',
  [AuthErrorCode.UnverifiedEmail]: 'El correo electrónico no está verificado.',
  [AuthErrorCode.IncorrectEmailOrPassword]: 'El correo electrónico o la contraseña no son correctos.',
  [AuthErrorCode.TotpCodeRequired]: 'Se requiere el código TOTP.',
  [AuthErrorCode.IncorrectTotpCode]: 'El código TOTP no es correcto.',
  [AuthErrorCode.MissingRecoveryCodes]: 'Faltan códigos de recuperación.',
  [AuthErrorCode.IncorrectRecoveryCode]: 'El código de recuperación no es correcto.',
  [AuthErrorCode.RequestExpired]: 'La solicitud ha expirado.',
  [AuthErrorCode.RateLimitExceeded]: 'Se ha excedido el límite de intentos.',
  [AuthErrorCode.IllegalOAuthProvider]: 'Proveedor OAuth no válido.',
  [AuthErrorCode.InternalServerError]:
    'Algo salió mal. Por favor, inténtalo de nuevo más tarde.',
  [AuthErrorCode.MissingOAuthEmail]: 'Falta el correo electrónico de OAuth.',
  [AuthErrorCode.AlreadyLinked]: 'La cuenta OAuth ya ha sido vinculada.',
  [AuthErrorCode.RequiresExplicitLinking]:
    'Por favor, inicia sesión primero para vincular esta cuenta',
  [AuthErrorCode.UnknownError]: 'Error desconocido.'
};
