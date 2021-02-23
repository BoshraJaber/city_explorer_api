'use strict';
// var latLonForWeather = [];
//require statement (importing packages)
let express = require('express');
const cors = require('cors');
let superagent = require('superagent'); // lab07
const pg = require('pg'); // lab08
// initialization and configuration 
let app = express();
app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT;
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
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
    // console.log(req.query);
    try {
        getWeatherData(req, res)
    } catch (error) {
        res.status(500).send('Sorry, an error happened..' + error);
    }
}

function handleParks(req, res) {
    try {
        getParkData(req, res)
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
    return superagent.get(url).query(query).then(data => {
        try {
            let longitude = data.body[0].lon;
            let latitude = data.body[0].lat;
            let displayName = data.body[0].display_name;

            let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
            // to save the data from the res to the db

            let dbQuery = `INSERT INTO locations(search_query,formatted_query,latitude, longitude) VALUES ($1,$2,$3,$4)RETURNING *`;
            let safeValues = [responseObject.search_query, responseObject.formatted_query, responseObject.longitude, responseObject.latitude];;
            client.query(dbQuery,safeValues).then(data=>{
                console.log('data returned back from db ',data.rows);
              }).catch(error=>{
                console.log('an error occurred '+error);
              });
            return responseObject;
            // console.log(data);
        } catch (error) {
            res.status(500).send(error);
        }
    }).catch(error => {
        res.status(500).send('There was an error getting data from API ' + error);
    });
}

function getWeatherData(req, res) {
    const queryWeather = {
        key: process.env.MASTER_API_KEY,
        lat: req.query.latitude,
        lon: req.query.longitude,
        format: 'json',
    }
    let url = 'https://api.weatherbit.io/v2.0/forecast/daily';

    superagent.get(url).query(queryWeather).then(data => {
        // console.log(data.body.data[0]);
        let resultArr = [];

        data.body.data.map(element => {
            resultArr.push(new CityWeather(element.weather.description, new Date(element.valid_date).toDateString()))
            //  return element;
        })
        // console.log(resultArr);
        res.status(200).send(resultArr);
    }).catch(error => {
        res.status(500).send('There was an error getting data from API ' + error);
    });
    // return resultArr;
}

function getParkData(req, res) {
    const queryPark = {
        api_key: process.env.PARKS_API_KEY,
        // lat: req.query.latitude,
        // lon: req.query.longitude,
        q: req.query.search_query,
        format: 'json',
    }
    let url = 'https://developer.nps.gov/api/v1/parks';
    superagent.get(url).query(queryPark).then(data => {
        console.log(data.body);
        let resultArrPark = [];
        data.body.data.map(element => {
            resultArrPark.push(new Park(element.fullName, Object.values(element.addresses[0]).join(' '), element.entranceFees.cost, element.description, element.url))
        })

        // let resultArrPark = data.body['data'].map(element => {
        //     resultArrPark.push(new Park(element));
        // })
        // console.log(resultArr);
        res.status(200).send(resultArrPark);
    }).catch(error => {
        res.status(500).send('There was an error getting data from Park API ' + error);
    });
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


// app.listen(PORT, () => {
//     console.log("it is listening" + PORT);
// });

// to connect the database to the app
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('the app is listening to port ' + PORT);
    });
}).catch(error => {
    console.log('an error occurred while connecting to database ' + error);
});