'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import MobileChatWrapper from './MobileChatWrapper';

export default function GuestChatWrapper() {
  const { data: session, status } = useSession();

  // Don't show guest chat widget if user is authenticated
  if (status === 'loading') {
    return null;
  }

  if (session?.user) {
    return null;
  }

  // Show mobile chat wrapper for guest users
  return <MobileChatWrapper isGuest={true} position="bottom-right" />;
}
