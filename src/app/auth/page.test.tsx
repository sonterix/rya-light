import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
  }),
}));

async function renderAuthPage() {
  const { default: AuthPage } = await import('./page');
  render(<AuthPage />);
}

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders Sign In and Sign Up tabs', async () => {
      await renderAuthPage();

      expect(screen.getByRole('tab', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('shows Sign In form by default', async () => {
      await renderAuthPage();

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });
  });

  describe('Sign In form', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup();
      await renderAuthPage();

      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Email is required');
    });

    it('shows error when email format is invalid', async () => {
      const user = userEvent.setup();
      await renderAuthPage();

      await user.type(screen.getByLabelText('Email'), 'notanemail');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email format');
    });

    it('shows error when password is empty', async () => {
      const user = userEvent.setup();
      await renderAuthPage();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Password is required');
    });

    it('redirects to /dashboard on successful sign in', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });
      const user = userEvent.setup();
      await renderAuthPage();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows inline error on auth failure', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid email or password' },
      });
      const user = userEvent.setup();
      await renderAuthPage();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    });

    it('disables submit button while loading', async () => {
      let resolveSignIn: (value: { error: null }) => void = () => {};
      mockSignInWithPassword.mockReturnValue(
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
      );
      const user = userEvent.setup();
      await renderAuthPage();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();

      resolveSignIn({ error: null });
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Sign Up form', () => {
    async function switchToSignUp(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));
    }

    it('shows Sign Up form when Sign Up tab is clicked', async () => {
      const user = userEvent.setup();
      await renderAuthPage();

      await switchToSignUp(user);

      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('shows error when email is empty', async () => {
      const user = userEvent.setup();
      await renderAuthPage();

      await switchToSignUp(user);
      await user.click(screen.getByRole('button', { name: 'Sign Up' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Email is required');
    });

    it('shows error when email format is invalid', async () => {
      const user = userEvent.setup();
      await renderAuthPage();

      await switchToSignUp(user);

      const emailInputs = screen.getAllByLabelText('Email');
      const signUpEmailInput = emailInputs[emailInputs.length - 1];
      await user.type(signUpEmailInput, 'notanemail');
      await user.click(screen.getByRole('button', { name: 'Sign Up' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email format');
    });

    it('shows error when password is shorter than 6 characters', async () => {
      const user = userEvent.setup();
      await renderAuthPage();

      await switchToSignUp(user);

      const emailInputs = screen.getAllByLabelText('Email');
      const passwordInputs = screen.getAllByLabelText('Password');
      const signUpEmailInput = emailInputs[emailInputs.length - 1];
      const signUpPasswordInput = passwordInputs[passwordInputs.length - 1];

      await user.type(signUpEmailInput, 'test@example.com');
      await user.type(signUpPasswordInput, 'abc');
      await user.click(screen.getByRole('button', { name: 'Sign Up' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Password must be at least 6 characters'
      );
    });

    it('redirects to /dashboard on successful sign up', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      const user = userEvent.setup();
      await renderAuthPage();

      await switchToSignUp(user);

      const emailInputs = screen.getAllByLabelText('Email');
      const passwordInputs = screen.getAllByLabelText('Password');
      const signUpEmailInput = emailInputs[emailInputs.length - 1];
      const signUpPasswordInput = passwordInputs[passwordInputs.length - 1];

      await user.type(signUpEmailInput, 'newuser@example.com');
      await user.type(signUpPasswordInput, 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign Up' }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows inline error when email already registered', async () => {
      mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } });
      const user = userEvent.setup();
      await renderAuthPage();

      await switchToSignUp(user);

      const emailInputs = screen.getAllByLabelText('Email');
      const passwordInputs = screen.getAllByLabelText('Password');
      const signUpEmailInput = emailInputs[emailInputs.length - 1];
      const signUpPasswordInput = passwordInputs[passwordInputs.length - 1];

      await user.type(signUpEmailInput, 'existing@example.com');
      await user.type(signUpPasswordInput, 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign Up' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('User already registered');
    });

    it('disables submit button while loading', async () => {
      let resolveSignUp: (value: { error: null }) => void = () => {};
      mockSignUp.mockReturnValue(
        new Promise((resolve) => {
          resolveSignUp = resolve;
        })
      );
      const user = userEvent.setup();
      await renderAuthPage();

      await switchToSignUp(user);

      const emailInputs = screen.getAllByLabelText('Email');
      const passwordInputs = screen.getAllByLabelText('Password');
      const signUpEmailInput = emailInputs[emailInputs.length - 1];
      const signUpPasswordInput = passwordInputs[passwordInputs.length - 1];

      await user.type(signUpEmailInput, 'test@example.com');
      await user.type(signUpPasswordInput, 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign Up' }));

      expect(screen.getByRole('button', { name: 'Signing up...' })).toBeDisabled();

      resolveSignUp({ error: null });
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
