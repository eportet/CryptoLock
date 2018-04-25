var Gpio = require('onoff').Gpio;
var greenled = new Gpio(23, 'out');
var redled = new Gpio(24, 'out');
var pn532 = require('pn532');
var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyS0', { baudRate: 115200 });
var rfid = new pn532.PN532(port);
var ndef = require('ndef');
var spawn = require("child_process").spawn;

redled.writeSync(1);
greenled.writeSync(0);

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

if (web3.isConnected()){
    console.log("Ethereum node successfully connected to version:", web3.version.node);
}

var coinbase = web3.eth.accounts[0];
console.log("Using Wallet ID: " + coinbase);

web3.eth.defaultAccount = web3.eth.accounts[0];

var GatekeeperABIString = '[ { "constant": true, "inputs": [ { "name": "_address", "type": "address" } ], "name": "authorizeAddress", "outputs": [ { "name": "isValid", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]';
var GatekeeperABI = JSON.parse(GatekeeperABIString);
var GatekeeperContractAddress = '0xd189CaB96c0ee645e6eE80BE79979FaDccfe1055';
var Gatekeeper = web3.eth.contract(GatekeeperABI).at(GatekeeperContractAddress);

console.log('\n********* READY *********');

function redLight(i) {
	setTimeout(function() { redled.writeSync((i+1)%2); }, 250*i)
}

rfid.on('ready', function() {
    console.log('Listening for a tag scan...');
    rfid.on('tag', function(tag) {
        console.log('Reading tag data...');
        rfid.readNdefData().then(function(data) {
			if (data === undefined) {
				console.log("**** UNDEFINED ****");
				for (var i = 0; i < 5; i++) {
					redLight(i);
				}

			} else {
				var records = ndef.decodeMessage(Array.from(data));
				var cardscan = JSON.parse(JSON.stringify(records))[1]['value'].toString();
				var isValid = Gatekeeper.authorizeAddress(cardscan);
				if (isValid) {
					console.log("**** OPEN GATE ****");
					redled.writeSync(0);
					greenled.writeSync(1);
					spawn('python',["motor/opendoor.py"]);
					setTimeout(function() {
						console.log("**** CLOSE GATE ****");
						redled.writeSync(1);
						greenled.writeSync(0);
						spawn('python',["motor/closedoor.py"]);
					}, 5000)
				} else {
					console.log("***** INVALID *****");
					for (var i = 0; i < 7; i++) {
						redLight(i);
					}
				}
			}
        });
    });
});


process.on('SIGINT', function () {
	redled.unexport();
	greenled.unexport();
});
