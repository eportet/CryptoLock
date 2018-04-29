# CryptoLock
Gatekeeping using Raspberry Pi, LED Lights, RFID Reader and Ethereum

## Video Overview

[Video](https://www.youtube.com/)

## Installation Guide

1. **Install and Setup Geth**

   Copy the URL for the latest build from [here](https://geth.ethereum.org/downloads/) for ARMv7.

   ```
   wget https://gethstore.blob.core.windows.net/builds/geth-linux-arm7-1.8.3-329ac18e.tar.gz
   tar -xvf geth-linux-arm7-1.8.3-329ac18e.tar.gz
   cd geth-linux-arm7-1.8.3-329ac18e
   sudo mv geth /usr/local/bin/
   cd ~
   geth version
   ```

   Once you have installed Geth, you can start syncing the blockchain.

   ```
   geth --rinkeby --syncmode=light --cache=96 console
   > eth.syncing // Use to track progress of sync
   > personal.newAccount() // Use to create account for identification in the Ethereum Network
   ```

   *Note: The installation of the Blockchain will take around 5 hours. We recommend going to Step 7 during this time and installing Ethereum Wallet.*

   *Note: At this time the latest build is for v1.8.3.*

2. **Install [Node and NPM](https://github.com/audstanley/NodeJs-Raspberry-Pi)**

   ```
   sudo wget -O - https://raw.githubusercontent.com/audstanley/NodeJs-Raspberry-Pi/master/Install-Node.sh | sudo bash node -v
   ```

4. **Clone this Repository and Install Dependencies**

   ```
   git clone https://github.com/BUConnectedWorld/Group3.git
   cd Group3/node
   npm install
   ```

5. **Set Up Raspberry Pi**

   * You will need to have 2 LEDs, an RFID Reader and a Stepper Motor connected to the Raspberry Pi.
   * ELECTOHOUSE WIRELESS-NFC-PN532
   * HYBRID STEPPING MOTOR 42BYGHM809
   
   TODO INSERT DIAGRAM

6. **Host Ethereum Node**

   Assuming Geth has finished syncing, open a new terminal and start Geth in RPC mode.

   ```
   geth --rinkeby --syncmode=light --cache=96 --rpc --rpciapi="db,eth,net,web3,personal" console
   ```

   * This should output somewhere the port where the node will be run. Usually `Port 8545`.

7. **Host Contract on Ethereum Network**

   * For this we will use the [Ethereum Wallet](https://github.com/ethereum/mist/releases). When you setup the Wallet make sure you download the same Network that you downloaded for the Raspberry Pi. In our case we used the Rinkeby Test Network.
   * Once finished setting up the Wallet, head to the Contract tab and create your contract or, if you would prefer, you can load our Contract using this address for the Rinkeby Network `0x630583cc80Dd3FddcCfBa12aB62abA4294De8393` and this ABI String:
   ```
   [ { "constant": false, "inputs": [ { "name": "_cardData", "type": "string" }, { "name": "_newData", "type": "string" } ], "name": "check", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getValidData", "outputs": [ { "name": "", "type": "string", "value": "helo" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]
   ```

8. **Run `gatekeep.js` on the Raspberry Pi**

   * Open a new terminal while hosting an Ethereum Node (see step 6).

   ```
   cd Group3/node/
   node gatekeep.js
   ```

   * If no errors occurr, the program should output some information and then wait for the Gatekeeper contract to be accessed from the Ethereum Wallet using the button.

9. **Access the Contract**

   * Tap an NTAG sticker on the RFID reader to initiate a transaction with the Ethereum Network.
   * This will run the Gatekeeper contract `check` function which will take the data stored on the card and verify if it belongs to a valid Account. If it is, the data stored on the blockchain will change, and so will the data on the NTAG.
   * If the console outputs `UNDEFINED` the data on the NTAG is corrupted or the read format is not supported.
   * If the console outputs `INVALID` the data on the NTAG did not contain the valid data stored on the Ethereum Network.
   * Else, the console will output an `OPEN DOOR` message followed by a `CLOSE DOOR` message.
   * In between the open and close message you should receive an acknowledgment that the new data has been written to the NTAG.
   * You can debug the NTAG data using `node misc/write_data.js` which will write the valid data to access the Ethereum Network and `node misc/read_data.js` to read data from the NTAG.
