const getMockData = (town, lang, days, lat, lon) => {
  const isSw = lang === 'sw';
  const displayTown = town === "Auto Location" ? "Nairobi, Kenya" : town;

  let finalLat = lat || -1.2921;
  let finalLon = lon || 36.8219;
  if (!lat && town) {
     const t = town.toLowerCase();
     if (t.includes("mombasa")) { finalLat = -4.0435; finalLon = 39.6682; }
     else if (t.includes("kisumu")) { finalLat = -0.1022; finalLon = 34.7617; }
     else if (t.includes("eldoret")) { finalLat = 0.5143; finalLon = 35.2698; }
     else if (t.includes("bomet")) { finalLat = -0.7813; finalLon = 35.3416; }
  }
  
  return {
    location: {
      name: displayTown,
      lat: finalLat,
      lon: finalLon
    }
  };
};

console.log(getMockData("Bomet", "en", 7, undefined, undefined));
console.log(getMockData("Bomet", "en", 7, -0.7813, 35.3416));
console.log(getMockData("Bomet, Bomet County, Kenya", "en", 7, undefined, undefined));
