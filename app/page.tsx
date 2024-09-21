"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';

const MapPage = dynamic(() => import('../components/ui/map'), { ssr: false });

// Reference data for Soho crime statistics
const SohoCrimeData = {
  // Hardcode for now
  // Postcode: W1D 4EB
  // Last checked: July, 2024
  numberOfCrimes: 41,
}

export default function Home() {
  // State variables
  const [postcode, setPostcode] = useState("");
  const [crimeData, setCrimeData] = useState([]);
  const [error, setError] = useState("")
  const [matrixChars, setMatrixChars] = useState<string[][]>([]);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);

  function getCurrentPosition() {
    setError("");
    setUsingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ latitude, longitude });
        try {
          const crimeData = await getCrimeData(latitude, longitude);
          setCrimeData(crimeData);
        } catch (error) {
          setError("Failed to fetch crime data");
        }
      },
      (error) => {
        setError("Failed to get your location. Please enter a postcode.");
        setUsingCurrentLocation(false);
      }
    );
  }

  // Effect to generate matrix characters for background animation
  useEffect(() => {
    const chars = Array(100).fill(0).map(() => 
      Array(25).fill(0).map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94)))
    );
    setMatrixChars(chars);
  }, []);

  // Function to get latitude and longitude from postcode
  async function getLatitudeAndLongitude(postcode: string) {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    const data = await response.json();
    if (data.status === 200) {
      return {
        latitude: data.result.latitude,
        longitude: data.result.longitude,
      };
    } else {
      throw new Error("Invalid postcode");
    }
  }

  // Function to fetch crime data based on latitude and longitude
  async function getCrimeData(latitude: number, longitude: number) {
    const response = await fetch(`https://data.police.uk/api/crimes-street/theft-from-the-person?lat=${latitude}&lng=${longitude}`);
    const data = await response.json();
    return data;
  }

  // Handler for form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (usingCurrentLocation) {
      getCurrentPosition();
      return;
    }
    if (!postcode.trim()) {
      setError("Please enter a postcode.")
      return
    }

    setError("")

    try {
      const { latitude, longitude } = await getLatitudeAndLongitude(postcode);
      setMapCenter({ latitude, longitude });
      const crimeData = await getCrimeData(latitude, longitude);
      setCrimeData(crimeData);
    } catch (error) {
      setError("Please enter a valid postcode")
    }
  }

  // Function to determine likelihood of phone theft based on crime data
  function getPhoneStolenLikelihood(thefts: number) {
    const crimeRatio = thefts / SohoCrimeData.numberOfCrimes;
    if (crimeRatio >= 0.5) return "High";
    if (crimeRatio >= 0.25) return "Moderate";
    return "Low";
  }

  return (
    <>
      <div className="min-h-screen bg-cyber-black text-matrix-green py-8 px-4 sm:px-6 lg:px-8 font-matrix relative overflow-hidden">
        {/* Matrix background animation */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {matrixChars.map((column, i) => (
            <div key={i} className="absolute text-matrix-green text-opacity-75 animate-matrix-rain" 
                 style={{
                   left: `${i}%`, 
                   animationDuration: `${15 + Math.random() * 10}s`,
                   animationDelay: `${-Math.random() * 15}s`
                 }}>
              {column.map((char, j) => (
                <div key={j} className="text-sm">{char}</div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-5xl font-bold text-center mb-4 text-matrix-green font-matrix tracking-wider">Is my phone safe?</h1>
          <h2 className="text-2xl text-center mb-8 text-matrix-green font-matrix">Check how likely your phone will be stolen in your area</h2>
          
          {/* Postcode input form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Enter your postcode"
                  value={usingCurrentLocation ? "Current Location" : postcode}
                  onChange={(e) => {
                    setPostcode(e.target.value); 
                    setUsingCurrentLocation(false);
                  }}
                  className={`flex-grow bg-cyber-black text-matrix-green border-matrix-green placeholder-matrix-green placeholder-opacity-50 focus:ring-matrix-green text-base sm:text-sm ${error ? 'border-red-500' : ''}`}
                  style={{ fontSize: 'max(16px, 1rem)' }}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'postcode-error' : undefined}
                />
                <Button type="submit" className="bg-neon-purple hover:bg-purple-700 text-cyber-black font-bold shadow-purple-glow w-full sm:w-auto">SCAN</Button>
              </div>
              {error && (
                <p id="postcode-error" className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>
          </form>

          {/* Display crime data results */}
          {crimeData.length > 0 && (
            <div className="space-y-8">
              {/* Phone Theft Likelihood Card */}
              <Card className="bg-cyber-black border-matrix-green shadow-neon-glow">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-matrix-green">
                    Phone Theft Likelihood: <span className="text-cyber-yellow font-bold">
                    {getPhoneStolenLikelihood(crimeData.length)}
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Map */}
              <Card className="bg-cyber-black border-matrix-green shadow-neon-glow">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center text-matrix-green">
                      Phone Theft Hotspots
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MapPage 
                  crimeData={crimeData}
                  mapCenter={mapCenter ?? { latitude: 0, longitude: 0 }}
                />
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
