const {Blockchain, Transaction} = require("./blockchain");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const myKey = ec.keyFromPrivate('a3d376cb27e1cd166b21a63ca5427a49f8de48e8ff25d8d54348d531c81f7095');
const myWalletAddress = myKey.getPublic('hex');
let Bitcoin = new Blockchain();
const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
Bitcoin.addTransaction(tx1);