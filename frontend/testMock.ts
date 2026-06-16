import { fetchForecast } from "./src/lib/api.js";

fetchForecast("Bomet", { lat: undefined, lon: undefined }).then(res => {
  console.log("Mock Bomet (no coords):", res.location);
});

fetchForecast("Kisumu, Kenya", { lat: -0.1, lon: 34.7 }).then(res => {
  console.log("Mock Kisumu (with coords):", res.location);
});
