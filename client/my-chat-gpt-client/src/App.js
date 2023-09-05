import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';  // 引入CSS樣式檔
import Header from './component/header.js' // 引入header.js

const socket = io('https://chatgpt-ws.tunagood.site/');

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    socket.on('message', (message) => {
      updateLastMessage(message);
    });
  }, []);

  const updateLastMessage = (message) => {
    setMessages((messages) => {
      const newMessages = [...messages];
      newMessages[newMessages.length - 1] = { text: message, isBot: true };
      return newMessages;
    });
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = (event) => {
    // 檢查是否為空字串
    if (inputValue.trim() === '') {
      return;
    }
    event.preventDefault();
    setMessages((messages) => [...messages, { text: inputValue, isBot: false }]);
    setMessages((messages) => [...messages, { text: "思考中...", isBot: true }]);
    socket.emit('message', inputValue);
    setInputValue('');
  };

  return (
    <div className="chat-container">
      <Header></Header>
      <div className="chat-box">
        {messages.map((message, index) => {
          const messageClassName = `chat-message ${message.isBot ? "bot-message" : "user-message"}`;

          return (
            <div key={index} className={messageClassName}>
              {message.text}
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <textarea type="text" placeholder='Send a message' value={inputValue} onChange={handleInputChange} className="chat-input" />

        <input type="submit" value="Submit" className="chat-submit" />
      </form>
    </div>
  );
}

export default App;
