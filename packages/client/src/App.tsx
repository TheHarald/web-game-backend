// import { ChatEvent } from '@web-game/shared';
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';


const socket: Socket = io('http://localhost:5000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  // const event: ChatEvent = ChatEvent.Message



  useEffect(() => {
    socket.on('chat message', (msg: string) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  return (
    <div className="App">
      <h1>Chat App</h1>
      <div>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;