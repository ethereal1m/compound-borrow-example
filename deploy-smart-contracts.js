/**
 * Deploys our smart contracts from `/solidity-examples/MyContracts.sol`
 * 
 * There is no need to execute this file if you are only using the JSON RPC 
 *     examples. Be sure to run this after you run the compile script in the
 *     project root directory. This script deploys the contracts to your local
 *     Ganache test net. You can use this code to deploy to main or test nets by
 *     changing the HTTP provider passed to the Web3 constructor, and supplying
 *     a private key for a wallet (that contains ETH on that network).
 */
const Web3 = require('web3');
//const web3 = new Web3('http://127.0.0.1:8545');
// const web3 = new Web3('https://eth-kovan.alchemyapi.io/v2/2y2GU0BMsSGXB-xbDcv5-UwSdPYZg0Er');

const web3 = new Web3('https://kovan.infura.io/v3/d8669df2db504336a704e52a6126b322');


const { bytecode } = require('./.build/bytecode.json');
const abi = require('./.build/abi.json');

(async function () {
  // For public test net or main net deployments, use the following:
  //// Your Ethereum wallet private key (use an environment variable reference)
  // const privateKey = '_YOUR_WALLET_PRIVATE_KEY_HERE_';
  // web3.eth.accounts.wallet.add('0x' + privateKey);
  // const myWalletAddress = web3.eth.accounts.wallet[0].address;
  const dotenv  =require('dotenv');
  dotenv.config();
  const privateKey = process.env.myWalletPrivateKey;
  web3.eth.accounts.wallet.add('0x' + privateKey);

  const myWalletAddress = web3.eth.accounts.wallet[0].address;


  const myContract = new web3.eth.Contract(abi);

  myContract.deploy({
    data: bytecode
  }).send({
    from: myWalletAddress,
    gas: 5000000
  }).then((deployment) => {
    console.log('Your contract was successfully deployed!');
    console.log('The contract can be interfaced with at this address:');
    console.log(deployment.options.address);
  }).catch((err) => {
    console.error(err);
  });
})()
