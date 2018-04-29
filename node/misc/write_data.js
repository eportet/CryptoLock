var pn532 = require('pn532');
var SerialPort = require('serialport');
var Web3 = require('web3');

var serialPort = new SerialPort('/dev/ttyS0', { baudRate: 115200 });
var rfid = new pn532.PN532(serialPort);
var ndef = require('ndef');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

if (web3.isConnected()){
  console.log("Ethereum node successfully connected to version:", web3.version.node);
} else {
  console.log("ERROR: Could not connect to the Ethereum network")
}

var coinbase = web3.eth.accounts[0];
console.log("Using Wallet ID: " + coinbase);

// Set as default account
web3.eth.defaultAccount = web3.eth.accounts[0];

// Connect to SmartContract
var GatekeeperABI = JSON.parse('[ { "constant": false, "inputs": [ { "name": "_cardData", "type": "string" }, { "name": "_newData", "type": "string" } ], "name": "check", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getValidData", "outputs": [ { "name": "", "type": "string", "value": "helo" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]');
var GatekeeperContractAddress = '0x630583cc80Dd3FddcCfBa12aB62abA4294De8393';
var Gatekeeper = web3.eth.contract(GatekeeperABI).at(GatekeeperContractAddress);

console.log("READY");
var carddata = Gatekeeper.getValidData();

console.log('Waiting for rfid ready event...');
rfid.on('ready', function() {

  console.log('Waiting for a tag...');
  rfid.scanTag().then(function(tag) {
    var messages = [
      ndef.uriRecord('http://www.google.com'),
      ndef.textRecord(carddata)
    ];

    var data = ndef.encodeMessage(messages);

    rfid.writeNdefData(data).then(function(response) {
      console.log("Wrote: " + carddata + " to card");
    });
  });
});
