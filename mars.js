const API_KEY = 'DEMO_KEY';
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;

const previousWeatherToggle = document.querySelector('.show-previous-weather');
const previousWeather = document.querySelector('.previous-weather');
previousWeatherToggle.addEventListener('click', () => {
	previousWeather.classList.toggle('show-weather');
});

const currentSolElement = document.querySelector('[data-current-sol]');
const currentDateElement = document.querySelector('[data-current-date]');
const currentTempHighElement = document.querySelector('[data-current-temp-high]');
const currentTempLowElement = document.querySelector('[data-current-temp-low]');
const WindSpeedElement = document.querySelector('[data-wind-speed]');
const windDirectionArrow = document.querySelector('[data-wind-direction-arrow]');
const windDirectionText = document.querySelector('[data-wind-direction-text]');

const previousDataSolTemplate = document.querySelector('[data-previous-template-sol]');
const previousDataContainer = document.querySelector('[data-previous-sols]');

const unitToggle = document.querySelector('[data-unit-toggle]');
const celMetric = document.getElementById('cel');
const fahMetric = document.getElementById('fah');

let selectedSolIndex;

getweather().then((sols) => {
	selectedSolIndex = sols.length - 1;
	displaySelectedSol(sols);
	displayPreviousSol(sols);
	updateUnits();

	unitToggle.addEventListener('click', () => {
		let metricPlus = !isMetric();
		celMetric.checked = metricPlus;
		fahMetric.checked = !metricPlus;
		displaySelectedSol(sols);
		displayPreviousSol(sols);
		updateUnits();
	});

	celMetric.addEventListener('change', () => {
		displaySelectedSol(sols);
		displayPreviousSol(sols);
		updateUnits();
	});

	fahMetric.addEventListener('change', () => {
		displaySelectedSol(sols);
		displayPreviousSol(sols);
		updateUnits();
	});
});

function displaySelectedSol(sols) {
	const selectedSol = sols[selectedSolIndex];
	currentSolElement.innerText = selectedSol.sol;
	currentDateElement.innerText = displayDate(selectedSol.date);
	currentTempHighElement.innerText = displayTemp(selectedSol.maxTemp);
	currentTempLowElement.innerText = displayTemp(selectedSol.minTemp);
	WindSpeedElement.innerText = displaySpeed(selectedSol.windSpeed);
	windDirectionArrow.style.setProperty('--direction', `${selectedSol.windDirection}deg`);
	windDirectionText.innerText = selectedSol.windDirectionCardinal;
}

function displayPreviousSol(sols) {
	previousDataContainer.innerHTML = '';
	sols.forEach((solData, index) => {
		const solContainer = previousDataSolTemplate.content.cloneNode(true);
		solContainer.querySelector('[data-sol]').innerText = solData.sol;
		solContainer.querySelector('[data-date]').innerText = displayDate(solData.date);
		solContainer.querySelector('[data-temp-high]').innerText = displayTemp(solData.maxTemp);
		solContainer.querySelector('[data-temp-low]').innerText = displayTemp(solData.minTemp);
		solContainer.querySelector('[data-select-button]').addEventListener('click', () => {
			selectedSolIndex = index;
			displaySelectedSol(sols);
		});
		previousDataContainer.appendChild(solContainer);
	});
}

function displayDate(date) {
	return date.toLocaleString(undefined, { day: 'numeric', month: 'long' });
}

function displayTemp(temperature) {
	let returnTemp = temperature;
	if (!isMetric()) {
		returnTemp = (temperature - 32) * (5 / 9);
	}
	return Math.round(returnTemp);
}

function displaySpeed(speed) {
	let returnSpeed = speed;
	if (!isMetric()) {
		returnSpeed = speed / 1.608;
	}

	return Math.round(returnSpeed);
}

function getweather() {
	return fetch(API_URL).then((res) => res.json()).then((data) => {
		const { sol_keys, validity_checks, ...solData } = data;
		return Object.entries(solData).map(([ sol, data ]) => {
			return {
				sol: sol,
				maxTemp: data.AT.mx,
				minTemp: data.AT.mn,
				windSpeed: data.HWS.av,
				windDirection: data.WD.most_common.compass_degrees,
				windDirectionCardinal: data.WD.most_common.compass_point,
				date: new Date(data.First_UTC)
			};
		});
	});
}

function updateUnits() {
	const speedUnits = document.querySelectorAll('[data-speed-unit]');
	const tempUnits = document.querySelectorAll('[data-temp-unit]');

	speedUnits.forEach((unit) => {
		unit.innerText = isMetric() ? 'kph' : 'mph';
	});

	tempUnits.forEach((unit) => {
		unit.innerText = isMetric() ? 'C' : 'F';
	});
}

function isMetric() {
	return celMetric.checked;
}
