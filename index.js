require('dotenv').config()
const Web3 = require('web3');
const IPFS = require('ipfs');
const network = 'ropsten';

const ipfs = new IPFS();

let web3Provider = "wss://ropsten.infura.io/ws/v3/"+process.env.INFURA;
const web3 = new Web3(new Web3.providers.WebsocketProvider(web3Provider));


const Inui = require("./contracts/Inui.json");


const deployedNetwork = Inui.networks[3];
const inuiInstance = new web3.eth.Contract(Inui.abi, deployedNetwork.address);

console.log("ABI ", Inui.abi)
console.log("   END    ");
console.log("ADDRESS ", deployedNetwork.address);

web3.eth.net.getId().then(function(networkID) {
    console.log("DEPLOYED NETWORK ",networkID ); 
});



ipfs.once('ready', () => {
    // console.log("IPFS NODE LOOKING THROUGH ETHEREUM LOGS "); 
    inuiInstance.getPastEvents('DataSubmitted', {
        filter: {},
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => {
        if (error) throw error; 
        events.forEach((event) => {
            let hash = event.returnValues.ipfs;
            // console.log("EVENT VALUES ", event.returnValues);
            // console.log("PINNING SERVER IS PINNING HASH ", hash);
            ipfs.pin.ls(hash, (err, pinset) => {
                if (err) {
                    ipfs.pin.add(hash);
                    console.log('Pinned hash', hash);
                }
                if (pinset) {
                    console.log('Hash already pinned', hash);
                }
            });
        });
    });

    inuiInstance.events.DataSubmitted({
        filter: {},
        fromBlock: 0
    }, (error, event) => {
        // console.log("IPFS NODE LISTENING FOR UPLOADED DATA "); 
        if (error) console.log(error);
        if (event) {
            let hash = event.returnValues.ipfs;
            console.log("PINNING SERVER IS PINNING HASH ", hash);
            ipfs.pin.ls(hash, (err, pinset) => {
                if (err) {
                    console.log('Pinning hash...', hash);
                    ipfs.pin.add(hash);
                }
                if (pinset) {
                    console.log('Hash already pinned', hash);
                }
            })
        }
    });
});
