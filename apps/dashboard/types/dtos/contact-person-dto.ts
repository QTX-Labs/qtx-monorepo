export type ContactPersonDto = {
  id: string;
  contactId: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
};
