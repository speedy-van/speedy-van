import { faker } from '@faker-js/faker';
import { User, Role, AdminRole, Booking, Driver, Address, BookingItem } from '@prisma/client';

// Configure faker for consistent test data
faker.seed(12345);

export interface TestUserData {
  email: string;
  name: string;
  role: Role;
  adminRole?: AdminRole;
  isActive: boolean;
}

export interface TestAddressData {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface TestBookingData {
  pickupAddress: TestAddressData;
  dropoffAddress: TestAddressData;
  scheduledDate: Date;
  items: TestBookingItemData[];
  specialInstructions?: string;
  requiresTwoPerson: boolean;
  isFragile: boolean;
}

export interface TestBookingItemData {
  name: string;
  quantity: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  requiresTwoPerson: boolean;
  isFragile: boolean;
  specialHandling?: string;
}

export interface TestDriverData {
  basePostcode: string;
  vehicleType: string;
  rightToWorkType: string;
  status: string;
  onboardingStatus: string;
  rating?: number;
  strikes: number;
}

/**
 * User Factory for creating test user data
 */
export class UserFactory {
  static create(overrides: Partial<TestUserData> = {}): TestUserData {
    return {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: Role.customer,
      isActive: true,
      ...overrides,
    };
  }

  static createCustomer(overrides: Partial<TestUserData> = {}): TestUserData {
    return this.create({
      role: Role.customer,
      ...overrides,
    });
  }

  static createDriver(overrides: Partial<TestUserData> = {}): TestUserData {
    return this.create({
      role: Role.driver,
      ...overrides,
    });
  }

  static createAdmin(adminRole: AdminRole = AdminRole.booking_manager, overrides: Partial<TestUserData> = {}): TestUserData {
    return this.create({
      role: Role.admin,
      adminRole,
      ...overrides,
    });
  }

  static createSuperAdmin(overrides: Partial<TestUserData> = {}): TestUserData {
    return this.create({
      role: Role.super_admin,
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<TestUserData> = {}): TestUserData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createInactive(overrides: Partial<TestUserData> = {}): TestUserData {
    return this.create({
      isActive: false,
      ...overrides,
    });
  }
}

/**
 * Address Factory for creating test address data
 */
export class AddressFactory {
  static create(overrides: Partial<TestAddressData> = {}): TestAddressData {
    return {
      line1: faker.location.streetAddress(),
      line2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }),
      city: faker.location.city(),
      postcode: faker.location.zipCode('??# #??'),
      country: 'United Kingdom',
      latitude: faker.helpers.maybe(() => faker.location.latitude({ min: 49.9, max: 60.9 }), { probability: 0.7 }),
      longitude: faker.helpers.maybe(() => faker.location.longitude({ min: -8.2, max: 1.8 }), { probability: 0.7 }),
      ...overrides,
    };
  }

  static createLondonAddress(overrides: Partial<TestAddressData> = {}): TestAddressData {
    return this.create({
      city: 'London',
      postcode: faker.helpers.arrayElement(['SW1A 1AA', 'W1A 1AA', 'E1A 1AA', 'N1A 1AA']),
      latitude: faker.location.latitude({ min: 51.3, max: 51.7 }),
      longitude: faker.location.longitude({ min: -0.5, max: 0.2 }),
      ...overrides,
    });
  }

