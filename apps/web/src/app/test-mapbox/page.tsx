'use client';

import { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Button, Input, Alert, AlertIcon } from '@chakra-ui/react';

export default function TestMapboxPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envInfo, setEnvInfo] = useState<any>(null);

  // Test environment variables
  useEffect(() => {
    fetch('/api/debug/mapbox')
      .then(res => res.json())
      .then(data => setEnvInfo(data))
      .catch(err => console.error('Failed to fetch env info:', err));
  }, []);

  const testMapbox = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`/api/places/suggest?q=${encodeURIComponent(query)}&country=GB&limit=5`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setResults(data);
      } else {
        setError('No results found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Mapbox Test Page
        </Text>

        {/* Environment Variables Debug */}
        {envInfo && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Environment Variables Status
            </Text>
            <VStack align="start" spacing={2}>
              <Text>Environment: {envInfo.environment}</Text>
              <Text>Has Mapbox Token: {envInfo.hasMapboxToken ? '✅ YES' : '❌ NO'}</Text>
              <Text>NEXT_PUBLIC_MAPBOX_TOKEN: {envInfo.environmentVariables.NEXT_PUBLIC_MAPBOX_TOKEN}</Text>
              <Text>MAPBOX_TOKEN: {envInfo.environmentVariables.MAPBOX_TOKEN}</Text>
              <Text>MAPBOX_ACCESS_TOKEN: {envInfo.environmentVariables.MAPBOX_ACCESS_TOKEN}</Text>
            </VStack>
          </Box>
        )}

        {/* Test Input */}
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Test Address Autocomplete
            </Text>
            <HStack w="full">
              <Input
                placeholder="Type an address (e.g., London, Oxford Street)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testMapbox()}
              />
              <Button
                onClick={testMapbox}
                isLoading={loading}
                colorScheme="blue"
              >
                Search
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Results */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {results.length > 0 && (
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Results ({results.length})
            </Text>
            <VStack align="start" spacing={2}>
              {results.map((result, index) => (
                <Box key={index} p={3} borderWidth="1px" borderRadius="md" w="full">
                  <Text fontWeight="medium">{result.label}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {result.address?.line1}, {result.address?.city} {result.address?.postcode}
                  </Text>
                  {result.coords && (
                    <Text fontSize="sm" color="gray.500">
                      Coordinates: {result.coords.lat}, {result.coords.lng}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Instructions */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="blue.50">
          <Text fontSize="md" fontWeight="semibold" mb={2}>
            Instructions:
          </Text>
          <VStack align="start" spacing={1} fontSize="sm">
            <Text>1. تحقق من حالة المتغيرات البيئية أعلاه</Text>
            <Text>2. اكتب عنوان للاختبار (مثل: London, Oxford Street)</Text>
            <Text>3. اضغط Search لاختبار Mapbox API</Text>
            <Text>4. إذا لم تعمل، تحقق من Render environment variables</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
