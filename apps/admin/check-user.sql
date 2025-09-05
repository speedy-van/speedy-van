-- Check if user exists
SELECT id, email, role, "adminRole", "isActive", "emailVerified" 
FROM "User" 
WHERE email = 'ahmadalwakai76+admin@gmail.com';
