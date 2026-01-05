import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // <--- Use your configured API directly
import useAuth from '../../hooks/useAuth';
import styles from './CityBot.module.css';

const CityBot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username ? user.username : "Citizen";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);

  // --- FIX: PERSIST SPEECH RECOGNITION INSTANCE ---
  // We use useMemo so we don't recreate the 'recognition' object on every render
  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return SpeechRecognition ? new SpeechRecognition() : null;
  }, []);

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hello ${displayName}! I am CityBot. How can I help?`, 
      sender: 'bot' 
    }
  ]);

  useEffect(() => {
    const newName = user?.username || "Citizen";
    setMessages([{ id: Date.now(), text: `Hello ${newName}! I am CityBot. How can I help?`, sender: 'bot' }]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // --- VOICE HANDLER (FIXED) ---
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
        // Optional: Auto-send after 1 second
        setTimeout(() => handleSend(null, transcript), 1000); 
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
    
    setInput('');
    setIsTyping(true);

    try {
      // --- FIX: USE API DIRECTLY ---
      const response = await api.post('/analytics/chat/', { message: textToSend });
      const aiText = response.data.response;

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'bot' }]);

      // --- SMART NAVIGATION LOGIC ---
      const lowerText = aiText.toLowerCase();
      // We check if the AI specifically mentioned a path/url in the text response
      if (lowerText.includes('/events')) navigate('/events');
      else if (lowerText.includes('/parking')) navigate('/parking');
      else if (lowerText.includes('/facilities')) navigate('/facilities');
      else if (lowerText.includes('/profile')) navigate('/profile');

    } catch (error) {
      console.error("Bot Error", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection Weak. Try again.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* The Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.botIdentity}>
               <div className={styles.botDot}></div>
               <span>City Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>&times;</button>
          </div>
          
          {/* Chat Area */}
          <div className={styles.body}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.bot}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typingIndicator}>
                <span>●</span><span>●</span><span>●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className={styles.footer}>
            
            <button 
                type="button" 
                className={`${styles.micBtn} ${isListening ? styles.micActive : ''}`}
                onClick={handleMicClick}
                title="Speak"
            >
                {isListening ? (
                  <span className={styles.listeningWave}>|||</span> 
                ) : (
                  <span style={{fontSize: '18px'}}>🎤</span>
                )}
            </button>

            <input 
              type="text" 
              placeholder="Ask CityBot..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.input}
            />
            
            <button type="submit" className={styles.sendBtn}>
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
             <span style={{fontSize: '24px', fontWeight: 'bold'}}>✕</span>
        ) : (
          <>
            <div className={styles.pulseRing}></div>
            <span style={{fontSize: '24px'}}>🤖</span>
          </>
        )}
      </button>
    </div>
  );
};

export default CityBot;