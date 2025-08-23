import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import InvoicesPage from '../page';

// Mock telemetry to avoid issues
jest.mock('@/lib/telemetry', () => ({
  trackEvent: jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiDownload: () => <span>📥</span>,
  FiFileText: () => <span>📄</span>,
  FiFilter: () => <span>🔍</span>,
  FiSearch: () => <span>🔎</span>,
  FiCalendar: () => <span>📅</span>,
  FiExternalLink: () => <span>🔗</span>,
}));

const mockInvoices = [
  {
    id: '1',
    orderRef: 'SV123456',
    invoiceNumber: 'INV-123456',
    date: '2024-01-15T10:00:00Z',
    amount: 5000,
    currency: 'GBP',
    status: 'paid',
    paidAt: '2024-01-15T10:30:00Z',
    stripePaymentIntentId: 'pi_test123',
    pickupAddress: '123 Pickup St, London',
    dropoffAddress: '456 Dropoff Ave, Manchester',
    contactName: 'John Doe',
    contactEmail: 'john@example.com'
  },
  {
    id: '2',
    orderRef: 'SV789012',
    invoiceNumber: 'INV-789012',
    date: '2024-01-10T14:00:00Z',
    amount: 7500,
    currency: 'GBP',
    status: 'unpaid',
    paidAt: null,
    stripePaymentIntentId: null,
    pickupAddress: '789 Start St, Birmingham',
    dropoffAddress: '012 End Rd, Leeds',
    contactName: 'Jane Smith',
    contactEmail: 'jane@example.com'
  }
];

const mockPagination = {
  page: 1,
  limit: 20,
  total: 2,
  pages: 1
};



describe('InvoicesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure we have a clean DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  it('renders the invoices page with title and description', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: mockInvoices, pagination: mockPagination })
    });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Invoices & Payments')).toBeInTheDocument();
    expect(screen.getByText('View and download your invoices and payment history')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Invoices & Payments')).toBeInTheDocument();
  });

  it('displays invoices in a table format', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: mockInvoices, pagination: mockPagination })
    });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('INV-123456')).toBeInTheDocument();
      expect(screen.getByText('SV123456')).toBeInTheDocument();
      expect(screen.getByText('£50.00')).toBeInTheDocument();
      expect(screen.getByText('PAID')).toBeInTheDocument();
    });
  });

  it('shows empty state when no invoices exist', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: [], pagination: { ...mockPagination, total: 0 } })
    });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No invoices yet')).toBeInTheDocument();
      expect(screen.getByText("You'll see your invoices here after making your first booking.")).toBeInTheDocument();
      expect(screen.getByText('Book a Move')).toBeInTheDocument();
    });
  });

  it('filters invoices by status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: mockInvoices, pagination: mockPagination })
    });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('All Status')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(statusSelect, { target: { value: 'paid' } });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('status=paid'));
  });

  it('searches invoices by order reference or invoice number', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: mockInvoices, pagination: mockPagination })
    });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search invoices...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search invoices...');
    fireEvent.change(searchInput, { target: { value: 'SV123456' } });

    // Should filter the displayed invoices
    expect(screen.getByText('SV123456')).toBeInTheDocument();
    expect(screen.queryByText('SV789012')).not.toBeInTheDocument();
  });

  it('shows download button for paid invoices', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: mockInvoices, pagination: mockPagination })
    });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Download invoice')).toBeInTheDocument();
    });
  });

  it('shows Stripe receipt link for paid invoices with payment intent', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: mockInvoices, pagination: mockPagination })
    });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('View Stripe receipt')).toBeInTheDocument();
    });
  });

  it('shows pay now button for unpaid invoices', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: mockInvoices, pagination: mockPagination })
    });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Pay Now')).toBeInTheDocument();
    });
  });

  it('exports CSV when export button is clicked', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invoices: mockInvoices, pagination: mockPagination })
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['test csv content'])
      });

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/portal/invoices/export'));
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(
      <ChakraProvider>
        <InvoicesPage />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});
