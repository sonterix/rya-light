'use client';

import { useRespondentDetail } from '@/hooks/use-respondents';
import type { RespondentDetail } from '@/types/respondent';

import { DetailGroup } from './DetailGroup';
import { DetailPanelSkeleton } from './DetailPanelSkeleton';
import { GenreInterestList } from './GenreInterestList';

interface Props {
  respondentId: number;
}

function buildDetailGroups(respondent: RespondentDetail) {
  return [
    {
      title: 'Demographic Details',
      fields: [
        { label: 'Ethnicity', value: respondent.ethnicity },
        { label: 'Marital Status', value: respondent.maritalStatus },
        { label: 'Parent Status', value: respondent.parentStatus },
        { label: 'Political Affiliation', value: respondent.politicalAffiliation },
      ],
    },
    {
      title: 'Geographic Details',
      fields: [
        { label: 'Community Type', value: respondent.communityType },
        { label: 'DMA', value: respondent.dma },
        { label: 'Zip Code', value: respondent.zipCode },
      ],
    },
    {
      title: 'Household Details',
      fields: [
        { label: 'Household Size', value: respondent.householdSize },
        { label: 'Home Ownership', value: respondent.homeOwnership },
      ],
    },
    {
      title: 'Socioeconomic Details',
      fields: [
        { label: 'Education', value: respondent.education },
        { label: 'Employment Status', value: respondent.employmentStatus },
        {
          label: 'Investable Assets',
          value: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          }).format(respondent.investableAssetsUsd),
        },
      ],
    },
    {
      title: 'Survey Metadata',
      fields: [
        { label: 'Wave', value: respondent.wave },
        { label: 'Wave ID', value: respondent.waveId },
        { label: 'Weight', value: respondent.weight },
      ],
    },
  ];
}

export function RespondentDetailPanel({ respondentId }: Props) {
  const { data, isLoading, isError } = useRespondentDetail(respondentId);

  if (isLoading) {
    return <DetailPanelSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="p-4 text-sm text-destructive">
        Failed to load respondent details.
      </div>
    );
  }

  const { respondent, genreInterests } = data.data;
  const detailGroups = buildDetailGroups(respondent);

  return (
    <div className="space-y-6 bg-muted p-6">
      {detailGroups.map((group) => (
        <DetailGroup key={group.title} title={group.title} fields={group.fields} />
      ))}
      {genreInterests.length > 0 && <GenreInterestList interests={genreInterests} />}
    </div>
  );
}
