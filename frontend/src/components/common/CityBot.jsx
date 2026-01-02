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
  
  // --- LISTENING STATE ---
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

  // --- VOICE HANDLER ---
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
      
      {/* The Chat Window (Glass Panel) */}
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

          {/* Input Area */}
          <form onSubmit={handleSend} className={styles.footer}>
            
            {/* Mic Button */}
            <button 
                type="button" 
                className={`${styles.micBtn} ${isListening ? styles.micActive : ''}`}
                onClick={handleMicClick}
                title="Speak"
            >
                {isListening ? (
                  <span className={styles.listeningWave}>||||</span> 
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (The Trigger) */}
      <button className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <span style={{fontSize: '1.5rem'}}>&times;</span>
        ) : (
          <>
            <div className={styles.pulseRing}></div>
            <span style={{fontSize: '1.5rem'}}>🤖</span>
          </>
        )}
      </button>
    </div>
  );
};

export default CityBot;