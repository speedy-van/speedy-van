import { Metadata } from 'next';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  List,
  ListItem,
  ListIcon,
  Divider,
} from '@chakra-ui/react';
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  MapPin,
  PoundSterling,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title:
    'Ultimate London Moving Guide 2024: Expert Tips & Cost Breakdown | Speedy Van',
  description:
    'Complete guide to moving in London 2024. Expert tips, cost breakdown, borough guide, and insider secrets from professional movers.',
  keywords:
    'London moving tips, moving to London 2024, London removal costs, moving house London',
  alternates: {
    canonical: 'https://speedy-van.co.uk/blog/london-moving-tips-2024',
  },
};

export default function LondonMovingTipsPage() {
  return (
    <>
      <Container maxW="4xl" py={16}>
        <article>
          {/* Article Header */}
          <VStack spacing={8} align="start" mb={12}>
            <Badge
              colorScheme="blue"
              variant="solid"
              borderRadius="full"
              px={4}
              py={2}
            >
              Moving Guide
            </Badge>

            <Heading as="h1" size="2xl" color="gray.800" lineHeight="shorter">
              The Ultimate London Moving Guide 2024: Expert Tips, Costs &
              Insider Secrets
            </Heading>

            <Text fontSize="xl" color="gray.600" lineHeight="tall">
              Moving to or within London can be overwhelming, but with the right
              knowledge and preparation, it doesn't have to be. This
              comprehensive guide covers everything you need to know about
              moving in London, from cost breakdowns to borough-specific tips.
            </Text>

            {/* Article Meta */}
            <HStack spacing={6} color="gray.500" fontSize="sm">
              <HStack spacing={2}>
                <Icon as={Calendar} boxSize={4} />
                <Text>December 2024</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={User} boxSize={4} />
                <Text>Speedy Van Team</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={Clock} boxSize={4} />
                <Text>15 min read</Text>
              </HStack>
            </HStack>
          </VStack>

          <Divider mb={12} />

          {/* Table of Contents */}
          <Box bg="gray.50" p={8} borderRadius="lg" mb={12}>
            <Heading as="h2" size="lg" mb={6} color="gray.800">
              What You'll Learn in This Guide
            </Heading>
            <List spacing={3}>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Link href="#london-moving-costs" color="blue.600">
                  Complete London Moving Cost Breakdown for 2024
                </Link>
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Link href="#best-areas" color="blue.600">
                  Best London Areas to Live: Borough-by-Borough Guide
                </Link>
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                <Link href="#moving-timeline" color="blue.600">
                  8-Week London Moving Timeline & Checklist
                </Link>
              </ListItem>
            </List>
          </Box>

          {/* London Moving Costs Section */}
          <VStack spacing={8} align="start" mb={12} id="london-moving-costs">
            <Heading as="h2" size="xl" color="gray.800">
              <Icon
                as={PoundSterling}
                display="inline"
                mr={3}
                color="green.500"
              />
              Complete London Moving Cost Breakdown for 2024
            </Heading>

            <Text fontSize="lg" lineHeight="tall" color="gray.700">
              Understanding the true cost of moving in London is crucial for
              proper budgeting. Many people underestimate the total expense,
              leading to financial stress during an already challenging time.
            </Text>

            <Box bg="blue.50" p={6} borderRadius="lg" w="full">
              <VStack spacing={4} align="start">
                <Heading as="h4" size="md" color="blue.800">
                  Studio/1-Bedroom Flat
                </Heading>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">
                      Man and Van (2-4 hours): £150-300
                    </Text>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    <Text as="span" fontWeight="bold">
                      Full Service with Packing: £400-600
                    </Text>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    <Text as="span">Average: £250 for local London move</Text>
                  </ListItem>
                </List>
              </VStack>
            </Box>
          </VStack>

          <Divider mb={12} />

          {/* Best London Areas Section */}
          <VStack spacing={8} align="start" mb={12} id="best-areas">
            <Heading as="h2" size="xl" color="gray.800">
              <Icon as={MapPin} display="inline" mr={3} color="red.500" />
              Best London Areas to Live: Borough-by-Borough Guide
            </Heading>

            <Text fontSize="lg" lineHeight="tall" color="gray.700">
              Choosing the right area to live in London is perhaps the most
              important decision you'll make during your move. Each of London's
              32 boroughs has its own distinct character, price point, and
              lifestyle offerings.
            </Text>

            <Box bg="yellow.50" p={6} borderRadius="lg" w="full">
              <VStack spacing={4} align="start">
                <Heading as="h4" size="md" color="yellow.800">
                  Westminster & Kensington
                </Heading>
                <Text color="gray.700">
                  <Text as="span" fontWeight="bold">
                    Best for:
                  </Text>{' '}
                  High-earning professionals, diplomats, and those who
                  prioritize prestige and central location above all else.
                  Average rent for a 1-bedroom flat: £2,500-4,000 per month.
                </Text>
              </VStack>
            </Box>
          </VStack>

          <Divider mb={12} />

          {/* Moving Timeline Section */}
          <VStack spacing={8} align="start" mb={12} id="moving-timeline">
            <Heading as="h2" size="xl" color="gray.800">
              <Icon as={Calendar} display="inline" mr={3} color="purple.500" />
              8-Week London Moving Timeline & Checklist
            </Heading>

            <Text fontSize="lg" lineHeight="tall" color="gray.700">
              A successful London move requires careful planning and timing.
              Based on our experience with thousands of moves, we've developed
              this comprehensive 8-week timeline that ensures nothing is
              forgotten.
            </Text>

            <Box bg="red.50" p={6} borderRadius="lg" w="full">
              <VStack spacing={4} align="start">
                <Heading as="h4" size="md" color="red.800">
                  8 Weeks Before Moving Day
                </Heading>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    Research and shortlist 3-5 professional moving companies
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircle} color="green.500" />
                    Request detailed quotes and compare services offered
                  </ListItem>
                </List>
              </VStack>
            </Box>
          </VStack>

          <Divider mb={12} />

          {/* Final CTA */}
          <Box
            bg="gray.800"
            color="white"
            p={12}
            borderRadius="xl"
            textAlign="center"
            mb={12}
          >
            <VStack spacing={6}>
              <Heading as="h3" size="xl">
                Ready to Make Your London Move?
              </Heading>
              <Text fontSize="lg" maxW="3xl" opacity={0.9}>
                Don't let the complexity of moving in London overwhelm you. Our
                experienced team handles hundreds of London moves every month,
                and we know exactly how to make your move smooth, efficient, and
                stress-free.
              </Text>
              <HStack spacing={4}>
                <Box
                  as={Link}
                  href="/book"
                  bg="blue.600"
                  color="white"
                  px={8}
                  py={4}
                  borderRadius="lg"
                  fontWeight="bold"
                  _hover={{ bg: 'blue.700' }}
                  transition="all 0.2s"
                >
                  Get Your Free London Quote
                </Box>
                <Box
                  as={Link}
                  href="tel:+44-7901846297"
                  bg="transparent"
                  color="white"
                  px={8}
                  py={4}
                  borderRadius="lg"
                  fontWeight="bold"
                  border="2px solid white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  transition="all 0.2s"
                >
                  Call Our London Team
                </Box>
              </HStack>
            </VStack>
          </Box>
        </article>
      </Container>
    </>
  );
}
