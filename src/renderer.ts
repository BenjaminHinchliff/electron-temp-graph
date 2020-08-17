/**
 * This file will automatically be loaded by webpack and run in the "renderer"
 * context. To learn more about the differences between the "main" and the
 * "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling
 * Node.js integration in a renderer process, please be aware of potential
 * security implications. You can read more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable
 * the `nodeIntegration` flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

require('dotenv').config();

import './index.css';
import Chart from 'chart.js';
import {range} from 'lodash';

// console.log(ip.isPublic(ip.address()));

/* eslint-disable no-unused-vars */
enum Units {
  Kelvin = 'kelvin',
  Metric = 'metric',
  Imperial = 'imperial',
}
/* eslint-enable no-unused-vars */

/* eslint-disable camelcase */
interface HourlyWeather {
  dt: number,
  temp: number,
  feels_like: number,
  pressure: number,
  humidity: number,
  dew_point: number,
  clouds: number,
  visibility: number,
  wind_speed: number,
  wind_deg: number,
  weather: [
    {
      id: number,
      main: string,
      description: string,
      icon: string
    }
  ],
  pop: 0,
}
/* eslint-enable camelcase */

interface WeatherData {
  x: string[],
  y: number[],
}

/**
 * fetch weather data from open weather api
 * @param {number} lat the latitude of the data
 * @param {number} lon the longitude of the data
 * @param {Units} units the units to use
 */
async function fetchWeather(lat: number, lon: number, units=Units.Kelvin) {
  const {hourly}: {hourly: HourlyWeather[]} = await (await fetch(
      'https://api.openweathermap.org/data/2.5/onecall' +
      `?lat=${lat}` +
      `&lon=${lon}` +
      '&exclude=minutely,daily' +
      `&appid=${process.env.API_KEY}&units=${units}`,
  )).json();
  const data = hourly.reduce((sumObj: {x: string[], y: number[]}, thisobj) => {
    const {dt, temp} = thisobj;
    const hours = new Date(dt * 1000).getHours();
    sumObj.x.push(`${hours % 12} ${hours > 12 ? 'AM' : 'PM'}`);
    sumObj.y.push(temp);
    return sumObj;
  }, {x: [], y: []});
  return data;
}

/**
 * main entry point to allow async functions
 */
async function main() {
  const {x, y} = await fetchWeather(37.838531, -122.126083, Units.Imperial);
  const ctx = document.getElementById('chart') as HTMLCanvasElement;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: x,
      datasets: [{
        label: 'Temperature',
        data: y,
        borderColor: 'rgba(255, 234, 0, 0.8)',
        backgroundColor: 'rgba(255, 234, 0, 0.4)',
      }],
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      },
    },
  });
}

main();
