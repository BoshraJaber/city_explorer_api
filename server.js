'use strict';

//require statement (importing packages)

let express = require('express');
// intialiazation 

let app = express();

require('dotenv').config;

const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.log("it is listening");
})
