import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import csrf from 'csurf';
import cors from 'cors';

// Rate limiting configuration
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: options.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: options.standardHeaders !== false, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: options.legacyHeaders !== false, // Disable the `X-RateLimit-*` headers
  });
};

// Specific rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

export const bookingRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 booking requests per windowMs
  message: 'Too many booking requests, please try again later.',
});

// CORS configuration
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://speedy-van.co.uk', 'https://www.speedy-van.co.uk']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// Helmet security configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.speedy-van.co.uk"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
};

// CSRF protection configuration
export const csrfConfig = {
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
};

// Input validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
      }
      return res.status(500).json({ error: 'Internal validation error' });
    }
  };
}

// Sanitization middleware
export function sanitizeInput(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  // Sanitize string inputs
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

// Request size limiting middleware
export function limitRequestSize(maxSize: string = '10mb') {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = parseFloat(maxSize) * (maxSize.includes('mb') ? 1024 * 1024 : 1024);
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        error: 'Request entity too large',
        maxSize: maxSize,
        receivedSize: `${(contentLength / 1024 / 1024).toFixed(2)}mb`,
      });
    }
    
    next();
  };
}

// Security headers middleware
export function addSecurityHeaders(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}

// API key validation middleware
export function validateApiKey(apiKey: string) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const providedKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!providedKey || providedKey !== apiKey) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'Please provide a valid API key in the X-API-Key header or Authorization header',
      });
    }
    
    next();
  };
}

// Request logging middleware
export function logRequests(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
    };
    
    // Log based on status code
    if (res.statusCode >= 400) {
      console.error('API Request Error:', logData);
    } else if (res.statusCode >= 300) {
      console.warn('API Request Redirect:', logData);
    } else {
      console.info('API Request Success:', logData);
    }
  });
  
  next();
}

// Error handling middleware
export function handleErrors(error: any, req: NextApiRequest, res: NextApiResponse, next: () => void) {
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: isProduction ? 'Invalid input data' : error.message,
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
  
  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Insufficient permissions',
    });
  }
  
  // Default error response
  return res.status(500).json({
    error: 'Internal server error',
    message: isProduction ? 'Something went wrong' : error.message,
  });
}

// Export middleware functions for easy use
export const securityMiddleware = {
  rateLimit: apiRateLimiter,
  cors: cors(corsOptions),
  helmet: helmet(helmetConfig),
  csrf: csrf(csrfConfig),
  sanitize: sanitizeInput,
  limitSize: limitRequestSize(),
  securityHeaders: addSecurityHeaders,
  logging: logRequests,
  errorHandler: handleErrors,
};

export default securityMiddleware;
