document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("cityInput");
  const statusMsg = document.getElementById("statusMessage");
  const resultCard = document.getElementById("weatherResult");

  searchBtn.addEventListener("click", handleSearch);
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
      showError("Please enter a city name.");
      return;
    }
    fetchWeatherData(city);
  }

  async function fetchWeatherData(query) {
    try {
      showLoading();

      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geoUrl);

      if (!geoResponse.ok) {
        throw new Error("Could not fetch data. Please try again.");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Location not found. Please try another city.");
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        throw new Error("Could not fetch data. Please try again.");
      }

      const weatherData = await weatherResponse.json();

      if (!weatherData.current) {
        throw new Error("Could not fetch data. Please try again.");
      }

      renderUI(name, country || "", weatherData.current);

    } catch (error) {
      showError(error.message || "Could not fetch data. Please try again.");
    }
  }

  function getWeatherCondition(code) {
    const wmoCodes = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing Rime Fog",
      51: "Light Drizzle",
      53: "Moderate Drizzle",
      55: "Dense Drizzle",
      61: "Slight Rain",
      63: "Moderate Rain",
      65: "Heavy Rain",
      80: "Slight Rain Showers",
      81: "Moderate Rain Showers",
      82: "Violent Rain Showers",
      95: "Thunderstorm"
    };
    return wmoCodes[code] || "Variable Weather";
  }

  function renderUI(cityName, country, current) {
    statusMsg.classList.add("hidden");

    document.getElementById("cityName").textContent = cityName;
    document.getElementById("countryName").textContent = country ? country : "N/A";
    document.getElementById("temperature").textContent = `${current.temperature_2m} °C`;
    document.getElementById("weatherCond").textContent = getWeatherCondition(current.weather_code);
    document.getElementById("wind").textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById("windDir").textContent = `${current.wind_direction_10m}°`;

    resultCard.classList.remove("hidden");
  }

  function showError(msg) {
    resultCard.classList.add("hidden");
    statusMsg.textContent = msg;
    statusMsg.className = "status-msg error";
    statusMsg.classList.remove("hidden");
  }

  function showLoading() {
    resultCard.classList.add("hidden");
    statusMsg.textContent = "Fetching weather information...";
    statusMsg.className = "status-msg info";
    statusMsg.classList.remove("hidden");
  }
});
