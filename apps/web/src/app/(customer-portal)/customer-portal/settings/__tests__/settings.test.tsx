import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomerSettingsPage from '../page';

// Mock fetch
global.fetch = jest.fn();

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => jest.fn(),
  useDisclosure: () => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
  }),
}));

describe('CustomerSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings page with all sections', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        profile: {
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        security: {
          twoFactorEnabled: false,
          backupCodesGenerated: false,
        },
        notifications: {
          email: true,
          sms: true,
          push: false,
        },
        privacy: {
          dataExportRequested: false,
          accountDeletionRequested: false,
        },
      }),
    });

    render(<CustomerSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Privacy & Data')).toBeInTheDocument();
    });
  });

  it('displays user profile information', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        profile: {
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        security: {
          twoFactorEnabled: false,
          backupCodesGenerated: false,
        },
        notifications: {
          email: true,
          sms: true,
          push: false,
        },
        privacy: {
          dataExportRequested: false,
          accountDeletionRequested: false,
        },
      }),
    });

    render(<CustomerSettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  it('shows email verification status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        profile: {
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        security: {
          twoFactorEnabled: false,
          backupCodesGenerated: false,
        },
        notifications: {
          email: true,
          sms: true,
          push: false,
        },
        privacy: {
          dataExportRequested: false,
          accountDeletionRequested: false,
        },
      }),
    });

    render(<CustomerSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Email verified')).toBeInTheDocument();
    });
  });

  it('handles profile update', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
            emailVerified: true,
            createdAt: '2024-01-01T00:00:00Z',
          },
          security: {
            twoFactorEnabled: false,
            backupCodesGenerated: false,
          },
          notifications: {
            email: true,
            sms: true,
            push: false,
          },
          privacy: {
            dataExportRequested: false,
            accountDeletionRequested: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Profile updated successfully' }),
      });

    render(<CustomerSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Save Profile')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    const saveButton = screen.getByText('Save Profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/customer/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: 'Jane Doe',
            email: 'john@example.com',
          },
        }),
      });
    });
  });

  it('handles notification preferences update', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
            emailVerified: true,
            createdAt: '2024-01-01T00:00:00Z',
          },
          security: {
            twoFactorEnabled: false,
            backupCodesGenerated: false,
          },
          notifications: {
            email: true,
            sms: true,
            push: false,
          },
          privacy: {
            dataExportRequested: false,
            accountDeletionRequested: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Notification preferences updated' }),
      });

    render(<CustomerSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Save Notifications')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Notifications');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/customer/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: {
            email: true,
            sms: true,
            push: false,
          },
        }),
      });
    });
  });

  it('shows 2FA status correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        profile: {
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        security: {
          twoFactorEnabled: true,
          backupCodesGenerated: true,
        },
        notifications: {
          email: true,
          sms: true,
          push: false,
        },
        privacy: {
          dataExportRequested: false,
          accountDeletionRequested: false,
        },
      }),
    });

    render(<CustomerSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Enabled')).toBeInTheDocument();
      expect(screen.getByText('Disable 2FA')).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CustomerSettingsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CustomerSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
