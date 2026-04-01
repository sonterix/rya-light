export interface PersonaContent {
  name: string;
  tagline: string;
  overview?: string;
}

export interface CampaignContent {
  campaign_name: string;
  objective?: string;
  core_message?: string;
}

export interface MessagingContent {
  primary_message: string;
  value_propositions?: string[];
}

export interface OpportunityContent {
  headline: string;
  summary?: string;
}
