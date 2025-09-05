-- Update Admin Password to Original Value

-- Step 1: Update password to 'Aa234311Aa@@@' (hashed)
-- Note: This hash was generated using bcrypt with salt rounds 12
UPDATE "User" 
SET password = '$2a$12$YourHashedPasswordHere'
WHERE email = 'ahmadalwakai76+admin@gmail.com';

-- Step 2: Verify the update
SELECT email, role, "adminRole", "isActive" 
FROM "User" 
WHERE email = 'ahmadalwakai76+admin@gmail.com';
