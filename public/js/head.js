// Function to update date and time
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('datetime').innerHTML = `
      <img src="/img/icon/header_icon1.png" alt="" />${dateString}, ${timeString}
    `;
  }
  
  // Function to fetch weather data
  async function updateWeather() {
    try {
      const apiKey = 'f334658605ef3be6ea6d8a8e2041eb29'; 
      const city = 'Hanoi'; 
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      const temperature = Math.round(data.main.temp); 
      const weatherCondition = data.weather[0].description;
      
      document.getElementById('temperature').innerHTML = `
        <img src="/img/icon/header_icon1.png" alt="" />${temperature}ºC, ${weatherCondition.charAt(0).toUpperCase() + weatherCondition.slice(1)}
      `;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      document.getElementById('temperature').innerHTML = `
        <img src="/img/icon/header_icon1.png" alt="" />Unable to fetch weather
      `;
    }
  }
  
  // Initialize updates
  function initializeUpdates() {
    updateDateTime(); 
    setInterval(updateDateTime, 1000); 
    
    updateWeather(); 
    setInterval(updateWeather, 600000); 
  }
  
  window.onload = initializeUpdates;
  