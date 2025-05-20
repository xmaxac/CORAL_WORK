import React, {useEffect, useState, useContext, useRef} from 'react'
import { ChevronDown, Send } from 'lucide-react'
import { AppContext } from '@/context/AppContext'
import axios from 'axios';

const ChatbotPopup = ({setShowChatbot}) => {
  const {url} = useContext(AppContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey there 👋! I am a chatbot here to help you with any questions you have about Stony Coral Tissue Loss Disease (SCTLD).'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handles user message submission
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Prevent sending empty messages

    const userMessage = message;
    setMessage(''); // Clear input field

    // Add user's message to the chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (!Array.isArray(messages)) {
        throw new Error('Invalid messages array');
      }

      // Send request to the chatbot backend API
      const response = await axios.post(`${url}/api/chatbot/message`, {
        question: userMessage
      });

      if (response.status !== 200) throw new Error('Failed to send message');

      // Extract response data and add chatbot reply to the chat
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (e) {
      console.error('Error:', e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not understand that. Please try again.'
      }]);
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };

  return (
    <div className='fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center'>
      <div className='w-96 h-[600px] bg-white rounded-2xl shadow-xl'>
        {/* Header */}
        <div className='bg-blue-400 flex items-center justify-between p-4 rounded-t-2xl'>
          <div className='flex gap-3 items-center'>
            <h2 className='text-white text-lg font-semibold '>Chatbot</h2>
          </div>
          <button 
            onClick={() => setShowChatbot(false)}
            className='h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white'>
            <ChevronDown className='h-5 w-5'/>
          </button>
        </div>
        {/* Chat Messages */}
        <div className="h-[460px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center'>
                  🤖
                </div>
              )}
              <div
                className={`p-4 max-w-[75%] rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-blue-50 rounded-tl-none'}`}
              >
                <p className={msg.role === 'user' ? 'text-white' : 'text-gray-800'}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className='flex gap-3'>
              <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center'>
                🤖
              </div>
              <div className='bg-blue-50 rounded-2xl rounded-tl-none p-4'>
                <p className='text-gray-800'>Typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Message...' 
              className='flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500' 
              required
            />
            <button
              type='submit'
              disabled={isLoading}
              className='h-10 w-10 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white'
            >
              <Send className='h-5 w-5'/>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatbotPopup