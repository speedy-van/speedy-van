import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestDriverApplication() {
  try {
    console.log('Creating test driver application...');

    // Create a test driver application
    const application = await prisma.driverApplication.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe.test@example.com',
        phone: '+447700900000',
        dateOfBirth: new Date('1990-01-01'),
        nationalInsuranceNumber: 'AB123456C',
        addressLine1: '123 Test Street',
        addressLine2: 'Test Area',
        city: 'London',
        postcode: 'SW1A 1AA',
        county: 'Greater London',
        drivingLicenseNumber: 'DOE123456789',
        drivingLicenseExpiry: new Date('2030-01-01'),
        drivingLicenseFrontImage: '/uploads/driver-applications/test-license-front.jpg',
        drivingLicenseBackImage: '/uploads/driver-applications/test-license-back.jpg',
        insuranceProvider: 'Test Insurance Co',
        insurancePolicyNumber: 'POL123456789',
        insuranceExpiry: new Date('2025-01-01'),
        insuranceDocument: '/uploads/driver-applications/test-insurance.pdf',
        bankName: 'Test Bank',
        accountHolderName: 'John Doe',
        sortCode: '12-34-56',
        accountNumber: '12345678',
        rightToWorkShareCode: 'RTW123456789',
        rightToWorkDocument: '/uploads/driver-applications/test-rtw.pdf',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+447700900001',
        emergencyContactRelationship: 'Spouse',
        agreeToTerms: true,
        agreeToDataProcessing: true,
        agreeToBackgroundCheck: true,
        status: 'pending',
        applicationDate: new Date(),
      },
    });

    console.log('Test driver application created successfully:');
    console.log('ID:', application.id);
    console.log('Email:', application.email);
    console.log('Status:', application.status);
    console.log('Application Date:', application.applicationDate);

    // Create a test user account for this application
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe.test@example.com',
        password: '$2a$12$test.hash.for.testing.purposes.only',
        role: 'driver',
        isActive: false,
      },
    });

    // Link the application to the user
    await prisma.driverApplication.update({
      where: { id: application.id },
      data: { userId: user.id },
    });

    console.log('Test user created and linked:');
    console.log('User ID:', user.id);
    console.log('User Role:', user.role);
    console.log('User Active:', user.isActive);

    console.log('\nTest driver application setup complete!');
    console.log('You can now test the admin dashboard at /admin/drivers/applications');

  } catch (error) {
    console.error('Error creating test driver application:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDriverApplication();
