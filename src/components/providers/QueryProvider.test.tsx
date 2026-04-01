import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { QueryProvider } from './QueryProvider';

function QueryClientConsumer() {
  const client = useQueryClient();
  const staleTime = client.getDefaultOptions().queries?.staleTime;
  return <div data-testid="stale-time">{String(staleTime)}</div>;
}

describe('QueryProvider', () => {
  it('renders children', () => {
    render(
      <QueryProvider>
        <span>content</span>
      </QueryProvider>
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('provides a query client with configured stale time', () => {
    render(
      <QueryProvider>
        <QueryClientConsumer />
      </QueryProvider>
    );
    expect(screen.getByTestId('stale-time')).toHaveTextContent('60000');
  });
});
