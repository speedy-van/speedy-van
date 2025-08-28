import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RoleBasedRedirectWrapper from '../RoleBasedRedirectWrapper';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the hook
jest.mock('@/hooks/useRoleBasedRedirect', () => ({
  useRoleBasedRedirect: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('RoleBasedRedirectWrapper', () => {
  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
  };

  beforeEach(() => {
    mockUseRouter.mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('renders children without crashing', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <RoleBasedRedirectWrapper>
        <div data-testid="test-child">Test Child</div>
      </RoleBasedRedirectWrapper>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('calls useRoleBasedRedirect hook', () => {
    const mockUseRoleBasedRedirect = require('@/hooks/useRoleBasedRedirect').useRoleBasedRedirect;
    
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <RoleBasedRedirectWrapper>
        <div>Test</div>
      </RoleBasedRedirectWrapper>
    );

    expect(mockUseRoleBasedRedirect).toHaveBeenCalled();
  });
});
