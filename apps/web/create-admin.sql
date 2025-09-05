-- Create Admin User

-- Step 1: Create new admin user
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
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5w6i', -- 'admin123' hashed
  'superadmin', 
  true, 
  true, 
  NOW()
);

-- Step 2: Verify the user was created
SELECT id, email, role, "adminRole", "isActive", "emailVerified" 
FROM "User" 
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Step 3: Check all admin users
SELECT email, role, "adminRole", "isActive" 
FROM "User" 
WHERE role = 'admin';
