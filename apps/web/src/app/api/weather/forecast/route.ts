import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // This would integrate with Met Office API or OpenWeather API
    // For demo purposes, we'll return mock weather data
    
    const weatherData = generateMockWeatherData(date);
    
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather forecast' },
      { status: 500 }
    );
  }
}

function generateMockWeatherData(date: string): any {
  const moveDate = new Date(date);
  const today = new Date();
  const daysDifference = Math.floor((moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate realistic weather data based on UK climate
  const weatherConditions = [
    { condition: 'Partly Cloudy', precipitation: 0.1, windSpeed: 12, temperature: 18 },
    { condition: 'Sunny', precipitation: 0, windSpeed: 8, temperature: 22 },
    { condition: 'Cloudy', precipitation: 0.3, windSpeed: 15, temperature: 16 },
    { condition: 'Light Rain', precipitation: 0.8, windSpeed: 18, temperature: 14 },
    { condition: 'Heavy Rain', precipitation: 2.1, windSpeed: 25, temperature: 12 },
    { condition: 'Stormy', precipitation: 3.5, windSpeed: 35, temperature: 10 },
    { condition: 'Foggy', precipitation: 0.2, windSpeed: 5, temperature: 15 },
  ];
  
  // Select weather based on days difference and add some randomness
  const baseIndex = daysDifference % weatherConditions.length;
  const randomVariation = Math.random() * 0.3 - 0.15; // ±15% variation
  
  const selectedWeather = weatherConditions[baseIndex];
  
  return {
    condition: selectedWeather.condition,
    temperature: Math.round(selectedWeather.temperature + (selectedWeather.temperature * randomVariation)),
    precipitation: Math.max(0, selectedWeather.precipitation + (selectedWeather.precipitation * randomVariation)),
    windSpeed: Math.max(0, selectedWeather.windSpeed + (selectedWeather.windSpeed * randomVariation)),
    warning: selectedWeather.precipitation > 2 || selectedWeather.windSpeed > 30,
    date: date,
    forecast: {
      morning: {
        condition: selectedWeather.condition,
        temperature: Math.round(selectedWeather.temperature - 2),
        precipitation: Math.max(0, selectedWeather.precipitation * 0.8),
      },
      afternoon: {
        condition: selectedWeather.condition,
        temperature: selectedWeather.temperature,
        precipitation: selectedWeather.precipitation,
      },
      evening: {
        condition: selectedWeather.condition,
        temperature: Math.round(selectedWeather.temperature - 3),
        precipitation: Math.max(0, selectedWeather.precipitation * 1.2),
      },
    },
  };
}
