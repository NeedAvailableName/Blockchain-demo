const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    calHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }
        const hashTx = this.calHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }
    isValid() {
        if(this.fromAddress === null) return true;
        if(this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calHash(), this.signature);
    }
}
class Block {
    constructor(timestamp, transactions, prevHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calHash();
        this.nonce = 0;
    }
    calHash() {
        return SHA256(this.timestamp + JSON.stringify(this.data) + this.prevHash + this.nonce).toString();

    }
    mineBlock(dificulty) {
        while(this.hash.substring(0, dificulty) !== Array(dificulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calHash();
        }
    }
    hasValidTransactions() {
        for(const tx of this.transactions) {
            if(!tx.isValid()) return false;
        }
        return true;
    }
}
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.dificulty = 1;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    createGenesisBlock() {
        return new Block("24/3/2022", "The first block", "0");
    }
    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.dificulty);
        this.chain.push(block);
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }
    addTransaction(transaction) {
        if(!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }
        if(!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }
        this.pendingTransactions.push(transaction);
    }
    getBalanceOfAddress(address) {
        let balance = 0;
        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) balance -= trans.amount;
                if(trans.toAddress === address) balance += trans.amount; 
            }
        }
    }
    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const curBlock = this.chain[i];
            const prevBlock = this.chain[i-1];
            if(!curBlock.hasValidTransactions()) return false;
            if(curBlock.hash !== curBlock.calHash()) return false;
            if(curBlock.prevHash !== prevBlock.hash) return false;
            return true;
        }
    }
}
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
