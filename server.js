'use strict';

//require statement (importing packages)
let express = require('express');
const cors = require('cors');
// initialization and configuration 

let app = express();
app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT;

// routes- endpoints

app.get('/location', handelLocation);
app.get('/weather', handelWeather);
app.get('*', handel404); // for 404 errors, the order of the error function matter, it should be last
console.log(PORT);


//handeler functions
function handelLocation(req, res) {
    try {
        let searchQuery = req.query.city;// we know it is called city from the app website from Network after the ? mark in the query
        // because I want to send the object to the client
        let locationObject = getLoctionData(searchQuery);
        //200 means everything is ok
        res.status(200).send(locationObject);
    } catch (error) {
        res.status(500).send('Sorry, an error happened..' + error);
    }
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

function handel404(req,res){
    res.status(404).send("The page that you are trying to access doesn't exist");
}

// handel data for function
function getLoctionData(searchQuery) {
    //get the data array from the json
    let locationData = require('./data/location.json');
    // i am getting these data from the local today

    //get values from object
    let longitude = locationData[0].lon; // because it has one object
    let latitude = locationData[0].lat;

    // I have the data so I can create the object
    let displayName = locationData[0].display_name;

    let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);

    return responseObject;
}

function getWeatherData() {
    let weatherData = require('./data/weather.json');
    // console.log(weatherData);
    let descriptionData = weatherData.data;
    let resultArr = [];
    for (let index = 0; index < descriptionData.length; index++) {
        // console.log(descriptionData[index].datetime);
        // console.log(new Date(descriptionData[index].datetime).toDateString());
        resultArr.push(new CityWeather(descriptionData[index].weather.description, new Date(descriptionData[index].datetime).toDateString()));
    }


    return resultArr;


}
// console.log(responseObjectWeather);

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
