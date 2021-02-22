'use strict';
var latLonForWeather = [];
//require statement (importing packages)
let express = require('express');
const cors = require('cors');
let superagent = require('superagent'); // lab07
// initialization and configuration 
let app = express();
app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT;
// routes- endpoints
app.get('/location', handelLocation);
app.get('/weather', handelWeather);
app.get('/parks', handleParks);
app.get('*', handel404); // for 404 errors, the order of the error function matter, it should be last

//handeler functions
function handelLocation(req, res) {
    let searchQuery = req.query.city;// we know it is called city from the app website from Network after the ? mark in the query
    // because I want to send the object to the client ff
    getLoctionData(searchQuery).then(data => {
        res.status(200).send(data);
    })
    //200 means everything is ok
}

function handelWeather(req, res) {
    try {
        getWeatherData().then(data => {
            res.status(200).send(data);
        })
    } catch (error) {
        res.status(500).send('Sorry, an error happened..' + error);
    }
}

function handleParks(req, res) {
    try {
        getParkData().then(data => {
            res.status(200).send(data);
        })
    } catch (error) {
        res.status(500).send('Sorry, an error happened..' + error);
    }
}

function handel404(req, res) {
    res.status(404).send("The page that you are trying to access doesn't exist");
}

// handel data for function
function getLoctionData(searchQuery) {
    //lab07
    const query = {
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit: 1,
        format: 'json',
    };

    let url = 'https://us1.locationiq.com/v1/search.php'; //????
    // add .set() after get() if I want to add it to the head
    return superagent.get(url).query(query).then(data => { // why query??
        try {
            let longitude = data.body[0].lon;
            let latitude = data.body[0].lat;
            let displayName = data.body[0].display_name;
            latLonForWeather = [longitude, latitude];

            let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
            return responseObject;
            // console.log(data);
        } catch (error) {
            res.status(500).send(error);
        }
    }).catch(error => {
        res.status(500).send('There was an error getting data from API ' + error);
    });
}

function getWeatherData() {
    const queryWeather = {
        key: process.env.MASTER_API_KEY,
        lat: latLonForWeather[0],
        lon: latLonForWeather[1],
        format: 'json',
    }
    let url = 'https://api.weatherbit.io/v2.0/forecast/daily';

    return superagent.get(url).query(queryWeather).then(data => {
        console.log(data);
        let resultArr = data.body['data'].map(element => {
            return resultArr.push(new CityWeather(element.weather.description, new Date(element.datetime).toDateString()));// what data should I pass
            //  return element;
        })
        return resultArr;
    })
    // return resultArr;
}

function getParkData() {
    const queryPark = {
        key: process.env.PARKS_API_KEY,
        format: 'json',
    }
    let url = 'https://developer.nps.gov/api/v1/alerts';
    return superagent.get(url).query(queryPark).then(data => {
        console.log(data);
        let resultArrPark = data.body['data'].map(element => {
            resultArrPark.push(new Park(element));
        })

    })
    return resultArrPark;
}

// constructor
function CityLocation(searchQuery, displayName, lat, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this.longitude = lon;
}

function CityWeather(descriptionData, time) {
    this.forecast = descriptionData;
    this.time = time;
}

function Park(name, address, fee, description, url) {
    this.name = name;
    this.address = address;
    this.fee = fee;
    this.description = description;
    this.url = url;
}


app.listen(PORT, () => {
    console.log("it is listening" + PORT);
});
