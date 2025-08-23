import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { withApiHandler, requireRole, httpJson } from '@/lib/api/guard';
import { parseJson, parseQueryParams } from '@/lib/validation/helpers';
import { adminUserCreate, paginationQuery, searchQuery } from '@/lib/validation/schemas';

// GET /api/admin/users - Get all admin users
export const GET = withApiHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, "admin");
  if (auth) return auth;

  const queryParams = parseQueryParams(request.url, paginationQuery.merge(searchQuery));
  if (!queryParams.ok) return queryParams.error;

  const { page, limit, search } = queryParams.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { role: 'admin' };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { adminRole: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        adminRole: true,
        isActive: true,
        lastLogin: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where })
  ]);

  return httpJson(200, { 
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// POST /api/admin/users - Create new admin user
export const POST = withApiHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, "admin");
  if (auth) return auth;

  const parsed = await parseJson(request, adminUserCreate);
  if (!parsed.ok) return parsed.error;

  const { name, email, password, adminRole, isActive } = parsed.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return httpJson(409, { error: 'User with this email already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      adminRole,
      isActive,
      twoFactorEnabled: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      adminRole: true,
      isActive: true,
      lastLogin: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  return httpJson(201, newUser);
});
