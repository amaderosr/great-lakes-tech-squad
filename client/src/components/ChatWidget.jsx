import React, { useState } from 'react';
import axios from 'axios';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hi! I’m your AI assistant. How can I help today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true); // Start typing animation

    try {
      const res = await axios.post('https://great-lakes-tech-squad.onrender.com/api/ai', {
        message: input,
      });

      const botReply = { from: 'bot', text: res.data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        from: 'bot',
        text: '⚠️ Something went wrong.',
      }]);
    } finally {
      setIsTyping(false); // Stop typing animation
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };

    recognition.onerror = (event) => {
      console.error('Voice error:', event.error);
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="bg-white w-80 h-96 shadow-lg rounded-lg flex flex-col">
          <div className="bg-blue-600 text-white px-4 py-2 font-bold rounded-t-lg">
            Great Lakes Assistant
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  msg.from === 'user' ? 'bg-blue-100 self-end text-right' : 'bg-gray-100 self-start'
                }`}
              >
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div className="p-2 rounded-lg bg-gray-100 self-start text-sm italic animate-pulse">
                Assistant is typing...
              </div>
            )}
          </div>

          <div className="p-2 border-t flex">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 ml-1 rounded text-sm"
            >
              Send
            </button>
            <button
              onClick={startVoiceInput}
              className="bg-gray-600 text-white px-3 ml-1 rounded text-sm"
            >
              🎙️
            </button>
          </div>
        </div>
      )}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close Chat' : '💬 Chat'}
      </button>
    </div>
  );
};

export default ChatWidget;