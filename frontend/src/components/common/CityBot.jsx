import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatToAI } from '../../services/chatService';
import useAuth from '../../hooks/useAuth';
import styles from './CityBot.module.css';

const CityBot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username ? user.username : "Citizen";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // --- NEW: LISTENING STATE ---
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hello ${displayName}! I am CityBot. How can I help?`, 
      sender: 'bot' 
    }
  ]);

  // Reset greeting if user changes
  useEffect(() => {
    const newName = user?.username || "Citizen";
    setMessages([{ id: Date.now(), text: `Hello ${newName}! I am CityBot. How can I help?`, sender: 'bot' }]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // --- NEW: VOICE HANDLER ---
  const handleMicClick = () => {
    if (!recognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Optional: Auto-send after speaking
        setTimeout(() => handleSend(null, transcript), 500); 
      };

      recognition.onerror = (event) => {
        console.error("Speech error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    }
  };

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || input;
    
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    const query = textToSend;
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatToAI(query);
      const aiText = response.data.response;

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'bot' }]);

      const lowerText = aiText.toLowerCase();
      if (lowerText.includes('opening events') || lowerText.includes('events page')) {
         navigate('/events');
      } else if (lowerText.includes('parking section') || lowerText.includes('parking page')) {
         navigate('/parking');
      } else if (lowerText.includes('facility') || lowerText.includes('facilities')) {
         navigate('/facilities');
      }

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection Weak. Try again.", sender: 'bot' }]);
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
            {isTyping && <div className={styles.typingIndicator}>Analysing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className={styles.footer}>
            
            {/* --- NEW: MIC BUTTON --- */}
            <button 
                type="button" 
                className={`${styles.micBtn} ${isListening ? styles.micActive : ''}`}
                onClick={handleMicClick}
                title="Speak"
            >
                {isListening ? '🛑' : '🎙️'}
            </button>

            <input 
              type="text" 
              placeholder="Type or Speak..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.sendBtn}>➤</button>
          </form>
        </div>
      )}

      <button className={`${styles.fab} ${isOpen ? styles.hidden : ''}`} onClick={() => setIsOpen(true)}>
        <span className={styles.statusDot}></span>
        A.I.
      </button>
    </div>
  );
};

export default CityBot;