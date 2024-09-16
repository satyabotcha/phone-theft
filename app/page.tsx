"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 

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
    if (!postcode.trim()) {
      setError("Please enter a postcode.")
      console.log(error)
      return
    }

    setError("")

    try {
      const { latitude, longitude } = await getLatitudeAndLongitude(postcode);
      const crimeData = await getCrimeData(latitude, longitude);
      setCrimeData(crimeData);
      
    } catch (error) {
      setError("An error occurred. Please check your postcode and try again.")
    }
  }

  // Function to determine likelihood of phone theft based on crime data
  function getPhoneStolenLikelihood(thefts: number) {
    const crimeRatio = thefts / SohoCrimeData.numberOfCrimes;
    if (crimeRatio >= 0.75) return "Very High";
    if (crimeRatio >= 0.5) return "High";
    if (crimeRatio >= 0.25) return "Moderate";
    return "Low";
  }

  return (
    <div className="min-h-screen bg-cyber-black text-matrix-green py-8 px-4 sm:px-6 lg:px-8 font-matrix relative overflow-hidden">
      {/* Matrix background animation */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {matrixChars.map((column, i) => (
          <div key={i} className="absolute text-matrix-green text-opacity-75 animate-matrix-rain" 
               style={{
                 left: `${i}%`, 
                 animationDuration: `${5 + Math.random() * 5}s`,
                 animationDelay: `${-Math.random() * 5}s`
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
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter your postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="flex-grow bg-cyber-black text-matrix-green border-matrix-green placeholder-matrix-green placeholder-opacity-50 focus:ring-matrix-green"
            />
            <Button type="submit" className="bg-neon-purple hover:bg-purple-700 text-cyber-black font-bold shadow-purple-glow">SCAN</Button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Your Area Crime Data Card */}
              <Card className="bg-cyber-black border-matrix-green shadow-neon-glow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-matrix-green">
                    Your Area
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-neon-purple">{crimeData.length}</p>
                  <p className="text-sm text-matrix-green opacity-70">Phone Thefts (Last Month)</p>
                </CardContent>
              </Card>

              {/* Soho (Highest Risk Area) Crime Data Card */}
              <Card className="bg-cyber-black border-matrix-green shadow-neon-glow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-matrix-green">
                    Soho (Highest Risk Area)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-cyber-yellow">{SohoCrimeData.numberOfCrimes}</p>
                  <p className="text-sm text-matrix-green opacity-70">Phone Thefts (Last Month)</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
