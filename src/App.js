import logo from './logo.svg';
import './App.css';

import { MessageNFT_Abi } from './abis';
import React, { useState } from 'react';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider);
const { REACT_APP_CONTRACT_ADDR } = process.env;

const MessageNFTContract = new web3.eth.Contract(MessageNFT_Abi, REACT_APP_CONTRACT_ADDR);


function App() {

  const [getContractAddress, setContractAddress] = useState('0x00');
  const [getCurrentChain, setGetCurrentChain] = useState('');
  const [getCurrentWallet, setGetCurrentWallet] = useState('0x00');
  const [message, setMessage] = useState("");
  const [messageRecipient, setMessageRecipient] = useState("0x00");
  const [messageId, setViewMessage] = useState("1");
  const [getMessage, setGetMessage] = useState("");
  const [getMessageCreator, setGetMessageCreator] = useState('0x00');

  const [tokenId, setTokenId] = useState(0);
  const [transferReceiver, setTransferReceiver] = useState('0x00')

  const handleGetInfo = async (e) => {
    await window.ethereum.enable();
    handleGetCurrentChain();
    handleGetCurrentWallet();
    setContractAddress(REACT_APP_CONTRACT_ADDR);
  }

  const handleGetCurrentChain = async () => {
    const currentChain = await web3.eth.getChainId();

    var currentChainDescription = ''

    if (currentChain === 3) {
      currentChainDescription = 'Ropsten';
    } else if (currentChain === 1) {
      currentChainDescription = 'Mainnet';
    } else {
      currentChainDescription = 'Localhost';
    }

    setGetCurrentChain(currentChainDescription);

  }

  const handleGetCurrentWallet = async () => {
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    setGetCurrentWallet(account);
    console.log(account);
  }

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    console.log(message);
    console.log(messageRecipient);

    if (message.length === 0) {
      alert('You have not entered a message.');
    } else if (message.length === 100) {
      alert('Your message is longer than 100 characters.');
    } else if (!web3.utils.isAddress(messageRecipient)) {
      alert('You have not entered a valid receiving address.');
    } else {
      const result = await MessageNFTContract.methods.mint(messageRecipient, message).send({ from: account });
      console.log(result);
    }
  }

  const handleRetrieveMessage = async (e) => {
    e.preventDefault();
    await MessageNFTContract.methods.viewMessage(messageId).call().then((response) => {
      var message = response;
      console.log(message);
      setGetMessage(message);
    }).catch((error) => {
      alert('The token ID does not exist.');
    });

    await MessageNFTContract.methods.viewMessageCreator(messageId).call().then((response) => {
      var messageCreator = response;

      if (messageCreator === '0x0000000000000000000000000000000000000000') {
          alert('This message token does not exist.');
      } else {
        setGetMessageCreator(messageCreator);
      }
    }).catch((error) => {
      alert('Error!');
    });




  }

  const handleTransferMessageNFT = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    console.log(tokenId);
    if (typeof(tokenId) != 'number') {
      alert('You have not entered a valid token ID.');
    } else if (!web3.utils.isAddress(transferReceiver)) {
      alert('You have not entered a valid receiving address.');
    } else {
      const result = await MessageNFTContract.methods.transferFrom(account, transferReceiver, tokenId).send({ from: account });
      console.log(result);
    }
  }

  return (
    <div className="App">
      <header className="App-header">

        <button
          onClick={handleGetInfo}
          type="button" >
          Connect Wallet
        </button>
        <p>
          Current Chain: &nbsp;
          { getCurrentChain }
        </p>
        <p>
          Current Wallet: &nbsp;
          { getCurrentWallet }
        </p>
        <p>
          Contract address: &nbsp;
          { getContractAddress }
        </p>

        <form onSubmit={handleRetrieveMessage}>
          <p>
            <label>
              Enter token ID to retrieve message: &nbsp;
              <input
                type="number"
                name="name"
                value={messageId}
                onChange={ e => setViewMessage(e.target.value) } />
            </label>
          </p>
          <p>
            <input type="submit" value="Retrieve" />
          </p>
        </form>
        <p>Message retrieved: &nbsp;
        { getMessage }
        </p>
        <p>From: &nbsp;
        { getMessageCreator }
        </p>

        <form onSubmit={handleCreateMessage}>
          <p>
            <label>
              Message to create: &nbsp;
              <input
                type="text"
                name="name"
                value={message}
                onChange={ e => setMessage(e.target.value) } />
            </label>
          </p>

          <p>
            <label>
              Address to send message to: &nbsp;
              <input
                type="text"
                name="name"
                value={messageRecipient}
                onChange={ e => setMessageRecipient(e.target.value) } />
            </label>
          </p>
          <p>
            <input type="submit" value="Create" />
          </p>
        </form>

        <form onSubmit={handleTransferMessageNFT}>
          <p>
            <label>
              Message token ID to transfer: &nbsp;
              <input
                type="number"
                name="name"
                value={tokenId}
                onChange={ e => setTokenId(e.target.value) } />
            </label>
          </p>
          <p>
            <label>
              Address to transfer message to: &nbsp;
              <input
                type="text"
                name="name"
                value={transferReceiver}
                onChange={ e => setTransferReceiver(e.target.value) } />
            </label>
          </p>
          <p>
            <input type="submit" value="Transfer" />
          </p>
        </form>

      </header>
    </div>
  );
}

export default App;
