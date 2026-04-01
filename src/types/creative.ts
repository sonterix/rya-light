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

export interface OpportunityContent {
  headline: string;
  summary?: string;
}
