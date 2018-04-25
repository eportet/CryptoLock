# TODO

Update this README file.

# CryptoLock
Gatekeeping using Raspberry Pi, LED Lights, RFID Reader and Ethereum

This assumes you have a Raspberry Pi and can access it via a terminal/ssh.

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
   geth --rinkeby --syncmode=fast --cache=96 console
   > eth.syncing // Use to track progress of sync
   > eth.personal.NewAccount() // Use to create account for identification in the Ethereum Network
   ```

   *Note: The installation of the Blockchain will take around 1.5 days. We recommend going to Step 7 during this time and installing Ethereum Wallet.*

   *Note: At this time the latest build is for v1.8.3.*

2. **Install [Node and NPM](https://github.com/audstanley/NodeJs-Raspberry-Pi)**

   ```
   sudo wget -O - https://raw.githubusercontent.com/audstanley/NodeJs-Raspberry-Pi/master/Install-Node.sh | sudo bash node -v
   ```

4. **Create Project Folder and Install Dependencies**

   ```
   cd ~
   mkdir gatekeep
   cd gatekeep
   npm init
   npm install onoff --save
   npm install web3@0.19 --save
   npm install serialport --save
   npm install pn532 --save
   ```

   * You can import our `gatekeep.js` file or your own to this directory.

   *Note: This will only work if you are using `web3@0.19` since some of the features used here have been deprecated/removed in the latest version.*

5. **Set Up Raspberry Pi**

   * You will need to have 2 LEDs and a button connected each to a GPIO pin on the Raspberry Pi.
   * Use a voltage pin on the Raspberry Pi to power the button and a ground pin to all the elements.

   *Note: The onoff library makes reference to the GPIO number not the Pin number. You can modify the edge position trigger by using 'falling', 'rising', 'both' or 'none' when declaring the GPIO.*

6. **Host Ethereum Node**

   Assuming Geth has finished syncing, open a new terminal and start Geth in RPC mode.

   ```
   geth --rinkeby --rpc
   ```

   * This should output somewhere the port where the node will be run. Usually `Port 8545`.

7. **Host Contract on Ethereum Network**

   * For this we will use the [Ethereum Wallet](https://github.com/ethereum/mist/releases). When you setup the Wallet make sure you download the same Network that you downloaded for the Raspberry Pi. In our case we used the Rinkeby Test Network.
   * Once finished setting up the Wallet, head to the Contract tab and create your contract or, if you would prefer, you can load our Contract using this address for the Rinkeby Network `0xd189CaB96c0ee645e6eE80BE79979FaDccfe1055` and this ABI String:
   ```
   [ { "constant": true, "inputs": [ { "name": "\_address", "type": "address" } ], "name": "authorizeAddress", "outputs": [ { "name": "isValid", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]
   ```

8. **Run `gatekeep.js` on the Raspberry Pi**

   * Open a new terminal while hosting an Ethereum Node (see step 6).

   ```
   sudo node gatekeep.js
   ```

   * If no errors occurr, the program should output some information and then wait for the Gatekeeper contract to be accessed from the Ethereum Wallet using the button.

9. **Access the Contract**

   * Press the button to trigger the event and access the Gatekeeper contract.
   * This will validate the `CARDSCAN` variable against the Gatekeeper contract.
   * For the contract with the address `0xd189CaB96c0ee645e6eE80BE79979FaDccfe1055` the only valid address that it will accept is `0xa1b29Ae29C6A877383Ad50F5a66EE2Ef0a75e84E`.
   * If the previous address didn't work that means you are not in sync with the Ethereum Network.
