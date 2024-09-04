const express = require("express");
const router = express.Router();
const Sensor_Reading = require("../model/sensorData");

let currentReading = null;

// Route to receive data from ESP8266
router.post("/currentReadings", express.json(), async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    
    currentReading = new Sensor_Reading({
      temprature: temperature, // Note: keeping the misspelling as per your schema
      humidity: humidity
    });

    console.log("Received reading:", currentReading);
    
    // Save readings to database
    await currentReading.save();
    
    res.status(200).json({ message: "Data received and saved successfully" });
  } catch (error) {
    console.error("Error processing sensor data:", error);
    res.status(500).json({ error: "Error processing sensor data" });
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