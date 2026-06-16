let mapCoords = null;
let data = null;

const getMockData = (town, lang, days, lat, lon) => {
  const displayTown = town === "Auto Location" ? "Nairobi, Kenya" : town;
  let finalLat = lat || -1.2921;
  let finalLon = lon || 36.8219;
  return { location: { name: displayTown, lat: finalLat, lon: finalLon } };
};

// 1. Auto Location
data = getMockData("Auto Location", "en", 7);
if (data?.location?.lat !== undefined) {
  mapCoords = [data.location.lat, data.location.lon];
}
console.log("After auto location:", mapCoords, data.location.name);

// 2. User searches Kisumu via Autocomplete
let option = { value: JSON.stringify({ town: "Kisumu, Kenya", lat: -0.1022, lon: 34.7617 }) };
let parsed = JSON.parse(option.value);
data = getMockData(parsed.town, "en", 7, parsed.lat, parsed.lon);
if (data?.location?.lat !== undefined) {
  mapCoords = [data.location.lat, data.location.lon];
}
console.log("After Kisumu search:", mapCoords, data.location.name);
