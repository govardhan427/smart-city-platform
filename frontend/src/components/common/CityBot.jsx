import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatToAI } from '../../services/chatService'; // 1. Import new service
import useAuth from '../../hooks/useAuth'; // 2. Import Auth Hook
import styles from './CityBot.module.css';

const CityBot = () => {
  const { user } = useAuth(); // Get user details
  const navigate = useNavigate();
  
  // Determine the name to show
  const displayName = user?.username ? user.username : "Citizen";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 3. Initialize with Personalized Greeting
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hello ${displayName}! I am CityBot. I have access to real-time city data. How can I help?`, 
      sender: 'bot' 
    }
  ]);

  // Reset greeting if user changes (e.g., login/logout)
  useEffect(() => {
    const newName = user?.username || "Citizen";
    setMessages([
      { 
        id: Date.now(), 
        text: `Hello ${newName}! I am CityBot. I have access to real-time city data. How can I help?`, 
        sender: 'bot' 
      }
    ]);
  }, [user]); // Runs whenever 'user' changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]); // Also scroll when opened

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    const query = input;
    setInput('');
    setIsTyping(true);

    try {
      // 4. Use the new service function
      const response = await sendChatToAI(query);
      const aiText = response.data.response;

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'bot' }]);

      // Smart Navigation Logic
      const lowerText = aiText.toLowerCase();
      if (lowerText.includes('opening events') || lowerText.includes('events page')) {
         navigate('/events');
      } else if (lowerText.includes('parking section') || lowerText.includes('parking page')) {
         navigate('/parking');
      } else if (lowerText.includes('facility') || lowerText.includes('facilities')) {
         navigate('/facilities');
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "My connection to the City Network is weak. Please try again.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
               <span style={{fontSize:'1.2rem'}}>🤖</span> 
               <span>CITY A.I.</span>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>&times;</button>
          </div>
          
          <div className={styles.body}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.bot}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className={styles.typingIndicator}>Analysing data...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className={styles.footer}>
            <input 
              type="text" 
              placeholder="Ask about events, parking..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.sendBtn}>➤</button>
          </form>
        </div>
      )}

      <button className={`${styles.fab} ${isOpen ? styles.hidden : ''}`} onClick={() => setIsOpen(true)}>
        A.I
      </button>
    </div>
  );
};

export default CityBot;