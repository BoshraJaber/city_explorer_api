'use strict';

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
// app.get('/weather', handelWeather);
app.get('*', handel404); // for 404 errors, the order of the error function matter, it should be last

//handeler functions
function handelLocation(req, res) {
        let searchQuery = req.query.city;// we know it is called city from the app website from Network after the ? mark in the query
        // because I want to send the object to the client
        getLoctionData(searchQuery).then(data => {
            res.status(200).send(data);
        })
        //200 means everything is ok
}

function handelWeather(req, res) {
    // let searchQuery= req.query.weather;
    try {
        let weatherObject = getWeatherData();
        res.status(200).send(weatherObject);
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
            // let longitude = data.body[0].lon;
            // let latitude = data.body[0].lan;
            // let displayName = data.body[0].display_name;

            // let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);
            // return responseObject;
            console.log(data);
        } catch (error) {
            res.status(500).send(error);
        }
    }).catch(error => {
        res.status(500).send('There was an error getting data from API ' + error);
    });
}

// function getWeatherData() {
//     let weatherData = require('./data/weather.json');
//     let descriptionData = weatherData.data;
//     let resultArr = [];
//     for (let index = 0; index < descriptionData.length; index++) {
//         resultArr.push(new CityWeather(descriptionData[index].weather.description, new Date(descriptionData[index].datetime).toDateString()));
//     }


//     return resultArr;


// }

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

app.listen(PORT, () => {
    console.log("it is listening" + PORT);
});
