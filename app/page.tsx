"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';
import MatrixBackground from "@/components/ui/matrixBackground";
import { getLatitudeAndLongitude, getCrimeData, getPostcodeFromLatLong } from "@/utils/api";
import getPhoneStolenLikelihood from "@/utils/crimeRatio";

// Dynamically import the MapPage component to avoid SSR issues
const MapPage = dynamic(() => import('../components/ui/map'), { ssr: false });

export default function Home() {
  // State variables for managing user input, crime data, and UI state
  const [postcode, setPostcode] = useState("");
  const [crimeData, setCrimeData] = useState([]);
  const [error, setError] = useState("")
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);

  const postcodeRef = useRef<HTMLInputElement>(null);

  // Function to get and process the user's current location
  function getCurrentPosition() {
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ latitude, longitude });
        try {
          const locationPostcode = await getPostcodeFromLatLong(latitude, longitude);
          setPostcode(locationPostcode);
          if (postcodeRef.current) {
            postcodeRef.current.value = locationPostcode;
          }
          handleSubmit(null);
        } catch (error) {
          setError("Failed to get postcode from location");
        }
      },
      (error) => {
        setError("Failed to get your location. Please enter a postcode.");
        console.log(error);
      }
    );
  }

  // Handler for form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement> | null) {
    if (e) e.preventDefault();

    const postcodeSubmitted = postcodeRef.current?.value ?? '';

    if (!postcodeSubmitted.trim()) {
      setError("Please enter a postcode.");
      return;
    }

    try {
      // Fetch latitude and longitude from postcode, then get crime data
      const { latitude, longitude } = await getLatitudeAndLongitude(postcodeSubmitted);
      setMapCenter({ latitude, longitude });
      const crimeData = await getCrimeData(latitude, longitude);
      setCrimeData(crimeData);
      setPostcode(postcodeSubmitted); // Update state after successful API call
      console.log(crimeData)
    } 
    catch (error) {
      setError("Please enter a valid UK postcode")
    }
  }

  return (
    <>
      {/* Main container with cyberpunk-inspired styling */}
      <div className="min-h-screen bg-cyber-black text-matrix-green py-8 px-4 sm:px-6 lg:px-8 font-matrix relative overflow-hidden">
        {/* Animated matrix background */}
        <MatrixBackground />
        
        {/* Content container */}
        <div className="max-w-3xl mx-auto relative z-10">
          {/* Page title and description */}
          <h1 className="text-4xl font-bold text-center mb-4 text-matrix-green font-matrix tracking-wider">Is my phone safe in London?</h1>
          <h2 className="text-2xl text-center mb-8 text-matrix-green font-matrix">Check how likely your phone will be stolen in your area</h2>
          
          {/* Postcode input form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Postcode input field */}
                <Input
                  type="text"
                  placeholder="Enter your postcode"
                  ref={postcodeRef}
                  className={`flex-grow bg-cyber-black text-matrix-green border-matrix-green placeholder-matrix-green placeholder-opacity-50 focus:ring-matrix-green text-base sm:text-sm w-full sm:w-auto ${error ? 'border-red-500' : ''}`}
                  style={{ fontSize: 'max(16px, 1rem)' }}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'postcode-error' : undefined}
                />
                {/* Action buttons */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    onClick={getCurrentPosition} 
                    className="bg-neon-green hover:bg-green-700 text-cyber-black font-bold shadow-green-glow flex-grow sm:flex-grow-0"
                  >
                    CURRENT LOCATION
                  </Button>
                  <Button type="submit" className="bg-neon-purple hover:bg-purple-700 text-cyber-black font-bold shadow-purple-glow flex-grow sm:flex-grow-0">SCAN</Button>
                </div>
              </div>
              {/* Error message display */}
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

              {/* Map component to display crime data */}
              <MapPage 
                crimeData={crimeData}
                mapCenter={mapCenter ?? { latitude: 0, longitude: 0 }}
                postcode={postcode}
              />

            </div>
          )}
        </div>
      </div>
    </>
  );
}