import { useAudienceStore } from './audience-store';

describe('useAudienceStore', () => {
  beforeEach(() => {
    useAudienceStore.setState({ selectedAudienceId: null });
  });

  it('starts with null selected audience', () => {
    const state = useAudienceStore.getState();
    expect(state.selectedAudienceId).toBeNull();
  });

  it('sets selected audience id', () => {
    const { setSelectedAudienceId } = useAudienceStore.getState();
    setSelectedAudienceId('audience-123');
    expect(useAudienceStore.getState().selectedAudienceId).toBe('audience-123');
  });

  it('clears selected audience id', () => {
    useAudienceStore.setState({ selectedAudienceId: 'audience-123' });
    const { clearSelectedAudienceId } = useAudienceStore.getState();
    clearSelectedAudienceId();
    expect(useAudienceStore.getState().selectedAudienceId).toBeNull();
  });

  it('replaces existing id when setting a new one', () => {
    useAudienceStore.setState({ selectedAudienceId: 'old-id' });
    const { setSelectedAudienceId } = useAudienceStore.getState();
    setSelectedAudienceId('new-id');
    expect(useAudienceStore.getState().selectedAudienceId).toBe('new-id');
  });
});
