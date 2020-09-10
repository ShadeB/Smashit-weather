const apiKey = '532425e25b21324eaa26b04d5260968c';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');

const displayMainForecast = (location, icon, status, temperature) => {
	const weatherLocation = document.querySelector('#weather-location');
	const weatherIcon = document.querySelector('#weather-icon');
	const weatherStatus = document.querySelector('#main-forecast-status');
	const tempDisplay = document.querySelector('#main-forecast-temperature');

	const iconLink = `http://openweathermap.org/img/wn/${icon}.png`;

	weatherLocation.textContent = location;
	weatherIcon.src = `${iconLink}`;
	weatherStatus.textContent = status;
	tempDisplay.textContent = temperature;
};

const displayHourlyForecast = (temperature, icon, imgAltText) => {
	const forecastContainer = document.querySelector(
		'#hourly-forecast-container'
	);

	const imageUrl = `http://openweathermap.org/img/wn/${icon}.png`;
	const forecastTime = 'Now';

	const temperatureDiv = `<div class = 'hourly-forecast-temp__container'>
      <p class = 'hourly-forecast__temperature'>${temperature}</p>
      <span class='hourly-forecast__units'><sup>o</sup>C</span>
    </div>`;

	const forecastImageDiv = `<div class='forecast-image__container'>
      <img src=${imageUrl} alt = '${imgAltText}'/>
    </div>`;

	const forecastTimeDiv = `<div class = 'hourly-forecast-time__container'>
      <p class = 'hourly-forecast__time'>${forecastTime}</p>
    </div>`;

	const hourlyForecastCard = `
  <div class = 'hourly-forecast__card'>
    ${temperatureDiv}
    ${forecastImageDiv}
    ${forecastTimeDiv}
  </div>`;

	forecastContainer.insertAdjacentHTML('beforeend', `${hourlyForecastCard}`);
};

const displayDailyForecast = (minTemp, maxTemp, icon, status, description) => {
	const forecastContainer = document.querySelector('#daily-forecast-container');

	const day = 'today';
	const imgAltText = `${description}`;
	const temperature = `${minTemp} / ${maxTemp}`;

	const imgUrl = `http://openweathermap.org/img/wn/${icon}.png`;

	const dailyForecastCard = `
  <div class = 'daily-forecast__card'>
    <p class = 'daily-forecast__day'>${day}</p>
    <img src='${imgUrl}' alt ='${imgAltText}'/>
    <p class='daily-forecast__description'>${status}</p>
    <p class='daily-forecast__temperature'>${temperature}</p>
  </div>`;

	forecastContainer.insertAdjacentHTML('beforeend', dailyForecastCard);
};

const getMoreData = ({ lon, lat }) => {
	const exclude = 'current,minutely';
	const units = 'metric';
	const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&
  exclude=${exclude}&appid=${apiKey}`;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			if (data) {
				for (const key in data.hourly) {
					let icon = data.hourly[key].weather[0].icon;
					let imgAltText = data.hourly[key].weather[0].description;
					let temperature = data.hourly[key].temp;
					displayHourlyForecast(temperature, icon, imgAltText);
				}

				for (const key in data.daily) {
					let minTemp = data.daily[key].temp.min;
					let maxTemp = data.daily[key].temp.max;
					let icon = data.daily[key].weather[0].icon;
					let status = data.daily[key].weather[0].main;
					let description = data.daily[key].weather[0].description;
					displayDailyForecast(minTemp, maxTemp, icon, status, description);
				}
			}
		})
		.catch((err) => console.log(err));
};

const citySearch = (e) => {
	e.preventDefault();
	const searchQuery = searchInput.value;
	const units = 'metric';

	const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&units=${units}&appid=${apiKey}`;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			if (data) {
				const { coord, main, name, sys, weather } = data;
				const country = sys.country;
				const location = `${name}, ${country}`;
				const temperature = main.temp;
				const status = weather[0].main;
				const icon = weather[0].icon;

				displayMainForecast(location, icon, status, temperature);
				getMoreData(coord);
			}
		})
		.catch((err) => console.log(err));
};

searchForm.addEventListener('submit', citySearch);
