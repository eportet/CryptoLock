var Gpio = require('onoff').Gpio;
var greenled = new Gpio(23, 'out');
var redled = new Gpio(24, 'out');
var button = new Gpio(18, 'in', 'falling', {debounceTimeout: 20});

var CARDSCAN = "0xa1b29Ae29C6A877383Ad50F5a66EE2Ef0a75e84E";

redled.writeSync(1);
greenled.writeSync(0);
console.log('**** GATE CLOSED ****');

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

button.watch(function (err, value) {
	if (err) {
		console.error(err);
		return;
	}

	var isValid = Gatekeeper.authorizeAddress(CARDSCAN);
	if (isValid) {
		console.log("**** OPEN GATE ****");
		redled.writeSync(0);
		greenled.writeSync(1);
		setTimeout(function() {
			console.log("**** CLOSE GATE ****");
			redled.writeSync(1);
			greenled.writeSync(0);
		}, 5000)
	} else {
		console.log("***** INVALID *****");
	}
});


process.on('SIGINT', function () {
	redled.unexport();
	greenled.unexport();
	button.unexport();
});
