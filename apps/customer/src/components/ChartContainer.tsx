import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer } from 'recharts';
import { Box, BoxProps, Spinner, Text, VStack } from '@chakra-ui/react';

interface ChartContainerProps extends BoxProps {
  children: React.ReactElement;
  height: number | string;
  width?: number | string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  height,
  width = '100%',
  fallback,
  showLoading = false,
  ...boxProps
}) => {
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [key, setKey] = useState(0);

  // Handle window resize to force chart re-render
  const handleResize = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Small delay to ensure container is properly mounted
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    // Add resize listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  if (hasError && fallback) {
    return (
      <Box
        width={width}
        height={height}
        minHeight={typeof height === 'number' ? `${height}px` : height}
        className="chart-container chart-error"
        {...boxProps}
      >
        {fallback}
      </Box>
    );
  }

  if (showLoading) {
    return (
      <Box
        width={width}
        height={height}
        minHeight={typeof height === 'number' ? `${height}px` : height}
        className="chart-container chart-loading"
        {...boxProps}
      >
        <VStack spacing={2}>
          <Spinner size="lg" />
          <Text fontSize="sm" color="gray.500">
            Loading chart...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      width={width}
      height={height}
      minHeight={typeof height === 'number' ? `${height}px` : height}
      minWidth={typeof width === 'number' ? `${width}px` : width}
      className="chart-container"
      position="relative"
      {...boxProps}
    >
      {isReady && (
        <ResponsiveContainer
          key={key}
          width="100%"
          height="100%"
          minHeight={typeof height === 'number' ? height : undefined}
          minWidth={typeof width === 'number' ? width : undefined}
        >
          {children}
        </ResponsiveContainer>
      )}
    </Box>
  );
};
