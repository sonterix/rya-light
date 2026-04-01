import { messagingSchema } from './messaging-schema';

describe('messagingSchema', () => {
  it('validates a valid messaging output with 3 angles', () => {
    const result = messagingSchema.safeParse({
      angles: [
        {
          name: 'The Empowerment Play',
          tone: 'warm and encouraging',
          sampleHeadline: 'You deserve music that gets you',
          emotionalHook: 'Desire for self-expression and belonging',
          keyTrait: 'Pop: 87% highly interested',
        },
        {
          name: 'The Authenticity Angle',
          tone: 'bold and direct',
          sampleHeadline: 'Real music for real people',
          emotionalHook: 'Distrust of mainstream marketing',
          keyTrait: 'Indie: avg interest 4.5',
        },
        {
          name: 'The Community Connector',
          tone: 'inclusive and warm',
          sampleHeadline: 'Find your people through sound',
          emotionalHook: 'Need for social belonging',
          keyTrait: 'Hip-Hop: 72% highly interested',
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('accepts null for nullable fields', () => {
    const result = messagingSchema.safeParse({
      angles: [
        {
          name: null,
          tone: null,
          sampleHeadline: null,
          emotionalHook: null,
          keyTrait: null,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing angles array', () => {
    const result = messagingSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects angle missing required fields', () => {
    const result = messagingSchema.safeParse({
      angles: [{ name: 'Test' }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects angles that is not an array', () => {
    const result = messagingSchema.safeParse({
      angles: 'not an array',
    });

    expect(result.success).toBe(false);
  });

  it('exports MessagingAngleSchema and MessagingSchema types', () => {
    const angle = messagingSchema.shape.angles.element;
    expect(angle).toBeDefined();
  });
});
