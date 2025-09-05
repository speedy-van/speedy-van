'use client';

import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  Select,
  useToast,
  Card,
  CardBody,
  Heading,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

interface RatingFormProps {
  bookingId: string;
  driverName?: string;
  jobCode?: string;
  onSuccess?: () => void;
}

export default function RatingForm({
  bookingId,
  driverName,
  jobCode,
  onSuccess,
}: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [category, setCategory] = useState('overall');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          review: review.trim() || null,
          category,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Thank you for your feedback!',
          description: 'Your rating has been submitted successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onSuccess?.();
      } else {
        const error = await response.json();
        toast({
          title: 'Error submitting rating',
          description: error.error || 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error submitting rating',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array(5)
      .fill('')
      .map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hoverRating || rating);

        return (
          <StarIcon
            key={i}
            boxSize={8}
            color={isFilled ? 'yellow.400' : 'gray.300'}
            cursor="pointer"
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            transition="color 0.2s"
          />
        );
      });
  };

  return (
    <Card maxW="md" mx="auto">
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="md" mb={2}>
              Rate Your Experience
            </Heading>
            {driverName && (
              <Text color="gray.600" mb={1}>
                Driver: {driverName}
              </Text>
            )}
            {jobCode && (
              <Text color="gray.600" fontSize="sm">
                Job #{jobCode}
              </Text>
            )}
          </Box>

          <Box textAlign="center">
            <Text mb={3}>How would you rate your experience?</Text>
            <HStack justify="center" spacing={2}>
              {renderStars()}
            </HStack>
            {rating > 0 && (
              <Text mt={2} fontSize="sm" color="gray.600">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </Text>
            )}
          </Box>

          <FormControl>
            <FormLabel>Rating Category</FormLabel>
            <Select
              value={category}
              onChange={e => setCategory(e.target.value)}
              suppressHydrationWarning
            >
              <option value="overall">Overall Experience</option>
              <option value="communication">Communication</option>
              <option value="punctuality">Punctuality</option>
              <option value="care">Care with Items</option>
              <option value="professionalism">Professionalism</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Additional Comments (Optional)</FormLabel>
            <Textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              maxLength={500}
            />
            <Text fontSize="xs" color="gray.500" textAlign="right">
              {review.length}/500
            </Text>
          </FormControl>

          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText="Submitting..."
            isDisabled={rating === 0}
            size="lg"
          >
            Submit Rating
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
