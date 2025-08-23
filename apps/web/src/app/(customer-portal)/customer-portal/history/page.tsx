import React from "react";
import { Box, Heading, Table, Thead, Tr, Th, Tbody, Td, Button } from "@chakra-ui/react";
import { PrismaClient } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import NextLink from "next/link";

const prisma = new PrismaClient();

export default async function CustomerHistoryPage() {
  const session = await requireRole("customer");
  const customerId = (session!.user as any).id as string;
  const past = await prisma.booking.findMany({ 
    where: { customerId, status: { in: ["COMPLETED", "CANCELLED"] } }, 
    include: {
      pickupAddress: true,
      dropoffAddress: true
    },
    orderBy: { createdAt: "desc" }, 
    take: 50 
  });

  return (
    <Box>
      <Heading size="md" mb={4}>Past orders</Heading>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Code</Th>
            <Th>Date</Th>
            <Th>Route</Th>
            <Th isNumeric>Total paid</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {past.map((r) => (
            <Tr key={r.id}>
              <Td>{r.reference}</Td>
              <Td>{r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : "—"}</Td>
              <Td>{[r.pickupAddress.label, r.dropoffAddress.label].filter(Boolean).join(" → ")}</Td>
              <Td isNumeric>{r.totalGBP ? `£${r.totalGBP}` : "—"}</Td>
              <Td>
                                  <Button as={NextLink as any} href={`/api/customer/orders/${r.reference}/receipt`} size="xs" variant="outline">Receipt</Button>
                                  <Button as={NextLink as any} href={`/book?rebook=${r.reference}`} size="xs" ml={2}>Rebook</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}


