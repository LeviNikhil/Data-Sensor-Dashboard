const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const port = new SerialPort({
  path: "COM6",
  baudRate: 9600
});

port.on("open", () => {
  console.log("serial port open");
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", (data) => {
  console.log("got word from arduino:", data);
});

