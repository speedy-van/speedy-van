import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Center,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function PortalInvoices() {
  const session = await requireRole('customer');
  const customerId = (session!.user as any).id as string;

  const invoices = await prisma.booking.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'unpaid':
        return 'red';
      case 'requires_action':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>
          Invoices & Payments
        </Heading>
        <Text color="gray.600">
          View and download your invoices and payment history
        </Text>
      </Box>

      {invoices.length === 0 ? (
        <Center py={12}>
          <VStack spacing={4}>
            <Text fontSize="lg" color="gray.600">
              No invoices yet
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Invoices will appear here once you make your first booking.
            </Text>
            <Button as={NextLink as any} href="/book" colorScheme="blue">
              Book a Move
            </Button>
          </VStack>
        </Center>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {invoices.map(invoice => (
                <Tr key={invoice.id}>
                  <Td>
                    <Text fontWeight="medium">{invoice.reference}</Text>
                  </Td>
                  <Td>
                    <Text fontWeight="medium">
                      {formatCurrency(invoice.totalGBP * 100)}
                    </Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getPaymentStatusColor(
                        invoice.status === 'PENDING_PAYMENT'
                          ? 'pending'
                          : 'paid'
                      )}
                      variant="subtle"
                    >
                      {(invoice.status === 'PENDING_PAYMENT'
                        ? 'pending'
                        : 'paid'
                      ).toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {invoice.createdAt
                        ? new Date(invoice.createdAt).toLocaleDateString(
                            'en-GB'
                          )
                        : 'N/A'}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        as={NextLink as any}
                        href={`/portal/orders/${invoice.reference}`}
                        size="sm"
                        variant="outline"
                      >
                        View Order
                      </Button>
                      {invoice.status === 'PENDING_PAYMENT' && (
                        <Button
                          as={NextLink as any}
                          href={`/checkout?code=${invoice.reference}`}
                          size="sm"
                          colorScheme="blue"
                        >
                          Pay Now
                        </Button>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </VStack>
  );
}
