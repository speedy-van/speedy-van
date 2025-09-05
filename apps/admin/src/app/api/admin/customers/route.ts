import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, requireRole, httpJson } from '@/lib/api/guard';
import { parseJson, parseQueryParams } from '@/lib/validation/helpers';
import {
  customerCreate,
  paginationQuery,
  searchQuery,
} from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, 'admin');
  if (auth) return auth;

  const queryParams = parseQueryParams(
    request.url,
    paginationQuery.merge(searchQuery)
  );
  if (!queryParams.ok) return queryParams.error;

  const { page, limit, search, role } = queryParams.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get customers with pagination
  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        isActive: true,
        emailVerified: true,
        bookings: {
          select: {
            id: true,
            reference: true,
            status: true,
            totalGBP: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        supportTickets: {
          select: {
            id: true,
            description: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        addresses: {
          select: {
            id: true,
            label: true,
            postcode: true,
          },
        },
        contacts: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Process customer data
  const processedCustomers = customers.map(customer => {
    const totalBookings = customer.bookings.length;
    const totalSpent = customer.bookings.reduce(
      (sum, booking) => sum + (booking.totalGBP || 0),
      0
    );
    const activeTickets = customer.supportTickets.filter(
      ticket => ticket.status === 'open'
    ).length;

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: customer.role,
      createdAt: customer.createdAt,
      lastLogin: customer.lastLogin,
      isActive: customer.isActive,
      emailVerified: customer.emailVerified,
      stats: {
        totalBookings,
        totalSpent,
        activeTickets,
        addressCount: customer.addresses.length,
        contactCount: customer.contacts.length,
      },
      recentBookings: customer.bookings,
      recentTickets: customer.supportTickets,
      addresses: customer.addresses,
      contacts: customer.contacts,
    };
  });

  return httpJson(200, {
    customers: processedCustomers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, 'admin');
  if (auth) return auth;

  const parsed = await parseJson(request, customerCreate);
  if (!parsed.ok) return parsed.error;

  const { name, phone, email } = parsed.data;

  // Check if email already exists
  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return httpJson(409, { error: 'Email already exists' });
    }
  }

  // Create customer
  const customer = await prisma.user.create({
    data: {
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      role: 'customer',
      password: 'temp-password', // Will be reset by customer
      emailVerified: false,
    },
  });

  return httpJson(201, customer);
});
