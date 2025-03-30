import React, { useState } from 'react';

const ChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input) {
            setMessages([...messages, { text: input, sender: 'user' }]);
            setInput('');
            // Here you would typically send the message to the AI for processing
        }
    };

    return (
        <div>
            <h2>Chat with AI</h2>
            <div>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default ChatComponent;
