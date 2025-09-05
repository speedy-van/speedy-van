// Global test setup
const { jest: jestGlobal } = require('@jest/globals');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Mock console methods in tests to reduce noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jestGlobal.fn();
  console.warn = jestGlobal.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Mock user context for testing
  mockUserContext: (role = 'customer', permissions = []) => ({
    userId: 'test-user-id',
    role,
    sessionId: 'test-session-id',
    permissions,
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  }),

  // Mock JWT token
  mockJwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJyb2xlIjoiY3VzdG9tZXIiLCJzZXNzaW9uSWQiOiJ0ZXN0LXNlc3Npb24taWQiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTYzOTU4NzYwMCwiZXhwIjoxNjM5Njc0MDAwfQ.test-signature',

  // Mock Prisma client
  mockPrismaClient: {
    user: {
      findUnique: jestGlobal.fn(),
      findMany: jestGlobal.fn(),
      create: jestGlobal.fn(),
      update: jestGlobal.fn(),
      delete: jestGlobal.fn(),
    },
    booking: {
      findUnique: jestGlobal.fn(),
      findMany: jestGlobal.fn(),
      create: jestGlobal.fn(),
      update: jestGlobal.fn(),
      delete: jestGlobal.fn(),
    },
    driver: {
      findUnique: jestGlobal.fn(),
      findMany: jestGlobal.fn(),
      create: jestGlobal.fn(),
      update: jestGlobal.fn(),
      delete: jestGlobal.fn(),
    },
    $connect: jestGlobal.fn(),
    $disconnect: jestGlobal.fn(),
    $transaction: jestGlobal.fn(),
  },

  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create mock request/response objects
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),

  mockResponse: () => {
    const res = {};
    res.status = jestGlobal.fn().mockReturnValue(res);
    res.json = jestGlobal.fn().mockReturnValue(res);
    res.send = jestGlobal.fn().mockReturnValue(res);
    res.cookie = jestGlobal.fn().mockReturnValue(res);
    res.clearCookie = jestGlobal.fn().mockReturnValue(res);
    return res;
  },
};

// Mock fetch for API testing
global.fetch = jestGlobal.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jestGlobal.fn(),
  setItem: jestGlobal.fn(),
  removeItem: jestGlobal.fn(),
  clear: jestGlobal.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jestGlobal.fn(),
  setItem: jestGlobal.fn(),
  removeItem: jestGlobal.fn(),
  clear: jestGlobal.fn(),
};
global.sessionStorage = sessionStorageMock;

// Increase timeout for integration tests
jestGlobal.setTimeout(30000);

