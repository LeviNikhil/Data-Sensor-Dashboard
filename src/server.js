const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server started at port ${PORT} ....`) });

// database SENSORS connection.......................
const mongoose = require('mongoose');

const dbConnect =  () => {
    mongoose
    .connect(process.env.database_sensor)
    .then(console.log("Conected to Sensors database !"))
    .catch((err) => {
        console.error("Error while Connecting to Database : ", err);
        process.exit(1);
    });
}

dbConnect();

app.use('/sensor', require('./route/sensor_reading'));
app.use('/user', require('./route/user'));








