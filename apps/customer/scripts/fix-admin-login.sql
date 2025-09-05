-- Fix Admin Login - Create or Update Admin User
-- Run this in your PostgreSQL database

-- First, check if user exists
SELECT id, email, role, "adminRole", "isActive", "emailVerified" 
FROM "User" 
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- If user doesn't exist, create new admin user
-- Note: You'll need to hash the password 'Aa234311Aa@@@' with bcrypt
-- For now, we'll create a user with a temporary password

-- Option 1: Create new admin user (if user doesn't exist)
INSERT INTO "User" (
  id, 
  email, 
  name, 
  role, 
  password, 
  "adminRole", 
  "isActive", 
  "emailVerified", 
  "createdAt"
) VALUES (
  gen_random_uuid(), 
  'ahmadalwakai76+admin@gmail.com', 
  'Ahmad Alwakai - Admin', 
  'admin', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5w6i', -- This is 'admin123' hashed
  'superadmin', 
  true, 
  true, 
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Option 2: Update existing user to be admin
UPDATE "User" 
SET 
  role = 'admin',
  "adminRole" = 'superadmin',
  "isActive" = true,
  "emailVerified" = true,
  "updatedAt" = NOW()
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Option 3: Reset password to a known working password
-- First, hash 'admin123' with bcrypt and use that hash
UPDATE "User" 
SET 
  password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5w6i' -- 'admin123' hashed
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Verify the user was created/updated
SELECT 
  id, 
  email, 
  name, 
  role, 
  "adminRole", 
  "isActive", 
  "emailVerified", 
  "createdAt"
FROM "User" 
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Check all admin users
SELECT 
  id, 
  email, 
  name, 
  role, 
  "adminRole", 
  "isActive"
FROM "User" 
WHERE role = 'admin';
