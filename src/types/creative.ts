export interface PersonaTopInterest {
  genreName: string;
  interestLevel: number;
}

export interface PersonaContent {
  name: string;
  demographicSummary: string;
  topInterests: PersonaTopInterest[];
  lifestyleDescription: string;
  howToReachThem: string;
}

export interface CampaignConcept {
  name: string | null;
  tagline: string | null;
  description: string | null;
  targetGenres: string[];
  suggestedFormat: string | null;
}

export interface CampaignContent {
  concepts: CampaignConcept[];
}

export interface MessagingAngle {
  name: string | null;
  tone: string | null;
  sampleHeadline: string | null;
  emotionalHook: string | null;
  keyTrait: string | null;
}

export interface MessagingContent {
  angles: MessagingAngle[];
}

export interface OpportunityItem {
  gapGenre: string | null;
  audienceTrait: string | null;
  crossoverConcept: string | null;
  reasoning: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface OpportunityContent {
  opportunities: OpportunityItem[];
}

export type CreativeContent =
  | PersonaContent
  | CampaignContent
  | MessagingContent
  | OpportunityContent;

export type WorkflowType = 'persona' | 'campaign' | 'messaging' | 'opportunity';

export function isPersonaContent(content: unknown): content is PersonaContent {
  return content !== null && typeof content === 'object' && 'name' in content && 'demographicSummary' in content;
}

export function isCampaignContent(content: unknown): content is CampaignContent {
  return content !== null && typeof content === 'object' && 'concepts' in content;
}

export function isMessagingContent(content: unknown): content is MessagingContent {
  return content !== null && typeof content === 'object' && 'angles' in content;
}

export function isOpportunityContent(content: unknown): content is OpportunityContent {
  return content !== null && typeof content === 'object' && 'opportunities' in content;
}
