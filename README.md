# IoT-Blink
Simple Blink Example using Raspberry Pi, LED Light and Ethereum

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
   mkdir blink
   cd blink
   npm init
   npm install onoff --save
   npm install web3@0.19 --save
   ```
   
   * You can import our `blink.js` file or your own to this directory.
   
   *Note: This will only work if you are using `web3@0.19` since some of the features used here have been deprecated/removed in the latest version.*

5. **Set Up Raspberry Pi**

   http://thejackalofjavascript.com/raspberry-pi-node-js-led-emit-morse-code/

6. **Host Ethereum Node**

   Assuming Geth has finished syncing, open a new terminal and start Geth in RPC mode.
   
   ```
   geth --rinkeby --rpc
   ```
   
   * This should output somewhere the port where the node will be run. Usually `Port 8545`. If you were not able to see a port, it problably means you haven't finished syncing.

7. **Host Contract on Ethereum Network**

   * For this we will use the [Ethereum Wallet](https://github.com/ethereum/mist/releases). When you setup the Wallet make sure you download the same Network that you downloaded for the Raspberry Pi. In our case we used the Rinkeby Test Network.
   * Once finished setting up the Wallet, head to the Contract tab and create your contract or, if you would prefer, you can load our Contract using this address for the Rinkeby Network `0x9cBF965F360bF96DdcC3E150310ae49747b5a2Dd` and this ABI String: 
   ```
   [ { "constant": false, "inputs": [ { "name": "x", "type": "uint256" } ], "name": "set", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "get", "outputs": [ { "name": "retVal", "type": "uint256", "value": "18" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "data", "type": "uint256" } ], "name": "ItBlinks", "type": "event" } ]
   ```

8. **Run `blink.js` on the Raspberry Pi**

   * Open a new terminal while hosting an Ethereum Node (see step 6).
   
   ```
   sudo node blink.js
   ```
   
   * If no errors occurr, the program should output some information and then wait for the Blink contract to be triggered from the Ethereum Wallet.

9. **Trigger the Contract**
   
   * Go back to the contract page and write to the Contract using the `Set` function. Select any value you want, since it won't affect anything, and execute this transacction.
   * After a couple of seconds you should have a blinking LED and a promt on your `blink.js` terminal notifying you of this event.
