import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({});
const mockCreateClient = vi.fn(() => ({
  auth: { signOut: mockSignOut },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { SidebarProvider } from '@/components/ui/sidebar';

import { AppSidebar } from './AppSidebar';

function renderSidebar(userEmail = 'user@example.com') {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AppSidebar userEmail={userEmail} />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Respondents navigation item', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /respondents/i })).toBeInTheDocument();
  });

  it('renders Dashboard navigation item', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders Creative navigation item', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /creative/i })).toBeInTheDocument();
  });

  it('links point to correct routes', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /respondents/i })).toHaveAttribute(
      'href',
      '/respondents'
    );
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByRole('link', { name: /creative/i })).toHaveAttribute('href', '/creative');
  });

  it('displays the user email', () => {
    renderSidebar('hello@station.com');
    expect(screen.getByText('hello@station.com')).toBeInTheDocument();
  });

  it('renders a Sign Out button', () => {
    renderSidebar();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls signOut and redirects to /auth when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(mockSignOut).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });
});
