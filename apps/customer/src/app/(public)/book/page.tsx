import { redirect } from 'next/navigation';

// DEPRECATED: This booking flow has been replaced by the advanced 9-step booking flow.
// Redirecting to the new booking experience.
export default function BookPage() {
  redirect('/booking');
}
