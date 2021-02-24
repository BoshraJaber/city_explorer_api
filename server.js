'use strict';

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
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL ? true : false });
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });

// routes- endpoints
app.get('/location', handelLocation);
app.get('/weather', handelWeather);
app.get('/parks', handleParks);
app.get('/movies', handleMovies);
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

function handleMovies(req, res) {
    try {
        getMovieData(req, res)
    } catch (error) {
        res.status(500).send('Sorry, an error happened..' + error);
    }
}

function handel404(req, res) {
    res.status(404).send("The page that you are trying to access doesn't exist");
}

// handel data for function
function getLoctionData(searchQuery) {
    let checkExist = 'SELECT * FROM locations WHERE search_query=$1';
    let savedValues = [searchQuery];

    // query return a promise because data takes time
    // rows is an array of objects
    return client.query(checkExist, savedValues).then(data => {
        // console.log(data.rows);
        // we can check row count or row Array. I know that because I console logged data
        if (data.rowCount !== 0) {
            //create new location object
            let locationObject = new CityLocation(data.rows[0].search_query, data.rows[0].formatted_query, data.rows[0].latitude, data.rows[0].longitude);
            // res.status(200).send(locationObject);
            return locationObject;

        } else {
            // if I don`t have the data saved in the db
            // ----------------------------
            //lab07
            const query = {
                key: process.env.GEOCODE_API_KEY,
                q: searchQuery,
                limit: 1,
                format: 'json',
            };

            let url = 'https://us1.locationiq.com/v1/search.php';
            // add .set() after get() if I want to add it to the head
            return superagent.get(url).query(query).then(data => {
                try {
                    let longitude = data.body[0].lon;
                    let latitude = data.body[0].lat;
                    let displayName = data.body[0].display_name;

                    let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);

                    // to save the data from the res to the db
                    // insert values to database

                    let dbQuery = `INSERT INTO locations(search_query,formatted_query,latitude, longitude) VALUES ($1,$2,$3,$4)`;
                    // RETURNING *`;
                    let safeValues = [responseObject.search_query, responseObject.formatted_query, responseObject.longitude, responseObject.latitude];;
                    client.query(dbQuery, safeValues).then(data => {
                        console.log('data returned back from db ', data.rows);
                    }).catch(error => {
                        console.log('an error occurred ' + error);
                    });
                    return responseObject;
                    // console.log(data);
                } catch (error) {
                    res.status(500).send(error);
                }
            }).catch(error => {
                res.status(500).send('There was an error getting data from API ' + error);
            });
            //-------------------------------

        }
    }).catch(error => {
        console.log(error);
    })
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
        // console.log(data.body);
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

function getMovieData(req, res) {
    console.log(req.query.search_query);
    const queryMovie = {
        api_key : process.env.MOVIE_API_KEY,
        query : req.query.search_query,
        format: 'json',
    }
    // let url = 'https://api.themoviedb.org/3/movie/550';
    let url = 'https://api.themoviedb.org/3/search/movie';
    superagent.get(url).query(queryMovie).then(data => {
        // console.log(data.body.results.Object.values(title));
        let resultArrMovie = [];
        data.body.results.map(element => {
            resultArrMovie.push(new Movie(element.title, element.overview, element.vote_average, element.vote_count, element.poster_path, element.popularity, element.release_date));
        })
        // console.log(resultArrMovie);
        //title, overview, average_votes, total_votes, image_url, popularity, released_on
        res.status(200).send(resultArrMovie);
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

function Movie(title, overview, average_votes, total_votes, image_url, popularity, released_on) {
    this.title = title;
    this.overview = overview;
    this.average_votes = average_votes;
    this.total_votes = total_votes;
    this.image_url = image_url;
    this.popularity = popularity;
    this.released_on = released_on;
}



// "title": "Sleepless in Seattle",
//     "overview": "A young boy who tries to set his dad up on a date after the death of his mother. He calls into a radio station to talk about his dad’s loneliness which soon leads the dad into meeting a Journalist Annie who flies to Seattle to write a story about the boy and his dad. Yet Annie ends up with more than just a story in this popular romantic comedy.",
//     "average_votes": "6.60",
//     "total_votes": "881",
//     "image_url": "https://image.tmdb.org/t/p/w500/afkYP15OeUOD0tFEmj6VvejuOcz.jpg",
//     "popularity": "8.2340",
//     "released_on": "1993-06-24"


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

// psql -d <city_explorer> -f <path/to/filename>