import { Metadata } from 'next';
import Hero from '../../components/Hero';

export const metadata: Metadata = {
  title: "Test Rotating Messages | Speedy Van",
  description: "Test the rotating message system for the Hero component",
};

export default function TestRotatingMessagesPage() {
  return (
    <div>
      <Hero />
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Rotating Message System Test</h2>
        <p>This page demonstrates the rotating message system with UK-specific marketing phrases.</p>
        <p>The messages change every 3 seconds and include realistic city pairs and competitive prices.</p>
      </div>
    </div>
  );
}
