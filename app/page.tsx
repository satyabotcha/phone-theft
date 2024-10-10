"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';
import MatrixBackground from "@/components/ui/matrixBackground";
import { getLatitudeAndLongitude, getCrimeData, getPostcodeFromLatLong } from "@/utils/api";
import getPhoneStolenLikelihood from "@/utils/crimeRatio";
import { Twitter, MessageCircle, MessageSquare } from 'lucide-react';

// Dynamically import the MapPage component to avoid SSR issues
const MapPage = dynamic(() => import('../components/ui/map'), { ssr: false });

export default function Home() {
  // State variables for managing user input, crime data, and UI state
  const [postcode, setPostcode] = useState("");
  const [crimeData, setCrimeData] = useState([]);
  const [error, setError] = useState("")
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [shareText, setShareText] = useState('');

  // Ref for the postcode input field
  const postcodeRef = useRef<HTMLInputElement>(null);

  // Function to get and process the user's current location
  function getCurrentPosition() {
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ latitude, longitude });
        try {
          // Get postcode from coordinates and update UI
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
      setError("")
    } 
    catch (error) {
      setError("Please enter a valid UK postcode")
    }
  }

  // Effect to update share text when crime data changes
  useEffect(() => {
    if (crimeData.length > 0) {
      const risk = getPhoneStolenLikelihood(crimeData.length);
      // Construct share text with emojis and risk level
      const text = `Is Your Phone at Risk? \u{1F4F1}\u{1F6A8}\n\n` +
        `I just checked my phone theft risk on IsMyPhoneSafe – it's ${risk} in my area!\n\n` +
        `\u{1F517} What about you? https://ismyphonesafe.co.uk`;
      setShareText(text);
    }
  }, [crimeData, postcode]);

  // Function to handle sharing on different platforms
  const handleShare = (platform: 'twitter' | 'whatsapp' | 'imessage') => {
    const encodedText = encodeURIComponent(shareText);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      imessage: `sms:&body=${encodedText}`
    };
    window.open(urls[platform], '_blank');
  };

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

              {/* Sharing Card */}
              <Card className="bg-cyber-black border-matrix-green shadow-neon-glow">
                <CardHeader>
                  <CardTitle className="text-xl text-center text-matrix-green mb-4">
                    Help Your Friends Keep Their Phone Safe
                  </CardTitle>
                  <div className="flex justify-center space-x-4">
                    {/* Share buttons for different platforms */}
                    <Button
                      onClick={() => handleShare('twitter')}
                      className="bg-cyber-black border-matrix-green hover:bg-matrix-green hover:text-cyber-black text-matrix-green font-bold shadow-neon-glow p-2"
                    >
                      <Twitter className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => handleShare('whatsapp')}
                      className="bg-cyber-black border-matrix-green hover:bg-matrix-green hover:text-cyber-black text-matrix-green font-bold shadow-neon-glow p-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => handleShare('imessage')}
                      className="bg-cyber-black border-matrix-green hover:bg-matrix-green hover:text-cyber-black text-matrix-green font-bold shadow-neon-glow p-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}