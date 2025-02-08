"use client"

import React, { useState } from 'react'

const ChatInput = ({ socket, addMessage }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      socket.emit("send-chat-message", { sender: 'User1', message, type: 'secondary' });
      setMessage('')
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", "User1");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex">
      <input
        type="text"
        value={message}
        onChange={handleChange}
        className="flex-grow p-2 rounded-l-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
        placeholder="Type your message..."
      />
      <button type="submit" className="p-2 bg-yellow-600 text-white rounded-r-lg dark:bg-blue-500">
        Send
      </button>
    </form>
  )
}

export default ChatInput