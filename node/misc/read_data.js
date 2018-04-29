var pn532 = require('pn532');
var SerialPort = require('serialport');

var serialPort = new SerialPort('/dev/ttyS0', { baudRate: 115200 });
var rfid = new pn532.PN532(serialPort);
var ndef = require('ndef');

console.log('Waiting for rfid ready event...');
rfid.on('ready', function() {

    console.log('Listening for a tag scan...');
    rfid.on('tag', function(tag) {
        rfid.readNdefData().then(function(data) {
            if (data === undefined) {
            	console.log("UNDEFINED")
            } else {
            	var records = ndef.decodeMessage(Array.from(data));
				var r = JSON.parse(JSON.stringify(records));
				console.log("Data: " + r[1]['value']);
            }
        });
    });
});
