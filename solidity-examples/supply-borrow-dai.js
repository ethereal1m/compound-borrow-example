const EthereumTx = require('ethereumjs-tx').Transaction

// Example to borrow DAI (or any ERC20 token) using ETH as collateral
// from a Solidity smart contract
const Web3 = require('web3');
//const web3 = new Web3('http://127.0.0.1:8545');
const web3 = new Web3('https://kovan.infura.io/v3/d8669df2db504336a704e52a6126b322');

const {
  cEthAbi,
  cErcAbi,
  erc20Abi,
} = require('../contracts.json');

// Your Ethereum wallet private key
const dotenv  =require('dotenv');
dotenv.config();
const privateKey = process.env.myWalletPrivateKey;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0x' + privateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

// Mainnet Contract for cETH (the collateral-supply process is different for cERC20 tokens)
const cEthAddress = '0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72';
const cEth = new web3.eth.Contract(cEthAbi, cEthAddress);

// Mainnet Contract for the Comptroller & Open Price Feed
const comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';
const priceFeedAddress = '0x9326BFA02ADD2366b30bacB125260Af641031331';

// Mainnet address of underlying token (like DAI or USDC)
const underlyingAddress = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'; // Dai
const underlying = new web3.eth.Contract(erc20Abi, underlyingAddress , {
    from: myWalletAddress
});

// Mainnet address for a cToken (like cDai, https://compound.finance/docs#networks)
const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'; // cDai

const cToken = new web3.eth.Contract(cErcAbi, cTokenAddress);
const assetName = 'DAI'; // for the log output lines
const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract

// MyContract
//const myContractAbi = require('../build/contracts/MyContract.json');

//const fs = require('fs');
//const contract = JSON.parse(fs.readFileSync('.build/abi.json', 'utf8'));
const myContractAbi = require('../.build/abi.json');
const myContractAddress = '0x348C1E439627617B374f661A69e7B0b243730b52';
//const myContract = new web3.eth.Contract(contract.abi, myContractAddress);
const myContract = new web3.eth.Contract(myContractAbi, myContractAddress);

// Web3 transaction information, we'll use this for every transaction we'll send
const fromMyWallet = {
  from: myWalletAddress,
  gasLimit: web3.utils.toHex(6000000),
  gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
};

const fromMyContract = {
  from: myContractAddress,
  gasLimit: web3.utils.toHex(6000000),
  gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
};


const logBalances = () => {
  return new Promise(async (resolve, reject) => {
    let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
    let myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myContractAddress));
    let myContractCEthBalance = await cEth.methods.balanceOf(myContractAddress).call() / 1e8;
    let myContractUnderlyingBalance = +await underlying.methods.balanceOf(myContractAddress).call() / Math.pow(10, underlyingDecimals);

    console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
    console.log("MyContract's  ETH Balance:", myContractEthBalance);
    console.log("MyContract's cETH Balance:", myContractCEthBalance);
    console.log(`MyContract's  ${assetName} Balance:`, myContractUnderlyingBalance);

    resolve();
  });
};

const main = async () => {


  //await logBalances();

  const numUnderlyingToBorrow = 1;
  const underlyingAsCollateral = 4;
  const mantissa = (underlyingAsCollateral * Math.pow(10, underlyingDecimals)).toString();
  
  /*
  const rawTx = {
  	value: '0x0',
  	data: underlying.methods.transfer(myWalletAddress, 1).encodeABI(),
  	gasLimit: web3.utils.toHex(6000000),
  	gasPrice: web3.utils.toHex(20000000000),
	from: myContractAddress,
  	to: myWalletAddress	 
  }
  
  const rawTx = {
  	nonce: '0x00',
  	gasLimit: web3.utils.toHex(6000000),
  	gasPrice: web3.utils.toHex(20000000000),
	from: myWalletAddress,
  	to: myContractAddress,
	value: web3.utils.toHex(mantissa)	 
  }*/
  
  //console.log(`\nSending ${underlyingAsCollateral} ${assetName} to MyContract so it can provide collateral...\n`);

  // Send underlying to MyContract before attempting the supply
  // await underlying.methods.transfer(myContractAddress, mantissa).send(fromMyWallet);  
  //await underlying.methods.transfer(myWalletAddress, mantissa).send(fromMyContract);

  /*const tx = new EthereumTx(rawTx, { chain: 'kovan'} );
  const privateKeyBuffer = Buffer.from(privateKey, 'hex')
  tx.sign(privateKeyBuffer);
  const serializedTx = tx.serialize();
 
  web3.eth.sendSignedTransaction(serializedTx.toString('hex'), function(err, hash) {
  if (!err)
    console.log(hash); 
  });
  */
  await logBalances();
  console.log(`\nCalling MyContract.borrowDaiCollateralDai with ${underlyingAsCollateral} ${assetName} as collateral...\n`);

  /*let borrowDaiCollateralDaiInput = [{
    _comptrollerAddress: comptrollerAddress,
    _priceFeedAddress: priceFeedAddress,
    _cTokenAddress: cTokenAddress,
    _underlyingDecimals: underlyingDecimals,
    _underlyingAddress: underlyingAddress,
    _underlyingToSupplyAsCollateral:  mantissa,
    _numUnderlyingToBorrow: numUnderlyingToBorrow
  }];
  
  let result = await myContract.methods.borrowDaiCollateralDai(
	borrowDaiCollateralDaiInput
    ).send(fromMyWallet);
  */
  
  let result = await myContract.methods.borrowDaiCollateralDai(
	comptrollerAddress,
    	priceFeedAddress,
    	cTokenAddress,
    	underlyingDecimals,
    	underlyingAddress,
    	mantissa,
    	numUnderlyingToBorrow
    ).send(fromMyWallet);
  
  
  // See the solidity functions logs from "MyLog" event
  // console.log(result.events.MyLog);

  await logBalances();
   /*
  console.log(`\nNow repaying the borrow...\n`);
  const underlyingToRepayBorrow = 5;
  result = await myContract.methods.myErc20RepayBorrow(
      underlyingAddress,
      cTokenAddress,
      (underlyingToRepayBorrow * Math.pow(10, underlyingDecimals)).toString()
    ).send({
    from: myWalletAddress,
    gasLimit: web3.utils.toHex(5000000),
    gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
  });

  await logBalances();  */
};

main().catch(async (err) => {
  console.error('ERROR:', err);

  // Create "events" and "emit" them in your Solidity code.
  // Current contract does not have any.
  let logs = await myContract.getPastEvents('allEvents');
  console.log('Logs: ', logs);
});
