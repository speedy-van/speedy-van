-- Fix Admin User - Step by Step

-- Step 1: Check current user status
SELECT id, email, role, "adminRole", "isActive", "emailVerified" 
FROM "User" 
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Step 2: Update user to be admin (if exists)
UPDATE "User" 
SET 
  role = 'admin',
  "adminRole" = 'superadmin',
  "isActive" = true,
  "emailVerified" = true
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Step 3: Set password to 'admin123' (hashed)
UPDATE "User" 
SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5w6i'
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Step 4: Verify the changes
SELECT id, email, role, "adminRole", "isActive", "emailVerified" 
FROM "User" 
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Step 5: Check all admin users
SELECT email, role, "adminRole", "isActive" 
FROM "User" 
WHERE role = 'admin';
