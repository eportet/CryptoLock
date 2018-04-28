// Dependencies
var Web3 = require('web3');
var Gpio = require('onoff').Gpio;
var SerialPort = require('serialport');
var pn532 = require('pn532');
var ndef = require('ndef');
var spawn = require("child_process").spawn;
var fs = require("fs");

// Initializing variables
var greenled = new Gpio(23, 'out');
var redled = new Gpio(24, 'out');
var port = new SerialPort('/dev/ttyS0', { baudRate: 115200 });
var rfid = new pn532.PN532(port);
var web3 = new Web3();
var action = JSON.parse(fs.readFileSync("action.json"));
action.run = true;

// Attach to local Geth RPC
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Check if successfuly connected to Ethereum
if (web3.isConnected()){
  console.log("Ethereum node successfully connected to version:", web3.version.node);
} else {
  console.log("ERROR: Could not connect to the Ethereum network")
}

// Get this device's Wallet ID
var coinbase = web3.eth.accounts[0];
console.log("Using Wallet ID: " + coinbase);

// Set as default account
web3.eth.defaultAccount = web3.eth.accounts[0];

// Connect to SmartContract
var GatekeeperABI = JSON.parse('[ { "constant": false, "inputs": [ { "name": "_cardData", "type": "string" }, { "name": "_newData", "type": "string" } ], "name": "check", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getValidData", "outputs": [ { "name": "", "type": "string", "value": "helo" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]');
var GatekeeperContractAddress = '0x630583cc80Dd3FddcCfBa12aB62abA4294De8393';
var Gatekeeper = web3.eth.contract(GatekeeperABI).at(GatekeeperContractAddress);

// Turn on LED lights
redled.writeSync(1);
greenled.writeSync(0);

console.log(action);

rfid.on('ready', function() {
  // RFID Reader Identified
  console.log('\n********* READY *********');
  rfid.on('tag', function(tag) {
    if (action.run) {
      scanTag(action);
    }
  });
});

function scanTag(action) {
  action.run = false;
  rfid.readNdefData().then(function(data) {
    if (data === undefined) {
      console.log("**** UNDEFINED ****");
      blinkRedLight(4, action);
    } else {
      var records = ndef.decodeMessage(Array.from(data));
      var cardscan = JSON.parse(JSON.stringify(records))[1]['value'].toString();
      var new_data = web3.sha3(web3.eth.blockNumber.toString()).slice(-4).toString();
      if (Gatekeeper.check(cardscan, new_data)) {
        openGate(action);
        writeTag(action, new_data);
      } else {
        console.log("***** INVALID *****");
        blinkRedLight(3,action);
      }
    }
  });
}

function writeTag(action) {

  var messages = [
  ndef.uriRecord(''),
  ndef.textRecord(new_hash)
  ];
  var data = ndef.encodeMessage(messages);

  rfid.writeNdefData(data).then(function(response) {
    action.hash = new_hash;
    //console.log(new_hash);
    fs.writeFileSync('action.json', JSON.stringify(action));
    console.log('WRITE SUCCESSFUL');
    //console.log(action);
  });
}

function openGate(action) {
  console.log("**** OPEN GATE ****");
  redled.writeSync(0);
  greenled.writeSync(1);
  spawn('python',["motor/opendoor.py"]);

  setTimeout(function() {
    console.log("**** CLOSE GATE ****");
    redled.writeSync(1);
    greenled.writeSync(0);
    spawn('python',["motor/closedoor.py"]);

    action.run = true;
  }, 5000)
}

function redLight(i) {
  setTimeout(function() { redled.writeSync((i+1)%2); }, 250*i)
}

function blinkRedLight(n, action) {
  for (var i = 0; i < ((n*2)+1); i++) {
    redLight(i);
  }
  setTimeout(function() { action.run = true; }, 250*2*n+100)
}

process.on('SIGINT', function () {
  redled.unexport();
  greenled.unexport();
});
