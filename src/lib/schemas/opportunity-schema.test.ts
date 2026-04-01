import { opportunitySchema } from './opportunity-schema';

describe('opportunitySchema', () => {
  it('validates a full valid opportunity object', () => {
    const input = {
      opportunities: [
        {
          gapGenre: 'Classical',
          audienceTrait: 'High household income',
          crossoverConcept: 'Exclusive classical listening experiences paired with luxury brand messaging',
          reasoning: 'High income audiences often seek premium cultural experiences even when classical shows low baseline interest',
          confidence: 'high',
        },
      ],
    };

    const result = opportunitySchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates confidence values: high, medium, low', () => {
    for (const confidence of ['high', 'medium', 'low'] as const) {
      const input = {
        opportunities: [
          {
            gapGenre: 'Jazz',
            audienceTrait: 'Urban',
            crossoverConcept: 'A concept',
            reasoning: 'A reason',
            confidence,
          },
        ],
      };
      expect(opportunitySchema.safeParse(input).success).toBe(true);
    }
  });

  it('rejects invalid confidence values', () => {
    const input = {
      opportunities: [
        {
          gapGenre: 'Jazz',
          audienceTrait: 'Urban',
          crossoverConcept: 'A concept',
          reasoning: 'A reason',
          confidence: 'excellent',
        },
      ],
    };
    expect(opportunitySchema.safeParse(input).success).toBe(false);
  });

  it('allows nullable fields', () => {
    const input = {
      opportunities: [
        {
          gapGenre: null,
          audienceTrait: null,
          crossoverConcept: null,
          reasoning: null,
          confidence: 'low',
        },
      ],
    };
    expect(opportunitySchema.safeParse(input).success).toBe(true);
  });

  it('validates empty opportunities array', () => {
    const input = { opportunities: [] };
    expect(opportunitySchema.safeParse(input).success).toBe(true);
  });

  it('rejects missing opportunities key', () => {
    const input = {};
    expect(opportunitySchema.safeParse(input).success).toBe(false);
  });
});
