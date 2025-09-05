import { render, screen } from '@testing-library/react';
import CustomerOrdersPage from '../page';

// Mock the auth and database dependencies
jest.mock('@/lib/auth', () => ({
  requireRole: jest.fn(() => ({
    user: {
      id: 'test-customer-id',
      email: 'test@customer.com',
      name: 'Test Customer',
      role: 'customer',
    },
  })),
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    Booking: {
      findMany: jest.fn(() => [
        {
          id: '1',
          reference: 'SV001',
          status: 'CONFIRMED',
          pickupAddress: '123 Main St, London',
          dropoffAddress: '456 High St, Manchester',
          scheduledAt: new Date('2024-01-15'),
          timeSlot: 'am',
          crewSize: 2,
          vanSize: 'luton',
          totalGBP: 15000,
          createdAt: new Date('2024-01-10'),
        },
        {
          id: '2',
          reference: 'SV002',
          status: 'COMPLETED',
          pickupAddress: '789 Park Lane, Birmingham',
          dropoffAddress: '321 Queen St, Bristol',
          scheduledAt: new Date('2024-01-10'),
          timeSlot: 'pm',
          crewSize: 3,
          vanSize: 'large',
          totalGBP: 25000,
          createdAt: new Date('2024-01-05'),
        },
      ]),
    },
  })),
}));

describe('CustomerOrdersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the orders page with correct title', async () => {
    render(await CustomerOrdersPage());

    expect(screen.getByText('My Orders')).toBeInTheDocument();
    expect(
      screen.getByText('View and manage all your bookings')
    ).toBeInTheDocument();
  });

  it('displays order statistics', async () => {
    render(await CustomerOrdersPage());

    expect(screen.getByText('Current & Upcoming')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
  });

  it('shows order details in table', async () => {
    render(await CustomerOrdersPage());

    expect(screen.getByText('SV001')).toBeInTheDocument();
    expect(screen.getByText('SV002')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, London')).toBeInTheDocument();
    expect(screen.getByText('456 High St, Manchester')).toBeInTheDocument();
  });

  it('displays correct status badges', async () => {
    render(await CustomerOrdersPage());

    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('shows action buttons for orders', async () => {
    render(await CustomerOrdersPage());

    expect(screen.getAllByText('View')).toHaveLength(2);
    expect(screen.getByText('Track')).toBeInTheDocument();
  });
});
