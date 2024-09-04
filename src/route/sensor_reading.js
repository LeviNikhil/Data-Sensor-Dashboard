const express = require("express");
const router = express.Router();
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const Sensor_Reading = require("../model/sensorData");

const port = new SerialPort({ path: "COM6", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

let currentReading = null;

port.on("open", () => {
  console.log("serial port open");
});

function processSensorData(payload) {

  const humidityRegex = /Humidity:\s*(\d+(?:\.\d+)?)\s*%/;
  const temperatureCRegex = /Temperature:\s*(\d+(?:\.\d+)?)\s*°C/;
  const temperatureFRegex = /Temperature:\s*(\d+(?:\.\d+)?)\s*°F/;

  const humidityMatch = payload.match(humidityRegex);
  const temperatureCMatch = payload.match(temperatureCRegex);
  const temperatureFMatch = payload.match(temperatureFRegex);

  const humidity = humidityMatch ? humidityMatch[1] : null;
  let temperature = null;

  if (temperatureCMatch) {
    temperature = temperatureCMatch[1];
  } else if (temperatureFMatch) {
    // Convert Fahrenheit to Celsius
    const fahrenheit = parseFloat(temperatureFMatch[1]);
    temperature = ((fahrenheit - 32) * 5 / 9).toFixed(2);
  }

  return new Sensor_Reading({
    temprature: temperature, // Note: keeping the misspelling as per your schema
    humidity: humidity
  });
}

parser.on("data", async (data) => {
  try {
    currentReading = processSensorData(data);
    console.log("Processed reading:", currentReading);

    // Save readings to database
    await currentReading.save();
  } catch (error) {
    console.error("Error processing sensor data:", error);
  }
});

// Get current readings
router.get("/currentReadings", (req, res) => {
  if (currentReading) {
    res.status(200).json({
      temprature: currentReading.temprature,
      humidity: currentReading.humidity,
    });
  } else {
    res.status(404).json({ error: "No current readings available" });
  }
});

// Fetch all readings from the database
router.get("/", async (req, res) => {
  try {
    let readings = await Sensor_Reading.find().sort({ date: -1 }).limit(100);
    res.status(200).json(readings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;