import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // <--- FIXED: Use api directly
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

  // --- FIX 1: Initialize Speech Recognition Only Once ---
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

  // Update greeting if user logs in/out
  useEffect(() => {
    const newName = user?.username || "Citizen";
    setMessages(prev => [
      ...prev, 
      { id: Date.now(), text: `Hello ${newName}! I am CityBot. How can I help?`, sender: 'bot' }
    ]);
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // --- FIX 2: Better Voice Handler ---
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
      try {
        recognition.start();
      } catch (err) {
        console.warn("Mic already started", err);
      }

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

    // 1. Add User Message
    const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    setInput('');
    setIsTyping(true);

    try {
      // 2. Call Backend API
      const response = await api.post('/analytics/chat/', { message: textToSend });
      const aiText = response.data.response;

      // 3. Add AI Response
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'bot' }]);

      // 4. Smart Navigation Logic
      const lowerText = aiText.toLowerCase();
      if (lowerText.includes('/events')) navigate('/events');
      else if (lowerText.includes('/parking')) navigate('/parking');
      else if (lowerText.includes('/facilities')) navigate('/facilities');
      else if (lowerText.includes('/profile')) navigate('/profile');

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having trouble reaching the city servers.", sender: 'bot' }]);
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <line x1="18" y1="6" x2="6" y2="18"></line>
             <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <>
            <div className={styles.pulseRing}></div>
            {/* Your Custom Chat Icon */}
            <svg fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 45.342 45.342">
              <path d="M40.462,19.193H39.13v-1.872c0-3.021-2.476-5.458-5.496-5.458h-8.975v-4.49c1.18-0.683,1.973-1.959,1.973-3.423c0-2.182-1.771-3.95-3.951-3.95c-2.183,0-3.963,1.769-3.963,3.95c0,1.464,0.785,2.74,1.965,3.423v4.49h-8.961c-3.021,0-5.448,2.437-5.448,5.458v1.872H4.893c-1.701,0-3.091,1.407-3.091,3.108v6.653c0,1.7,1.39,3.095,3.091,3.095h1.381v1.887c0,3.021,2.427,5.442,5.448,5.442h2.564v2.884c0,1.701,1.393,3.08,3.094,3.08h10.596c1.701,0,3.08-1.379,3.08-3.08v-2.883h2.578c3.021,0,5.496-2.422,5.496-5.443V32.05h1.332c1.701,0,3.078-1.394,3.078-3.095v-6.653C43.54,20.601,42.165,19.193,40.462,19.193z"/>
            </svg>
          </>
        )}
      </button>
    </div>
  );
};

export default CityBot;