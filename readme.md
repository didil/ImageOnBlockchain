# ImageOnBlockchain
Storing images and text on blockchain

## Running locally

To start private network:
````
testrpc
````

Alternatively you can run a local Rinkeby testnet node:
````
geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="<DEPLOYER_ADDRESS>"
````

Copy truffle-config.js to truffle.js and make any network config changes

To deploy contract:
```` 
truffle migrate
````

To run app locally :
```` 
npm run start
````
