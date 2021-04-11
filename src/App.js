import logo from './logo.svg';
import './App.css';

import { MessageNFT_Abi } from './abis';
import React, { useState } from 'react';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider);
const { REACT_APP_CONTRACT_ADDR } = process.env;

const MessageNFTContract = new web3.eth.Contract(MessageNFT_Abi, REACT_APP_CONTRACT_ADDR);

function App() {

  const [getCurrentChain, setGetCurrentChain] = useState('');
  const [getCurrentWallet, setGetCurrentWallet] = useState('0x00');
  const [message, setMessage] = useState("");
  const [isPrivateMessage, setIsPrivateMessage] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState("0x00");
  const [messageId, setViewMessage] = useState("0");
  const [getMessage, setGetMessage] = useState("");
  const [getMessageCreator, setGetMessageCreator] = useState('0x00');

  const [tokenId, setTokenId] = useState(0);
  const [transferReceiver, setTransferReceiver] = useState('0x00')

  const handleGetInfo = async (e) => {
    handleGetCurrentChain();
    handleGetCurrentWallet();
  }
  const handleGetCurrentChain = async () => {
    const currentChain = await web3.eth.getChainId();

    if (currentChain == 3) {
      var currentChainDescription = 'Ropsten';
    } else if (currentChain == 1) {
      var currentChainDescription = 'Mainnet';
    } else {
      var currentChainDescription = 'Localhost';
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
    console.log(isPrivateMessage);

    if (message.length == 0) {
      alert('You have not entered a message.');
    } else if (message.length == 100) {
      alert('Your message is longer than 100 characters.');
    } else if (!web3.utils.isAddress(messageRecipient)) {
      alert('You have not entered a valid receiving address.');
    } else {
      const result = await MessageNFTContract.methods.mint(messageRecipient, message, isPrivateMessage).send({ from: account });
      console.log(result);
    }
  }

  const handleRetrieveMessage = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    await MessageNFTContract.methods.viewMessage(messageId).call().then((response) => {
      message = response;
    }).catch((error) => {
      alert('You do not have access to this message.');
    });
    const messageCreator = await MessageNFTContract.methods.viewMessageCreator(messageId).call();
    console.log(message);
    console.log(messageCreator);

    if (message == '' && messageCreator == '0x0000000000000000000000000000000000000000') {
        alert('This message token does not exist.');
    } else if (message == null ) {
        alert('Error!');
    }

    setGetMessage(message);
    setGetMessageCreator(messageCreator);
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
              Private message? &nbsp;
              <input
                type="radio"
                value="false"
                checked={isPrivateMessage === "false"}
                onChange={ e => setIsPrivateMessage(e.target.value)}
              />
              No &nbsp;
              <input
                type="radio"
                value="true"
                checked={isPrivateMessage === "true"}
                onChange={ e => setIsPrivateMessage(e.target.value)}
              />
              Yes
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
