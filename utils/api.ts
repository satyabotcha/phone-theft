
// convert postcode to latitude and longitude
export async function getLatitudeAndLongitude(postcode: string) {
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
  
  // fetch crime data based on latitude and longitude
  export async function getCrimeData(latitude: number, longitude: number) {
    const response = await fetch(`https://data.police.uk/api/crimes-street/theft-from-the-person?lat=${latitude}&lng=${longitude}`);
    const data = await response.json();
    return data;
  }
  
  // Get postcode from latitude and longitude, if the user's is using browser location
  export async function getPostcodeFromLatLong(latitude: number, longitude: number) {
    const response = await fetch(`https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}`);
    const data = await response.json();
    if (data.status === 200 && data.result.length > 0) {
      return data.result[0].postcode;
    } else {
      throw new Error("Failed to fetch postcode");
    }
  }