'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Icon,
  useColorModeValue,
  Tooltip,
  Progress,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiMessageSquare,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiDatabase,
  FiCpu,
  FiZap,
  FiGlobe,
  FiBrain,
  FiTool,
} from 'react-icons/fi';

interface QuickStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageResponseTime: number;
  activeUsers: number;
  totalTokens: number;
  customerModeUsage: number;
  developerModeUsage: number;
  arabicLanguageUsage: number;
  englishLanguageUsage: number;
  topPerformingTool: string;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

const AIAgentStats: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Mock data - in real implementation, fetch from API
  const stats: QuickStats = {
    totalQueries: 15420,
    successfulQueries: 14890,
    failedQueries: 530,
    averageResponseTime: 1250,
    activeUsers: 342,
    totalTokens: 2847500,
    customerModeUsage: 68,
    developerModeUsage: 32,
    arabicLanguageUsage: 65,
    englishLanguageUsage: 35,
    topPerformingTool: 'Pricing Tool',
    systemHealth: 'excellent',
  };

  const successRate = ((stats.successfulQueries / stats.totalQueries) * 100).toFixed(1);
  const failureRate = ((stats.failedQueries / stats.totalQueries) * 100).toFixed(1);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'green.500';
      case 'good': return 'blue.500';
      case 'warning': return 'orange.500';
      case 'critical': return 'red.500';
      default: return 'gray.500';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'excellent': return 'ممتاز';
      case 'good': return 'جيد';
      case 'warning': return 'تحذير';
      case 'critical': return 'حرج';
      default: return 'غير محدد';
    }
  };

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <Heading size="xl" color={textColor}>
            إحصائيات AI Agent السريعة
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            نظرة سريعة على أداء المساعد الذكي والمؤشرات الرئيسية
          </Text>
        </VStack>

        {/* Key Performance Indicators */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard
            label="إجمالي الاستعلامات"
            value={stats.totalQueries.toLocaleString('en-US')}
            change="+12.5%"
            changeType="increase"
            icon={FiMessageSquare}
            color="blue"
            description="إجمالي عدد الاستعلامات المعالجة"
          />
          <StatCard
            label="معدل النجاح"
            value={`${successRate}%`}
            change="+2.1%"
            changeType="increase"
            icon={FiCheckCircle}
            color="green"
            description="نسبة الاستعلامات الناجحة"
          />
          <StatCard
            label="متوسط وقت الاستجابة"
            value={`${stats.averageResponseTime}ms`}
            change="-5.1%"
            changeType="decrease"
            icon={FiClock}
            color="orange"
            description="متوسط الوقت المستغرق للرد"
          />
          <StatCard
            label="المستخدمون النشطون"
            value={stats.activeUsers.toLocaleString('en-US')}
            change="+15.3%"
            changeType="increase"
            icon={FiUsers}
            color="purple"
            description="عدد المستخدمين النشطين حالياً"
          />
        </SimpleGrid>

        {/* Detailed Metrics */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* System Health & Performance */}
          <Box p={6} bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="xl">
            <VStack spacing={6} align="stretch">
              <Heading size="md" color={textColor}>
                صحة النظام والأداء
              </Heading>
              
              {/* System Health */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    حالة النظام
                  </Text>
                  <Badge
                    colorScheme={stats.systemHealth === 'excellent' ? 'green' : 
                               stats.systemHealth === 'good' ? 'blue' : 
                               stats.systemHealth === 'warning' ? 'orange' : 'red'}
                    variant="subtle"
                  >
                    {getHealthText(stats.systemHealth)}
                  </Badge>
                </HStack>
                <Progress
                  value={stats.systemHealth === 'excellent' ? 100 : 
                         stats.systemHealth === 'good' ? 80 : 
                         stats.systemHealth === 'warning' ? 60 : 30}
                  colorScheme={stats.systemHealth === 'excellent' ? 'green' : 
                             stats.systemHealth === 'good' ? 'blue' : 
                             stats.systemHealth === 'warning' ? 'orange' : 'red'}
                  size="lg"
                  borderRadius="full"
                />
              </Box>

              {/* Response Time Analysis */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    تحليل وقت الاستجابة
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    {stats.averageResponseTime}ms
                  </Text>
                </HStack>
                <Progress
                  value={Math.min((stats.averageResponseTime / 2000) * 100, 100)}
                  colorScheme={stats.averageResponseTime < 1000 ? 'green' : 
                             stats.averageResponseTime < 1500 ? 'orange' : 'red'}
                  size="lg"
                  borderRadius="full"
                />
                <HStack justify="space-between" mt={2} fontSize="xs" color="gray.500">
                  <Text>سريع: &lt;1000ms</Text>
                  <Text>متوسط: 1000-1500ms</Text>
                  <Text>بطيء: &gt;1500ms</Text>
                </HStack>
              </Box>

              {/* Token Usage */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    استخدام الرموز
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    {(stats.totalTokens / 1000000).toFixed(1)}M
                  </Text>
                </HStack>
                <Progress
                  value={(stats.totalTokens / 5000000) * 100}
                  colorScheme="blue"
                  size="lg"
                  borderRadius="full"
                />
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {stats.totalTokens.toLocaleString('en-US')} رمز مستخدم
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Usage Distribution */}
          <Box p={6} bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="xl">
            <VStack spacing={6} align="stretch">
              <Heading size="md" color={textColor}>
                توزيع الاستخدام
              </Heading>
              
              {/* Mode Usage */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
                  استخدام الأوضاع
                </Text>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Icon as={FiUsers} color="green.500" />
                        <Text fontSize="sm">وضع العملاء</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold">
                        {stats.customerModeUsage}%
                      </Text>
                    </HStack>
                    <Progress
                      value={stats.customerModeUsage}
                      colorScheme="green"
                      size="md"
                      borderRadius="full"
                    />
                  </Box>
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Icon as={FiTool} color="blue.500" />
                        <Text fontSize="sm">وضع المطورين</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold">
                        {stats.developerModeUsage}%
                      </Text>
                    </HStack>
                    <Progress
                      value={stats.developerModeUsage}
                      colorScheme="blue"
                      size="md"
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
              </Box>

              {/* Language Usage */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
                  توزيع اللغات
                </Text>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Icon as={FiGlobe} color="teal.500" />
                        <Text fontSize="sm">العربية</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold">
                        {stats.arabicLanguageUsage}%
                      </Text>
                    </HStack>
                    <Progress
                      value={stats.arabicLanguageUsage}
                      colorScheme="teal"
                      size="md"
                      borderRadius="full"
                    />
                  </Box>
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Icon as={FiGlobe} color="purple.500" />
                        <Text fontSize="sm">English</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold">
                        {stats.englishLanguageUsage}%
                      </Text>
                    </HStack>
                    <Progress
                      value={stats.englishLanguageUsage}
                      colorScheme="purple"
                      size="md"
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
              </Box>

              {/* Top Performing Tool */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
                  أفضل أداة أداءً
                </Text>
                <HStack spacing={3} p={3} bg="gray.50" borderRadius="lg" _dark={{ bg: 'gray.700' }}>
                  <Icon as={FiTool} color="orange.500" />
                  <Text fontSize="sm" fontWeight="medium">
                    {stats.topPerformingTool}
                  </Text>
                  <Badge colorScheme="green" variant="subtle">
                    الأفضل
                  </Badge>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Success Rate Visualization */}
        <Box p={6} bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="xl">
          <VStack spacing={6} align="stretch">
            <Heading size="md" color={textColor} textAlign="center">
              معدل النجاح الشامل
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {/* Success Rate */}
              <Box textAlign="center">
                <CircularProgress
                  value={parseFloat(successRate)}
                  color="green.400"
                  size="120px"
                  thickness="8px"
                >
                  <CircularProgressLabel fontSize="lg" fontWeight="bold">
                    {successRate}%
                  </CircularProgressLabel>
                </CircularProgress>
                <Text mt={3} fontSize="lg" fontWeight="medium" color="green.500">
                  نجح
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {stats.successfulQueries.toLocaleString('en-US')} استعلام
                </Text>
              </Box>

              {/* Failure Rate */}
              <Box textAlign="center">
                <CircularProgress
                  value={parseFloat(failureRate)}
                  color="red.400"
                  size="120px"
                  thickness="8px"
                >
                  <CircularProgressLabel fontSize="lg" fontWeight="bold">
                    {failureRate}%
                  </CircularProgressLabel>
                </CircularProgress>
                <Text mt={3} fontSize="lg" fontWeight="medium" color="red.500">
                  فشل
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {stats.failedQueries.toLocaleString('en-US')} استعلام
                </Text>
              </Box>

              {/* Total Queries */}
              <Box textAlign="center">
                <Box
                  w="120px"
                  h="120px"
                  mx="auto"
                  borderRadius="full"
                  bg="linear-gradient(135deg, blue.500 0%, purple.600 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                >
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stats.totalQueries.toLocaleString('en-US')}
                    </Text>
                    <Text fontSize="sm">إجمالي</Text>
                  </VStack>
                </Box>
                <Text mt={3} fontSize="lg" fontWeight="medium" color="blue.500">
                  إجمالي الاستعلامات
                </Text>
                <Text fontSize="sm" color="gray.500">
                  تمت معالجتها
                </Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, changeType, icon, color, description }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Tooltip label={description} placement="top">
      <Box
        p={6}
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        textAlign="center"
        transition="all 0.3s"
        cursor="pointer"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'xl',
          borderColor: `${color}.500`,
        }}
      >
        <Icon as={icon} w={10} h={10} color={`${color}.500`} mb={4} />
        <Stat>
          <StatLabel fontSize="sm" color="gray.500">
            {label}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color="gray.800">
            {value}
          </StatNumber>
          <StatHelpText>
            <StatArrow type={changeType === 'increase' ? 'increase' : 'decrease'} />
            {change}
          </StatHelpText>
        </Stat>
      </Box>
    </Tooltip>
  );
};

export default AIAgentStats;
