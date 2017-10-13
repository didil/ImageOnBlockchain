## Deployment Instructions

1. Pull the repository code

2. run :

````
npm install
````

3. run a rinkeby node locally (replace YOUR_LOCAL_WALLET_ADDRESS with a local address created previously on the node)

````
 geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="YOUR_LOCAL_WALLET_ADDRESS"
````

4. create a truffle.js file at the project root with this content

````
module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "localhost", //
      port: 8545,
      from: "YOUR_LOCAL_WALLET_ADDRESS",
      network_id: 4,
      gas: 5000000
    },
  },
};
  
````  

5. To deploy the contract to rinkeby run :

````
truffle deploy --network=rinkeby
````

6. build frontend: 
````
npm run build
````

7. The frontend build is now in the folder build_webpack. To deploy it to firebase, follow the instructions at : https://firebase.google.com/docs/hosting/quickstart
