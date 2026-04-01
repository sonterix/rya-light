export interface RespondentSummary {
  respondentId: number;
  audienceCategory: string;
  age: number;
  gender: string;
  region: string;
  state: string;
  householdIncomeUsd: number;
}

export interface RespondentDetail {
  respondentId: number;
  wave: number;
  waveId: number;
  weight: string;
  audienceCategory: string;
  age: number;
  gender: string;
  ethnicity: string;
  region: string;
  communityType: string;
  maritalStatus: string;
  householdSize: number;
  education: string;
  employmentStatus: string;
  householdIncomeUsd: number;
  investableAssetsUsd: number;
  zipCode: string;
  state: string;
  dma: string;
  parentStatus: string;
  politicalAffiliation: string;
  homeOwnership: string;
}

export interface GenreInterest {
  genreSlug: string;
  genreName: string;
  interestLevel: number;
}

export interface RespondentListResponse {
  data: {
    respondents: RespondentSummary[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface RespondentDetailResponse {
  data: {
    respondent: RespondentDetail;
    genreInterests: GenreInterest[];
  };
}
