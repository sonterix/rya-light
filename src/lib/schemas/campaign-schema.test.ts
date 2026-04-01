import { campaignSchema } from './campaign-schema';

describe('campaignSchema', () => {
  it('validates a valid campaign with 3 concepts', () => {
    const result = campaignSchema.safeParse({
      concepts: [
        {
          name: 'Summer Beats',
          tagline: 'Feel the rhythm',
          description: 'A summer campaign targeting pop fans. Leverages festival culture. Drives brand awareness.',
          targetGenres: ['Pop', 'Electronic'],
          suggestedFormat: 'Social campaign',
        },
        {
          name: 'Urban Pulse',
          tagline: 'Move to your city',
          description: 'Hip-hop focused urban campaign. Speaks to city dwellers. Uses local influencers.',
          targetGenres: ['Hip-Hop', 'R&B'],
          suggestedFormat: 'Video series',
        },
        {
          name: 'Indie Wave',
          tagline: 'Your sound, your story',
          description: 'Alternative and indie music campaign. Celebrates authenticity. Targets 18-30 demographic.',
          targetGenres: ['Indie', 'Alternative'],
          suggestedFormat: 'Podcast sponsorship',
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('accepts null for nullable concept fields', () => {
    const result = campaignSchema.safeParse({
      concepts: [
        {
          name: null,
          tagline: null,
          description: null,
          targetGenres: [],
          suggestedFormat: null,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing concepts array', () => {
    const result = campaignSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects concept missing required fields', () => {
    const result = campaignSchema.safeParse({
      concepts: [{ name: 'Test' }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects targetGenres that is not an array', () => {
    const result = campaignSchema.safeParse({
      concepts: [
        {
          name: 'Test',
          tagline: 'Tag',
          description: 'Desc',
          targetGenres: 'Pop',
          suggestedFormat: 'Video',
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
