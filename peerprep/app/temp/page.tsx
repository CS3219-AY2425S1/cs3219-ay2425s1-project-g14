"use client"

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

// Connect to the Socket.IO server at localhost:5000
const socket: Socket = io('http://localhost:5000');

const SocketIOChat: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  useEffect(() => {
    // Listen for messages from the server
    socket.on('message', (msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Clean up the effect when the component is unmounted
    return () => {
      socket.off('message');
    };
  }, []);

  // Handle joining a room
  const joinRoom = () => {
    if (room.trim()) {
      socket.emit('joinRoom', room);
      setCurrentRoom(room);
      setMessages([]); // Clear previous messages when joining a new room
    }
  };

  // Handle leaving the room
  const leaveRoom = () => {
    if (currentRoom) {
      socket.emit('leaveRoom', currentRoom);
      setCurrentRoom(null);
    }
  };

  // Handle sending a message
  const sendMessage = () => {
    if (currentRoom && message.trim()) {
      socket.emit('sendMessage', { room: currentRoom, message });
      setMessage(''); // Clear the message input after sending
    }
  };

  return (
      <div>
        <h1>Socket.IO Chat Room</h1>

        {/* Room join/leave section */}
        <div>
          <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
          />
          <button onClick={joinRoom}>Join Room</button>
          <button onClick={leaveRoom} disabled={!currentRoom}>
            Leave Room
          </button>
        </div>

        {/* Message input section */}
        {currentRoom && (
            <div>
              <h2>Room: {currentRoom}</h2>
              <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message"
              />
              <button onClick={sendMessage}>Send Message</button>
            </div>
        )}

        {/* Messages display */}
        <div>
          <h3>Messages:</h3>
          {messages.length === 0 ? (
              <p>No messages yet</p>
          ) : (
              <ul>
                {messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                ))}
              </ul>
          )}
        </div>
      </div>
  );
};

export default SocketIOChat;
