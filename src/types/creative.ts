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

export interface MessagingContent {
  primary_message: string;
  value_propositions?: string[];
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
