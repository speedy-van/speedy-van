import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'ahmadalwakai76+admin@gmail.com' },
    });

    if (existingUser) {
      console.log('⚠️ User already exists, updating password...');

      // Hash the new password
      const hashedPassword = await bcrypt.hash('Aa234311Aa@@@', 12);

      // Update the existing user
      const updatedUser = await prisma.user.update({
        where: { email: 'ahmadalwakai76+admin@gmail.com' },
        data: {
          password: hashedPassword,
          role: 'admin',
          adminRole: 'superadmin',
          isActive: true,
          emailVerified: true,
        },
      });

      console.log('✅ User updated successfully:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        adminRole: updatedUser.adminRole,
      });
    } else {
      console.log('🆕 Creating new admin user...');

      // Hash the password
      const hashedPassword = await bcrypt.hash('Aa234311Aa@@@', 12);

      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email: 'ahmadalwakai76+admin@gmail.com',
          name: 'Ahmad Alwakai - Admin',
          password: hashedPassword,
          role: 'admin',
          adminRole: 'superadmin',
          isActive: true,
          emailVerified: true,
        },
      });

      console.log('✅ Admin user created successfully:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        adminRole: newUser.adminRole,
      });
    }

    // Test the password
    const testUser = await prisma.user.findUnique({
      where: { email: 'ahmadalwakai76+admin@gmail.com' },
    });

    if (testUser) {
      const passwordMatch = await bcrypt.compare(
        'Aa234311Aa@@@',
        testUser.password
      );
      console.log(
        '🔑 Password test result:',
        passwordMatch ? '✅ MATCH' : '❌ NO MATCH'
      );

      if (passwordMatch) {
        console.log('🎉 Admin user is ready for login!');
        console.log('📧 Email: ahmadalwakai76+admin@gmail.com');
        console.log('🔑 Password: Aa234311Aa@@@');
        console.log('🔗 Login URL: /admin/login');
      }
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
