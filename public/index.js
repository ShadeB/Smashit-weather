const apiKey = '532425e25b21324eaa26b04d5260968c';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');

const displayMainForecast = (location, icon, status, temperature) => {
	const weatherLocation = document.querySelector('#weather-location');
	const weatherIcon = document.querySelector('#weather-icon');
	const weatherStatus = document.querySelector('#main-forecast-status');
	const tempDisplay = document.querySelector('#main-forecast-temperature');

	const iconLink = `https://openweathermap.org/img/wn/${icon}.png`;

	weatherLocation.textContent = location;
	weatherIcon.src = `${iconLink}`;
	weatherStatus.textContent = status;
	tempDisplay.textContent = temperature;
};

const displayHourlyForecast = (time, temperature, icon, imgAltText) => {
	const forecastContainer = document.querySelector(
		'#hourly-forecast-container'
	);

	const imageUrl = `https://openweathermap.org/img/wn/${icon}.png`;

	const temperatureDiv = `<div class = 'hourly-forecast-temp__container'>
      <p class = 'hourly-forecast__temperature'>${temperature}</p>
      <span class='hourly-forecast__units'><sup>o</sup>C</span>
    </div>`;

	const forecastImageDiv = `<div class='forecast-image__container'>
      <img src=${imageUrl} alt = '${imgAltText}'/>
    </div>`;

	const forecastTimeDiv = `<div class = 'hourly-forecast-time__container'>
      <p class = 'hourly-forecast__time'>${time}</p>
    </div>`;

	const hourlyForecastCard = `
  <div class = 'hourly-forecast__card'>
    ${temperatureDiv}
    ${forecastImageDiv}
    ${forecastTimeDiv}
  </div>`;

	forecastContainer.insertAdjacentHTML('beforeend', `${hourlyForecastCard}`);
};

const displayDailyForecast = (
	day,
	minTemp,
	maxTemp,
	icon,
	status,
	description
) => {
	const forecastContainer = document.querySelector('#daily-forecast-container');

	const imgAltText = `${description}`;
	const temperature = `${minTemp} / ${maxTemp}`;
	const imgUrl = `https://openweathermap.org/img/wn/${icon}.png`;

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
	const hourlyForecastContainer = document.querySelector(
		'#hourly-forecast-container'
	);
	const dailyForecastContainer = document.querySelector(
		'#daily-forecast-container'
	);
	const exclude = 'current,minutely';
	const units = 'metric';
	const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&
  exclude=${exclude}&appid=${apiKey}`;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			if (data) {
				hourlyForecastContainer.innerHTML = '';
				dailyForecastContainer.innerHTML = '';

				let daysArray = [
					'Sunday',
					'Monday',
					'Tuesday',
					'Wednesday',
					'Thursday',
					'Friday',
					'Saturday'
				];
				for (const key in data.hourly) {
					let icon = data.hourly[key].weather[0].icon;
					let imgAltText = data.hourly[key].weather[0].description;
					let temperature = data.hourly[key].temp;

					let timestamp = data.hourly[key].dt;
					let currentDate = new Date(timestamp * 1000);
					let hours = currentDate.getHours();
					let minutes = currentDate.getMinutes();
					let seconds = currentDate.getSeconds();
					let fullTime = `${hours}:${minutes}${seconds}`;
					let time;
					time = key == 0 ? 'now' : `${fullTime}`;

					displayHourlyForecast(time, temperature, icon, imgAltText);
				}

				for (const key in data.daily) {
					let minTemp = data.daily[key].temp.min;
					let maxTemp = data.daily[key].temp.max;
					let icon = data.daily[key].weather[0].icon;
					let status = data.daily[key].weather[0].main;
					let description = data.daily[key].weather[0].description;

					let timestamp = data.daily[key].dt;
					let currentDate = new Date(timestamp * 1000);
					let dayOfWeek = daysArray[currentDate.getDay()];
					let day;
					let getDayOfWeek = dayOfWeek.substring(0, 3);
					day = key == 0 ? 'Today' : `${getDayOfWeek}`;

					displayDailyForecast(
						day,
						minTemp,
						maxTemp,
						icon,
						status,
						description
					);
				}
			}
		})
		.catch((err) => console.log(err));
};

const getFromLocalStorage = (searchQuery) => {
	return localStorage.getItem(searchQuery)
		? JSON.parse(localStorage.getItem(searchQuery))
		: [];
};

const AddToLocalStorage = (searchQuery, data) => {
	localStorage.setItem(searchQuery, JSON.stringify(data));
};

const fetchWeather = (searchQuery) => {
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
				AddToLocalStorage(searchQuery, data);
			}
		})
		.catch((err) => console.log(err));
};

const getData = (searchQuery) => {
	const data = getFromLocalStorage(searchQuery);

	if (data.length === 0) {
		fetchWeather(searchQuery);
	} else {
		const { coord, main, name, sys, weather } = data;
		const country = sys.country;
		const location = `${name}, ${country}`;
		const temperature = main.temp;
		const status = weather[0].main;
		const icon = weather[0].icon;

		displayMainForecast(location, icon, status, temperature);
		getMoreData(coord);
	}
};

const searchFormSubmit = (e) => {
	const searchQuery = searchInput.value;
	e.preventDefault();
	getData(searchQuery);
};

searchForm.addEventListener('submit', searchFormSubmit);
window.addEventListener('onload', getData('New York'));

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('service-worker.js')
			.then((register) => {
				console.log('Service worker registration successful');
			})
			.catch((err) => {
				console.log('Service worker registration failed', err);
			});
	});
}
