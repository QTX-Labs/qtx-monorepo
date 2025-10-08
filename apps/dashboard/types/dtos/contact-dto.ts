import {
  type ContactRecord,
  type ContactStage,
  type ContactType
} from '@workspace/database';

import type { TagDto } from '~/types/dtos/tag-dto';

export type ContactDto = {
  id: string;
  record: ContactRecord;
  type?: ContactType;
  image?: string;
  name: string;
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  fiscalAddress?: string;
  fiscalPostalCode?: string;
  rfc?: string;
  businessActivity?: string;
  taxRegime?: string;
  stage: ContactStage;
  createdAt: Date;
  tags: TagDto[];
};
