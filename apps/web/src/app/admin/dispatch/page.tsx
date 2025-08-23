import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DispatchClient from "./DispatchClient";

async function getDispatchData() {
  // Get jobs by status for board view
  const jobsByStatus = await prisma.booking.groupBy({
    by: ['status'],
    where: {
      status: {
        in: ['DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
      }
    },
    _count: {
      id: true
    }
  });

  // Get active jobs with driver info
  const activeJobs = await prisma.booking.findMany({
    where: {
      status: {
        in: ['CONFIRMED']
      }
    },
    include: {
      driver: {
        include: {
          user: true,
          availability: true
        }
      },
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Get available drivers
  const availableDrivers = await prisma.driver.findMany({
    where: {
      status: 'active',
      onboardingStatus: 'approved',
      availability: {
        status: 'online'
      }
    },
    include: {
      user: true,
      availability: true,
      vehicles: true
    }
  });

  // Get open incidents
  const openIncidents = await prisma.driverIncident.findMany({
    where: {
      status: 'reported'
    },
    include: {
      driver: {
        include: {
          user: true
        }
      },
      Assignment: {
        include: {
          Booking: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });

  // Get auto-assign rules (from config or default)
  const autoAssignRules = {
    radius: 5000, // 5km
    vehicleType: 'any',
    capacity: 'any',
    loadLimit: 'any',
    rating: 4.0,
    maxJobs: 3
  };

  return {
    jobsByStatus: jobsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>),
    activeJobs,
    availableDrivers,
    openIncidents,
    autoAssignRules
  };
}

export default async function DispatchPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") redirect("/auth/login");
  
  const data = await getDispatchData();

  return <DispatchClient data={data} />;
}
