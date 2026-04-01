'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useRespondentDetail } from '@/hooks/use-respondents';
import type { GenreInterest, RespondentDetail } from '@/types/respondent';

interface Props {
  respondentId: number;
}

interface DetailFieldProps {
  label: string;
  value: string | number;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

interface DetailGroupProps {
  title: string;
  fields: DetailFieldProps[];
}

function DetailGroup({ title, fields }: DetailGroupProps) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {fields.map((field) => (
          <DetailField key={field.label} label={field.label} value={field.value} />
        ))}
      </dl>
    </div>
  );
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

function GenreInterestList({ interests }: { interests: GenreInterest[] }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Genre Interests
      </h4>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {interests.map((interest) => (
          <li key={interest.genreSlug} className="flex items-center justify-between">
            <span className="text-sm">{interest.genreName}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {interest.interestLevel}/5
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailPanelSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
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
