// Dynamically import Pusher only in the browser to avoid bundling it server-side

// Validate client-side Pusher configuration
const validatePusherConfig = () => {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  
  if (!key) {
    console.error('NEXT_PUBLIC_PUSHER_KEY is not configured');
    return false;
  }
  
  if (!cluster) {
    console.error('NEXT_PUBLIC_PUSHER_CLUSTER is not configured');
    return false;
  }
  
  // Pusher keys should not start with 'pk_live_' (that's Stripe)
  if (key.startsWith('pk_live_') || key.startsWith('pk_test_')) {
    console.error('Invalid Pusher key detected. You may be using a Stripe key instead of a Pusher key.');
    return false;
  }
  
  return true;
};

// Create a Pusher instance with proper configuration
export const createPusherClient = async (options?: {
  authEndpoint?: string;
  auth?: any;
}) => {
  if (typeof window === 'undefined') {
    throw new Error('Pusher client can only be initialized in the browser');
  }
  if (!validatePusherConfig()) {
    throw new Error('Invalid Pusher configuration. Please check your environment variables.');
  }

  const { default: Pusher } = await import('pusher-js');
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    ...options,
  });
};

// Create a Pusher instance for public channels (no auth required)
export const createPublicPusherClient = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Pusher client can only be initialized in the browser');
  }
  if (!validatePusherConfig()) {
    throw new Error('Invalid Pusher configuration. Please check your environment variables.');
  }

  const { default: Pusher } = await import('pusher-js');
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
  });
};
