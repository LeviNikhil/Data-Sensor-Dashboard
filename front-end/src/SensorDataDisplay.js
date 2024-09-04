import React, { useState, useEffect, useRef } from 'react';
import './SensorDataDisplay.css'; // We'll create this file for styling

const SensorDataDisplay = () => {
  const [readings, setReadings] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const canvasRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/sensor/currentReadings');
      if (response.ok) {
        const data = await response.json();
        setCurrentReading(data);
        setReadings(prevReadings => {
          const newReadings = [...prevReadings, { ...data, time: new Date() }];
          return newReadings.slice(-25); // Keep only the last 25 readings
        });
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data immediately on mount
    const interval = setInterval(fetchData, 5000); // Then every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (readings.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw temperature line (red)
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      readings.forEach((reading, i) => {
        const x = (i / (readings.length - 1)) * width;
        const y = height - (parseFloat(reading.temprature) / 50) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw humidity line (blue)
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      readings.forEach((reading, i) => {
        const x = (i / (readings.length - 1)) * width;
        const y = height - (parseFloat(reading.humidity) / 100) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [readings]);

  return (
    <div className="sensor-data-display">
      <h1 className="temp-header">
        Current Temperature: {currentReading ? `${currentReading.temprature}°C` : 'N/A'}
      </h1>
      <h1 className="humidity-header">
        Current Humidity: {currentReading ? `${currentReading.humidity}%` : 'N/A'}
      </h1>
      <canvas ref={canvasRef} width="600" height="400" className="chart"></canvas>
    </div>
  );
};

export default SensorDataDisplay;