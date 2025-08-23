import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthModal from '../auth/AuthModal';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Sign-in Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('should redirect customers to customer portal after sign-in', async () => {
    // Mock successful sign-in
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
    
    // Mock user data response
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        user: { id: '1', email: 'customer@test.com', role: 'customer' }
      })
    });

    render(<AuthModal isOpen={true} onClose={() => {}} />);

    // Fill in sign-in form
    const emailInput = screen.getByTestId('signin-email');
    const passwordInput = screen.getByTestId('signin-password');
    const submitButton = screen.getByText('Continue');

    fireEvent.change(emailInput, { target: { value: 'customer@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'customer@test.com',
        password: 'password123',
        redirect: false,
        callbackUrl: '/',
      });
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/customer-portal');
    });
  });

  it('should redirect drivers to driver dashboard after sign-in', async () => {
    // Mock successful sign-in
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
    
    // Mock user data response
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        user: { id: '2', email: 'driver@test.com', role: 'driver' }
      })
    });

    render(<AuthModal isOpen={true} onClose={() => {}} />);

    // Fill in sign-in form
    const emailInput = screen.getByTestId('signin-email');
    const passwordInput = screen.getByTestId('signin-password');
    const submitButton = screen.getByText('Continue');

    fireEvent.change(emailInput, { target: { value: 'driver@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/driver/dashboard');
    });
  });

  it('should redirect admins to admin dashboard after sign-in', async () => {
    // Mock successful sign-in
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
    
    // Mock user data response
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        user: { id: '3', email: 'admin@test.com', role: 'admin' }
      })
    });

    render(<AuthModal isOpen={true} onClose={() => {}} />);

    // Fill in sign-in form
    const emailInput = screen.getByTestId('signin-email');
    const passwordInput = screen.getByTestId('signin-password');
    const submitButton = screen.getByText('Continue');

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/admin');
    });
  });

  it('should show error message for invalid credentials', async () => {
    // Mock failed sign-in
    (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });

    render(<AuthModal isOpen={true} onClose={() => {}} />);

    // Fill in sign-in form
    const emailInput = screen.getByTestId('signin-email');
    const passwordInput = screen.getByTestId('signin-password');
    const submitButton = screen.getByText('Continue');

    fireEvent.change(emailInput, { target: { value: 'invalid@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
  });

  it('should handle returnTo parameter correctly', async () => {
    // Mock successful sign-in
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
    
    // Mock user data response
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        user: { id: '1', email: 'customer@test.com', role: 'customer' }
      })
    });

    // Mock search params with returnTo
    const mockSearchParams = new URLSearchParams('?returnTo=/customer-portal/orders/123');
    jest.doMock('next/navigation', () => ({
      useRouter: jest.fn(() => mockRouter),
      useSearchParams: jest.fn(() => mockSearchParams),
    }));

    render(<AuthModal isOpen={true} onClose={() => {}} />);

    // Fill in sign-in form
    const emailInput = screen.getByTestId('signin-email');
    const passwordInput = screen.getByTestId('signin-password');
    const submitButton = screen.getByText('Continue');

    fireEvent.change(emailInput, { target: { value: 'customer@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'customer@test.com',
        password: 'password123',
        redirect: false,
        callbackUrl: '/customer-portal/orders/123',
      });
    });
  });
});
