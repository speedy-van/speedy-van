import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestDriver() {
  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: 'driver@test.com' },
      include: { driver: true },
    });

    if (!user) {
      // Create a test user with driver role
      const hashedPassword = await bcrypt.hash('password123', 12);

      user = await prisma.user.create({
        data: {
          email: 'driver@test.com',
          name: 'Test Driver',
          role: 'driver',
          password: hashedPassword,
        },
        include: { driver: true },
      });

      console.log('✅ Test driver user created:', user.email);
    } else {
      console.log('✅ Test driver user already exists:', user.email);
    }

    // Create or update driver record
    if (!user.driver) {
      const driver = await prisma.driver.create({
        data: {
          userId: user.id,
          onboardingStatus: 'applied',
          basePostcode: 'SW1A 1AA',
          vehicleType: 'medium_van',
        },
      });

      console.log('✅ Test driver record created:', driver.id);
    } else {
      console.log('✅ Test driver record already exists:', user.driver.id);
    }

    console.log('\n🎉 Test driver account ready!');
    console.log('Email: driver@test.com');
    console.log('Password: password123');
    console.log('Login URL: http://localhost:3000/driver/login');
  } catch (error) {
    console.error('❌ Error creating test driver:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDriver();
