'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Button,
  Select,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Icon,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
  FiBarChart3,
  FiPieChart,
  FiRefreshCw,
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageResponseTime: number;
  activeUsers: number;
  totalTokens: number;
  customerModeUsage: number;
  developerModeUsage: number;
  topTools: Array<{ name: string; usage: number }>;
  hourlyActivity: Array<{ hour: string; queries: number }>;
  dailyStats: Array<{ date: string; queries: number; success: number; failed: number }>;
  languageDistribution: Array<{ language: string; percentage: number }>;
}

const AIAgentDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [activeTab, setActiveTab] = useState('overview');
  const [chartsReady, setChartsReady] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: DashboardStats = {
        totalQueries: 15420,
        successfulQueries: 14890,
        failedQueries: 530,
        averageResponseTime: 1250,
        activeUsers: 342,
        totalTokens: 2847500,
        customerModeUsage: 68,
        developerModeUsage: 32,
        topTools: [
          { name: 'Pricing Tool', usage: 45 },
          { name: 'Booking Status', usage: 32 },
          { name: 'Payment Status', usage: 28 },
          { name: 'File System Manager', usage: 18 },
          { name: 'Code Analysis', usage: 15 },
        ],
        hourlyActivity: [
          { hour: '00:00', queries: 45 },
          { hour: '04:00', queries: 32 },
          { hour: '08:00', queries: 156 },
          { hour: '12:00', queries: 234 },
          { hour: '16:00', queries: 198 },
          { hour: '20:00', queries: 87 },
        ],
        dailyStats: [
          { date: '2024-01-01', queries: 1200, success: 1150, failed: 50 },
          { date: '2024-01-02', queries: 1350, success: 1290, failed: 60 },
          { date: '2024-01-03', queries: 1420, success: 1370, failed: 50 },
          { date: '2024-01-04', queries: 1580, success: 1520, failed: 60 },
          { date: '2024-01-05', queries: 1680, success: 1620, failed: 60 },
          { date: '2024-01-06', queries: 1450, success: 1400, failed: 50 },
          { date: '2024-01-07', queries: 1320, success: 1270, failed: 50 },
        ],
        languageDistribution: [
          { language: 'العربية', percentage: 65 },
          { language: 'English', percentage: 35 },
        ],
      };
      
      setStats(mockStats);
      setLoading(false);
    };

         fetchStats();
   }, [timeRange]);

   // Ensure charts are ready after component mounts and when tab changes
   useEffect(() => {
     const timer = setTimeout(() => setChartsReady(true), 300);
     return () => clearTimeout(timer);
   }, [activeTab]);

  const refreshStats = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <CircularProgress isIndeterminate color={accentColor} size="60px" />
        <Text mt={4} fontSize="lg" color="gray.500">
          جاري تحميل الإحصائيات...
        </Text>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>خطأ في التحميل!</AlertTitle>
        <AlertDescription>
          تعذر تحميل إحصائيات AI Agent. يرجى المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  const successRate = ((stats.successfulQueries / stats.totalQueries) * 100).toFixed(1);
  const failureRate = ((stats.failedQueries / stats.totalQueries) * 100).toFixed(1);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

           return (
      <Box ref={dashboardRef} bg={bgColor} borderRadius="xl" p={6} border="1px solid" borderColor={borderColor}>
      {/* Header */}
      <HStack justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={textColor}>
            لوحة تحكم AI Agent
          </Heading>
          <Text color="gray.500" fontSize="sm">
            مراقبة شاملة لأداء المساعد الذكي
          </Text>
        </VStack>

        <HStack spacing={3}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            size="sm"
            w="120px"
          >
            <option value="24h">آخر 24 ساعة</option>
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
          </Select>
          
          <Button
            leftIcon={<FiRefreshCw />}
            size="sm"
            onClick={refreshStats}
            isLoading={loading}
          >
            تحديث
          </Button>
        </HStack>
      </HStack>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} variant="enclosed">
        <TabList>
          <Tab>نظرة عامة</Tab>
          <Tab>النشاط</Tab>
          <Tab>الأداء</Tab>
          <Tab>الأدوات</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Key Metrics */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <StatCard
                  label="إجمالي الاستعلامات"
                  value={stats.totalQueries.toLocaleString('en-US')}
                  change="+12.5%"
                  changeType="increase"
                  icon={FiMessageSquare}
                  color="blue"
                />
                <StatCard
                  label="الاستعلامات الناجحة"
                  value={stats.successfulQueries.toLocaleString('en-US')}
                  change="+8.2%"
                  changeType="increase"
                  icon={FiCheckCircle}
                  color="green"
                />
                <StatCard
                  label="متوسط وقت الاستجابة"
                  value={`${stats.averageResponseTime}ms`}
                  change="-5.1%"
                  changeType="decrease"
                  icon={FiClock}
                  color="orange"
                />
                <StatCard
                  label="المستخدمون النشطون"
                  value={stats.activeUsers.toLocaleString('en-US')}
                  change="+15.3%"
                  changeType="increase"
                  icon={FiUsers}
                  color="purple"
                />
              </SimpleGrid>

              {/* Success Rate & Mode Usage */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box p={6} border="1px solid" borderColor={borderColor} borderRadius="lg">
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={textColor}>
                      معدل النجاح
                    </Heading>
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
                    </Box>
                    <HStack justify="space-between" fontSize="sm" color="gray.500">
                                      <Text>نجح: {stats.successfulQueries.toLocaleString('en-US')}</Text>
                <Text>فشل: {stats.failedQueries.toLocaleString('en-US')}</Text>
                    </HStack>
                  </VStack>
                </Box>

                <Box p={6} border="1px solid" borderColor={borderColor} borderRadius="lg">
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={textColor}>
                      استخدام الأوضاع
                    </Heading>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm">وضع العملاء</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {stats.customerModeUsage}%
                          </Text>
                        </HStack>
                        <Progress
                          value={stats.customerModeUsage}
                          colorScheme="green"
                          size="lg"
                          borderRadius="full"
                        />
                      </Box>
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm">وضع المطورين</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {stats.developerModeUsage}%
                          </Text>
                        </HStack>
                        <Progress
                          value={stats.developerModeUsage}
                          colorScheme="blue"
                          size="lg"
                          borderRadius="full"
                        />
                      </Box>
                    </VStack>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Activity Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Hourly Activity Chart */}
              <Box p={6} border="1px solid" borderColor={borderColor} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={textColor}>
                    النشاط بالساعات
                  </Heading>
                                                        <Box h="300px" w="100%" minW="0" position="relative" overflow="hidden">
                     {activeTab === 'activity' && chartsReady ? (
                       <Box key={`line-chart-${activeTab}`} w="100%" h="100%" minW="300px" minH="300px">
                         <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={stats.hourlyActivity}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="hour" />
                             <YAxis />
                             <RechartsTooltip />
                             <Line
                               type="monotone"
                               dataKey="queries"
                               stroke={accentColor}
                               strokeWidth={3}
                               dot={{ fill: accentColor, strokeWidth: 2, r: 4 }}
                             />
                           </LineChart>
                         </ResponsiveContainer>
                       </Box>
                     ) : (
                       <Box h="100%" w="100%" display="flex" alignItems="center" justifyContent="center">
                         <Text color="gray.500">
                           {activeTab === 'activity' ? 'جاري تحميل الرسم البياني...' : 'انتقل إلى تبويب النشاط لعرض الرسم البياني'}
                         </Text>
                       </Box>
                     )}
                   </Box>
                </VStack>
              </Box>

              {/* Daily Stats Chart */}
              <Box p={6} border="1px solid" borderColor={borderColor} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={textColor}>
                    الإحصائيات اليومية
                  </Heading>
                                                        <Box h="300px" w="100%" minW="0" position="relative" overflow="hidden">
                     {activeTab === 'activity' && chartsReady ? (
                       <Box key={`bar-chart-${activeTab}`} w="100%" h="100%" minW="300px" minH="300px">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={stats.dailyStats}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="date" />
                             <YAxis />
                             <RechartsTooltip />
                             <Bar dataKey="queries" fill={accentColor} />
                             <Bar dataKey="success" fill="green.400" />
                             <Bar dataKey="failed" fill="red.400" />
                           </BarChart>
                         </ResponsiveContainer>
                       </Box>
                     ) : (
                       <Box h="100%" w="100%" display="flex" alignItems="center" justifyContent="center">
                         <Text color="gray.500">
                           {activeTab === 'activity' ? 'جاري تحميل الرسم البياني...' : 'انتقل إلى تبويب النشاط لعرض الرسم البياني'}
                         </Text>
                       </Box>
                     )}
                   </Box>
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* Performance Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Response Time Analysis */}
              <Box p={6} border="1px solid" borderColor={borderColor} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={textColor}>
                    تحليل وقت الاستجابة
                  </Heading>
                  <HStack spacing={8} justify="center">
                    <VStack spacing={2}>
                      <Text fontSize="2xl" fontWeight="bold" color="green.400">
                        {stats.averageResponseTime}ms
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        متوسط وقت الاستجابة
                      </Text>
                    </VStack>
                    <VStack spacing={2}>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                        {stats.totalTokens.toLocaleString('en-US')}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        إجمالي الرموز المستخدمة
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>

              {/* Language Distribution */}
              <Box p={6} border="1px solid" borderColor={borderColor} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={textColor}>
                    توزيع اللغات
                  </Heading>
                                                        <Box h="300px" w="100%" minW="0" position="relative" overflow="hidden">
                     {activeTab === 'performance' && chartsReady ? (
                       <Box key={`pie-chart-${activeTab}`} w="100%" h="100%" minW="300px" minH="300px">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie
                               data={stats.languageDistribution}
                               cx="50%"
                               cy="50%"
                               labelLine={false}
                               label={({ language, percentage }) => `${language}: ${percentage}%`}
                               outerRadius={80}
                             fill="#8884d8"
                             dataKey="percentage"
                           >
                             {stats.languageDistribution.map((entry, index) => {
                               return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                             })}
                           </Pie>
                           <RechartsTooltip />
                         </PieChart>
                       </ResponsiveContainer>
                     </Box>
                   ) : (
                     <Box h="100%" w="100%" display="flex" alignItems="center" justifyContent="center">
                       <Text color="gray.500">
                         {activeTab === 'performance' ? 'جاري تحميل الرسم البياني...' : 'انتقل إلى تبويب الأداء لعرض الرسم البياني'}
                       </Text>
                     </Box>
                   )}
                 </Box>
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* Tools Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Top Tools Usage */}
              <Box p={6} border="1px solid" borderColor={borderColor} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={textColor}>
                    أكثر الأدوات استخداماً
                  </Heading>
                  <VStack spacing={3} align="stretch">
                    {stats.topTools.map((tool, index) => (
                      <Box key={tool.name}>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" variant="subtle">
                              #{index + 1}
                            </Badge>
                            <Text fontSize="sm">{tool.name}</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold">
                            {tool.usage}%
                          </Text>
                        </HStack>
                        <Progress
                          value={tool.usage}
                          colorScheme="blue"
                          size="sm"
                          borderRadius="full"
                        />
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
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
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, changeType, icon, color }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box
      p={6}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      textAlign="center"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
    >
      <Icon as={icon} w={8} h={8} color={`${color}.500`} mb={3} />
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
  );
};

export default AIAgentDashboard;
