import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { RespondentPagination } from './RespondentPagination';

describe('RespondentPagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<RespondentPagination currentPage={1} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders page buttons for each page', () => {
    render(<RespondentPagination currentPage={1} totalPages={3} />);

    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '3' })).toBeInTheDocument();
  });

  it('links to correct page URLs', () => {
    render(<RespondentPagination currentPage={1} totalPages={3} />);

    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute(
      'href',
      '/respondents?page=1',
    );
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'href',
      '/respondents?page=2',
    );
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'href',
      '/respondents?page=3',
    );
  });

  it('marks the current page with aria-current', () => {
    render(<RespondentPagination currentPage={2} totalPages={3} />);

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: '3' })).not.toHaveAttribute('aria-current');
  });

  it('renders nav with accessible label', () => {
    render(<RespondentPagination currentPage={1} totalPages={3} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });
});
