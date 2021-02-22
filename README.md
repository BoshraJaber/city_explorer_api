# city_explorer_api
# Lab06

**Author**: Boshra Jaber
**Version**: 1.0.0 

## Overview
As stated in the lab requirement we are building a ** City Explorer Application**. What this app will do is let me search for a city by its name and the result of the search will be a map (its location), a description of its weather with a date.
, allowing a user to search for a location, present a Map, as well as interesting information about the area, all using data.

## Getting Started

The user need to clone the app to its local machine and install the needed packages as stated in the package.json file by running `npm`


## Architecture
This app was designed: 
* JavaScript, CSS and HTMl for front-end languages.
* Packages : cors, dotenv, express.
* Node.JS
* Heroku to deploy pages on the world wide server.


## Change Log
02-21-2021 8:59pm - Application now has a fully-functional express server, with a GET route for the location resource and the weather (description of the weather with the date in long format)


## Credits and Collaborations
[w3school](https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_todatestrin)

----------------
# Lab06 Features: 


| First Task  |     Repository Set Up         |
|---------|----------------------------------|
|Start time | 1:00 pm |
| End Time | 2:00 pm |
|Estimated Time | 1:00 hour |
| Actual Time | 1:00 hour |


| Second Task  |     Search for a location        |
|---------|----------------------------------|
|Start time |2:00 pm |
| End Time | 4:00 pm |
|Estimated Time | 2 hours |
| Actual Time |2 hours |


| Third Task  |    Display weather info for location searched        |
|---------|----------------------------------|
|Start time | 5:00 pm |
| End Time |8:00 pm |
|Estimated Time | 2 hours |
| Actual Time | 3 hours due to an error delay |


API location address: https://us1.locationiq.com/v1/search.php?key=pk.1651615f51eb2e74daed6ee9df38b7e3&q=amman&format=json&limit=1 

API weather address: https://api.weatherbit.io/v2.0/forecast/daily?city=amman&key=181db746d0254c6d944adf1a4c6bc024
https://api.weatherbit.io/v2.0/forecast/daily?&lat=38.123&lon=-78.543&key=181db746d0254c6d944adf1a4c6bc024

https://www.weatherbit.io/api/weather-forecast-16-day