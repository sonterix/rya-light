import type { GenreInterest } from '@/types/respondent';

export interface Props {
  interests: GenreInterest[];
}

export function GenreInterestList({ interests }: Props) {
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
