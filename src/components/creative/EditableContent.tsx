import type { CreativeContent, WorkflowType } from '@/types/creative';
import {
  isCampaignContent,
  isMessagingContent,
  isOpportunityContent,
  isPersonaContent,
} from '@/types/creative';

export type { WorkflowType } from '@/types/creative';

import { EditableCampaignContent } from './EditableCampaignContent';
import { EditableMessagingContent } from './EditableMessagingContent';
import { EditableOpportunityContent } from './EditableOpportunityContent';
import { EditablePersonaContent } from './EditablePersonaContent';

interface Props {
  type: WorkflowType;
  content: CreativeContent;
  onFieldSave: (updated: CreativeContent) => void;
}

export function EditableContent({ type, content, onFieldSave }: Props) {
  if (type === 'persona' && isPersonaContent(content)) {
    return <EditablePersonaContent content={content} onFieldSave={onFieldSave} />;
  }
  if (type === 'campaign' && isCampaignContent(content)) {
    return <EditableCampaignContent content={content} onFieldSave={onFieldSave} />;
  }
  if (type === 'messaging' && isMessagingContent(content)) {
    return <EditableMessagingContent content={content} onFieldSave={onFieldSave} />;
  }
  if (isOpportunityContent(content)) {
    return <EditableOpportunityContent content={content} onFieldSave={onFieldSave} />;
  }
  return null;
}
