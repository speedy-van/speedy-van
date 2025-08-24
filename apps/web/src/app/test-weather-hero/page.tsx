import { Metadata } from 'next';
import { WeatherHero } from '../../components/WeatherHero';

export const metadata: Metadata = {
  title: "Test Weather Hero | Speedy Van",
  description: "Testing the weather-aware hero component",
};

export default function TestWeatherHeroPage() {
  return (
    <div>
      <WeatherHero />
      
      {/* Additional test content */}
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        background: '#1a1a1a', 
        color: 'white',
        minHeight: '50vh'
      }}>
        <h2>Weather Hero Test Page</h2>
        <p>This page tests the WeatherHero component with:</p>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>✅ Auto location detection</li>
          <li>✅ Weather API integration</li>
          <li>✅ Dynamic sky backgrounds</li>
          <li>✅ Weather-aware messaging</li>
          <li>✅ SEO-friendly content rotation</li>
          <li>✅ iOS Weather app styling</li>
          <li>✅ Responsive design</li>
        </ul>
      </div>
    </div>
  );
}
