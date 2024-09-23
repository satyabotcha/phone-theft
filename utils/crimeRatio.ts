// Reference data for Soho crime statistics
const SohoCrimeData = {
    // Hardcode for now
    // Postcode: W1D 4EB
    // Last checked: July, 2024
    numberOfCrimes: 41,
}


// determine likelihood of phone theft based on crime data
export default function getPhoneStolenLikelihood(thefts: number) {
    const crimeRatio = thefts / SohoCrimeData.numberOfCrimes;
    if (crimeRatio >= 0.5) return "High";
    if (crimeRatio >= 0.25) return "Moderate";
    return "Low";
  }