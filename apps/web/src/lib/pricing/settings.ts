import { prisma } from '@/lib/prisma';

export interface PricingSettings {
  customerPriceAdjustment: number;
  driverRateMultiplier: number;
  isActive: boolean;
}

export async function getCurrentPricingSettings(): Promise<PricingSettings> {
  try {
    const settings = await prisma.pricingSettings.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!settings) {
      // Return default settings if none exist
      return {
        customerPriceAdjustment: 0,
        driverRateMultiplier: 1,
        isActive: true,
      };
    }

    return {
      customerPriceAdjustment: Number(settings.customerPriceAdjustment),
      driverRateMultiplier: Number(settings.driverRateMultiplier),
      isActive: settings.isActive,
    };
  } catch (error) {
    console.error('Error fetching pricing settings:', error);
    // Return default settings on error
    return {
      customerPriceAdjustment: 0,
      driverRateMultiplier: 1,
      isActive: true,
    };
  }
}