  static createManchesterAddress(overrides: Partial<TestAddressData> = {}): TestAddressData {
    return this.create({
      city: 'Manchester',
      postcode: faker.helpers.arrayElement(['M1 1AA', 'M2 1AA', 'M3 1AA', 'M4 1AA']),
      latitude: faker.location.latitude({ min: 53.4, max: 53.5 }),
      longitude: faker.location.longitude({ min: -2.3, max: -2.1 }),
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<TestAddressData> = {}): TestAddressData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Booking Item Factory for creating test booking item data
 */
export class BookingItemFactory {
  static create(overrides: Partial<TestBookingItemData> = {}): TestBookingItemData {
    const dimensions = {
      length: faker.number.float({ min: 0.1, max: 2.0, precision: 0.1 }),
      width: faker.number.float({ min: 0.1, max: 1.5, precision: 0.1 }),
      height: faker.number.float({ min: 0.1, max: 1.0, precision: 0.1 }),
    };

    return {
      name: faker.helpers.arrayElement([
        'Sofa',
        'Dining Table',
        'Bed Frame',
        'Wardrobe',
        'Bookshelf',
        'TV Stand',
        'Coffee Table',
        'Office Chair',
        'Filing Cabinet',
        'Mirror',
      ]),
      quantity: faker.number.int({ min: 1, max: 5 }),
      weight: faker.number.float({ min: 5, max: 100, precision: 0.5 }),
      dimensions,
      requiresTwoPerson: faker.datatype.boolean(),
      isFragile: faker.datatype.boolean(),
      specialHandling: faker.helpers.maybe(() => faker.helpers.arrayElement([
        'Handle with care',
        'Keep upright',
        'Do not stack',
        'Climate controlled',
        'Anti-static packaging',
      ]), { probability: 0.4 }),
      ...overrides,
    };
  }

  static createFurniture(overrides: Partial<TestBookingItemData> = {}): TestBookingItemData {
    return this.create({
      name: faker.helpers.arrayElement(['Sofa', 'Dining Table', 'Bed Frame', 'Wardrobe']),
      weight: faker.number.float({ min: 20, max: 100, precision: 0.5 }),
      requiresTwoPerson: true,
      isFragile: false,
      ...overrides,
    });
  }

  static createElectronics(overrides: Partial<TestBookingItemData> = {}): TestBookingItemData {
    return this.create({
      name: faker.helpers.arrayElement(['TV', 'Computer', 'Monitor', 'Speakers']),
      weight: faker.number.float({ min: 5, max: 30, precision: 0.5 }),
      requiresTwoPerson: false,
      isFragile: true,
      specialHandling: 'Handle with care',
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<TestBookingItemData> = {}): TestBookingItemData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Booking Factory for creating test booking data
 */
export class BookingFactory {
  static create(overrides: Partial<TestBookingData> = {}): TestBookingData {
    const scheduledDate = faker.date.future({ years: 1 });
    
    return {
      pickupAddress: AddressFactory.create(),
      dropoffAddress: AddressFactory.create(),
      scheduledDate,
      items: BookingItemFactory.createMany(faker.number.int({ min: 1, max: 5 })),
      specialInstructions: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }),
      requiresTwoPerson: faker.datatype.boolean(),
      isFragile: faker.datatype.boolean(),
      ...overrides,
    };
  }

  static createLocalMove(overrides: Partial<TestBookingData> = {}): TestBookingData {
    const city = faker.location.city();
    const pickupAddress = AddressFactory.create({ city });
    const dropoffAddress = AddressFactory.create({ city });

    return this.create({
      pickupAddress,
      dropoffAddress,
      ...overrides,
    });
  }

  static createLongDistanceMove(overrides: Partial<TestBookingData> = {}): TestBookingData {
    const pickupAddress = AddressFactory.createLondonAddress();
    const dropoffAddress = AddressFactory.createManchesterAddress();

    return this.create({
      pickupAddress,
      dropoffAddress,
      ...overrides,
    });
  }

  static createStudentMove(overrides: Partial<TestBookingData> = {}): TestBookingData {
    return this.create({
      items: BookingItemFactory.createMany(faker.number.int({ min: 3, max: 8 })),
      specialInstructions: 'Student discount applied',
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<TestBookingData> = {}): TestBookingData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Driver Factory for creating test driver data
 */
export class DriverFactory {
  static create(overrides: Partial<TestDriverData> = {}): TestDriverData {
    return {
      basePostcode: faker.location.zipCode('??# #??'),
      vehicleType: faker.helpers.arrayElement(['Van', 'Luton Van', '7.5 Tonne', 'Articulated']),
      rightToWorkType: faker.helpers.arrayElement(['British Citizen', 'EU Citizen', 'Work Visa', 'Settled Status']),
      status: 'active',
      onboardingStatus: 'approved',
      rating: faker.helpers.maybe(() => faker.number.float({ min: 3.0, max: 5.0, precision: 0.1 }), { probability: 0.8 }),
      strikes: faker.number.int({ min: 0, max: 3 }),
      ...overrides,
    };
  }

  static createNewDriver(overrides: Partial<TestDriverData> = {}): TestDriverData {
    return this.create({
      onboardingStatus: 'applied',
      status: 'pending',
      rating: undefined,
      strikes: 0,
      ...overrides,
    });
  }

  static createExperiencedDriver(overrides: Partial<TestDriverData> = {}): TestDriverData {
    return this.create({
      onboardingStatus: 'approved',
      status: 'active',
      rating: faker.number.float({ min: 4.5, max: 5.0, precision: 0.1 }),
      strikes: 0,
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<TestDriverData> = {}): TestDriverData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Utility functions for testing
 */
export class TestUtils {
  /**
   * Generate a realistic UK phone number
   */
  static generateUKPhoneNumber(): string {
    const prefixes = ['07', '01', '02'];
    const prefix = faker.helpers.arrayElement(prefixes);
    
    if (prefix === '07') {
      // Mobile number
      return `${prefix}${faker.string.numeric(9)}`;
    } else {
      // Landline number
      return `${prefix}${faker.string.numeric(8)}`;
    }
  }

  /**
   * Generate a realistic UK postcode
   */
  static generateUKPostcode(): string {
    const formats = ['??# #??', '??## #??', '??? #??', '??# ???'];
    const format = faker.helpers.arrayElement(formats);
    return faker.location.zipCode(format);
  }

  /**
   * Generate a realistic date within a range
   */
  static generateDateInRange(startDate: Date, endDate: Date): Date {
    return faker.date.between({ from: startDate, to: endDate });
  }

  /**
   * Generate a realistic price for moving services
   */
  static generateMovingPrice(basePrice: number = 50): number {
    const variation = faker.number.float({ min: 0.8, max: 1.5, precision: 0.01 });
    return Math.round(basePrice * variation * 100) / 100;
  }

  /**
   * Create a mock Prisma result with proper typing
   */
  static createMockPrismaResult<T>(data: Partial<T>): T {
    return data as T;
  }

  /**
   * Generate test data for specific scenarios
   */
  static generateTestScenario(scenario: 'new_customer' | 'returning_customer' | 'driver_application' | 'admin_workflow') {
    switch (scenario) {
      case 'new_customer':
        return {
          user: UserFactory.createCustomer(),
          booking: BookingFactory.create(),
          address: AddressFactory.create(),
        };
      
      case 'returning_customer':
        return {
          user: UserFactory.createCustomer({ isActive: true }),
          bookings: BookingFactory.createMany(3),
          addresses: AddressFactory.createMany(2),
        };
      
      case 'driver_application':
        return {
          user: UserFactory.createDriver(),
          driver: DriverFactory.createNewDriver(),
          address: AddressFactory.create(),
        };
      
      case 'admin_workflow':
        return {
          admin: UserFactory.createAdmin(AdminRole.booking_manager),
          customers: UserFactory.createMany(5, { role: Role.customer }),
          drivers: UserFactory.createMany(3, { role: Role.driver }),
          bookings: BookingFactory.createMany(10),
        };
      
      default:
        throw new Error(`Unknown test scenario: ${scenario}`);
    }
  }
}

export default {
  UserFactory,
  AddressFactory,
  BookingItemFactory,
  BookingFactory,
  DriverFactory,
  TestUtils,
};
