-- Update Admin Password to Original Value

-- Step 1: Update password to 'Aa234311Aa@@@' (hashed)
UPDATE "User" 
SET password = '$2b$12$ub9xwBr8BaL4lH0pdTmIB.X2B779liS6wkmpnpPTrirq8tWWz76sG'
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Step 2: Verify the update
SELECT email, role, "adminRole", "isActive" 
FROM "User" 
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Step 3: Test login credentials
-- Email: ahmadalwakai76+admin@gmail.com
-- Password: Aa234311Aa@@@
